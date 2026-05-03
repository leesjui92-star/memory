require('dotenv').config();
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const COOKIES_PATH = path.join(__dirname, 'naver_cookies.json');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generatePost() {
  console.log('🤖 AI 글 작성 중...');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `네이버 블로그에 올릴 유익한 생활 팁이나 식재료 관리 정보를 하나 골라서 1000자 이상으로 아주 길고 정성스럽게 써줘. 제목도 포함해줘.`;
  
  for (let i = 0; i < 3; i++) {
    try {
      let result = await model.generateContent(prompt);
      const text = result.response.text();
      const lines = text.split('\n');
      const title = lines[0].replace(/#/g, '').trim();
      const body = lines.slice(1).join('\n').trim();
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

async function naverLogin(page) {
  if (fs.existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    await page.context().addCookies(cookies);
    await page.goto('https://www.naver.com');
    await page.waitForTimeout(2000);
    if (await page.$('.MyView-module__my_area___Q2Q4Z') || await page.$('#account')) return;
  }
  await page.goto('https://nid.naver.com/nidlogin.login');
  await page.fill('#id', process.env.NAVER_ID);
  await page.fill('#pw', process.env.NAVER_PW);
  await page.click('.btn_login');
  await page.waitForURL('https://www.naver.com/**', { timeout: 60000 }).catch(() => {});
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(await page.context().cookies(), null, 2));
}

async function postToNaver(page, postData) {
  console.log(`📝 포스팅 시작: ${postData.title}`);
  await page.goto('https://blog.naver.com/PostWriteForm.naver?blogId=leesjui');
  await page.waitForTimeout(7000);

  // 제목 및 본문 입력
  console.log('제목 및 본문 입력 중...');
  await page.click('.se-title-text');
  await page.keyboard.type(postData.title, { delay: 50 });
  await page.click('.se-content');
  await page.keyboard.type(postData.body, { delay: 1 }); 
  await page.waitForTimeout(3000);

  // 1차 발행 버튼 클릭 (자바스크립트 강제 실행 방식)
  console.log('1차 발행 버튼 강제 클릭...');
  await page.evaluate(() => {
    const btn = document.querySelector('.publish_btn__Y6piz') || 
                Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('발행') && !b.innerText.includes('예약'));
    if (btn) btn.click();
  });
  
  await page.waitForTimeout(3000);

  // 2차 최종 발행 버튼 클릭
  console.log('2차 최종 발행 버튼 강제 클릭...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('발행'));
    const finalBtn = btns[btns.length - 1]; // 가장 마지막(보통 팝업창) 버튼
    if (finalBtn) finalBtn.click();
  });

  console.log('🚀 서버 전송 대기 (20초)...');
  await page.waitForTimeout(20000); 
  console.log('🎉 포스팅 완료!');
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  try {
    const postData = await generatePost();
    await naverLogin(page);
    await postToNaver(page, postData);
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  } finally {
    await browser.close();
  }
}

main();
