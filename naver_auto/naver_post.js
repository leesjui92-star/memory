require('dotenv').config();
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generatePost() {
  const topics = [
    "반려견 산책할 때 주의해야 할 꽃과 식물",
    "강아지 사료 성분표 제대로 보는 법",
    "강아지 치아 관리, 양치질 쉽게 하는 꿀팁",
    "집에서 하는 반려견 건강 체크 리스트",
    "강아지가 먹으면 안 되는 사람 음식 총정리"
  ];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  console.log(`🤖 AI 글 작성 중... (주제: ${topic})`);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
  const prompt = `
당신은 애드포스트 승인을 목표로 하는 반려견 전문 네이버 블로거입니다. 
주제: ${topic}

[글쓰기 규칙]
1. **네이버 블로그 스타일**: 친근한 이웃집 언니/오빠 같은 말투(~해요, ~더라고요, ~인 것 같아요)를 사용하세요.
2. **분량**: 아주 상세하고 유익한 정보를 포함하여 1500자 이상으로 길게 작성하세요. (AdPost 승인 핵심)
3. **구조**: 소제목을 명확히 나누고, 이모지(🐶, ✨, ✅)를 적절히 섞어주세요.
4. **개인적 감성**: "오늘 날씨가 좋아서 산책 다녀왔는데...", "저도 예전에 고민하던 부분이라..." 같은 가상의 개인적 경험을 서두에 넣어 AI 느낌을 지워주세요.
5. **해시태그**: 글 맨 마지막에 주제와 관련된 인기 해시태그를 10개 정도 넣어주세요. (예: #강아지산책 #반려견건강 #댕댕이 등)
6. [TITLE]과 [CONTENT]로 명확히 구분해서 출력하세요.
`;
  
  for (let i = 0; i < 3; i++) {
    try {
      let result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const title = text.match(/\[TITLE\](.*)/)?.[1]?.replace(/#/g, '').trim() || topic;
      const body = text.split('[CONTENT]')[1]?.trim() || text;
      
      return { title, body };
    } catch (error) {
      if (error.message.includes('429')) {
        console.log(`⏳ 대기 중... (${i+1}/3)`);
        await new Promise(r => setTimeout(r, 35000));
      } else throw error;
    }
  }
  throw new Error('AI 생성 실패');
}

async function postToNaver(page, postData) {
  console.log(`📝 네이버 블로그 포스팅 시작: ${postData.title}`);
  
  // 에디터 로딩 대기 (여러 셀렉터 시도)
  console.log('⏳ 에디터 로딩 대기...');
  const editorSelector = '.se-title-text, .se-content, .se-main-container';
  await page.waitForSelector(editorSelector, { timeout: 60000 }).catch(() => {
    console.log('⚠️ 에디터 로딩 지연 중... 직접 글쓰기 버튼을 눌렀는지 확인해 주세요.');
  });

  // 팝업 제거
  await page.evaluate(() => {
    const closeButtons = document.querySelectorAll('.se-popup-close, .se-help-layer-close, .se-popup-button-cancel, .se-popup-button-close');
    closeButtons.forEach(btn => btn.click());
  });
  await page.waitForTimeout(2000);

  // 제목 입력
  console.log('✍️ 제목 입력 중...');
  try {
    await page.click('.se-title-text', { timeout: 5000 });
    await page.keyboard.type(postData.title, { delay: 30 });
  } catch (e) {
    console.log('⚠️ 제목 입력창 클릭 실패, 강제 입력을 시도합니다.');
    await page.evaluate((t) => {
      const el = document.querySelector('.se-title-text');
      if (el) { el.innerText = t; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, postData.title);
  }
  
  // 본문 입력
  console.log('✍️ 본문 입력 중...');
  try {
    await page.click('.se-content', { timeout: 5000 });
    await page.keyboard.type(postData.body, { delay: 1 }); 
  } catch (e) {
    console.log('⚠️ 본문 입력창 클릭 실패, 강제 입력을 시도합니다.');
    await page.evaluate((b) => {
      const el = document.querySelector('.se-content');
      if (el) { el.innerHTML = b.replace(/\n/g, '<br>'); el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, postData.body);
  }
  await page.waitForTimeout(3000);

  // 발행 버튼
  console.log('🚀 발행 시도...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, div[role="button"]')).find(b => b.innerText.includes('발행'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);
  
  // 최종 발행 버튼 (팝업)
  console.log('🚀 최종 발행 버튼 클릭...');
  await page.evaluate(() => {
    const popup = document.querySelector('.se-popup-publish');
    const btn = popup ? Array.from(popup.querySelectorAll('button')).find(b => b.innerText.includes('발행')) : 
                Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('발행') && b.offsetHeight > 0);
    if (btn) btn.click();
  });
  
  console.log('🎉 모든 과정 완료!');
  await page.waitForTimeout(10000);
}

async function run() {
  console.log(`⏰ [${new Date().toLocaleString()}] 네이버 블로그 자동 포스팅 실행`);
  
  const userDataDir = path.join(__dirname, 'naver_user_data');
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  
  try {
    const postData = await generatePost();
    
    const writeUrl = `https://blog.naver.com/PostWriteForm.naver?blogId=${process.env.NAVER_ID}`;
    console.log(`📄 글쓰기 페이지 이동: ${writeUrl}`);
    await page.goto(writeUrl);
    await page.waitForTimeout(5000);

    // 로그인 체크 루프
    let retryCount = 0;
    while (retryCount < 18) { // 총 3분 (10초 * 18)
      const isEditor = await page.$('.se-title-text, .se-content') !== null;
      if (isEditor) {
        console.log('✅ 에디터 감지됨! 포스팅을 계속합니다.');
        break;
      }
      
      console.log(`🔐 대기 중... (${retryCount + 1}/18) 만약 로그인 화면이라면 로그인을 완료하고 '글쓰기' 버튼을 눌러주세요.`);
      
      // 혹시 로그인은 했는데 리다이렉트가 안 되었다면 다시 이동 시도
      if (page.url().includes('blog.naver.com') && !page.url().includes('PostWriteForm')) {
        console.log('🔄 글쓰기 페이지로 재이동합니다...');
        await page.goto(writeUrl);
      }
      
      await page.waitForTimeout(10000);
      retryCount++;
    }

    await postToNaver(page, postData);
  } catch (err) {
    console.error('❌ 에러:', err.message);
    await page.screenshot({ path: path.join(__dirname, 'error_screenshot.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

// 1. 즉시 실행 (테스트용)
console.log('🧪 네이버 블로그 테스트 포스팅을 시작합니다...');
run();

// 2. 매일 오전 9시 30분 예약 (Asia/Seoul)
cron.schedule('30 9 * * *', () => {
  run();
}, {
  scheduled: true,
  timezone: "Asia/Seoul"
});

console.log('⏰ 네이버 블로그: 매일 오전 9시 30분 예약 완료! (Asia/Seoul)');
