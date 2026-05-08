require('dotenv').config();
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const BLOG_ID = process.env.BLOG_ID;
const USER_DATA_DIR = path.join(__dirname, 'user_data');

async function generateBlogPost() {
  console.log('🤖 제미나이 AI가 글감을 고민하고 있습니다...');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const prompt = `
    너는 15년 경력의 '반려견 건강 관리 수의사'이자 10만 구독자를 보유한 파워 블로거야.
    반려견을 키우는 사람들에게 실질적으로 도움이 되는 고품질 블로그 포스팅을 작성해 줘.
    
    [작성 규칙]
    1. 첫 줄은 매력적인 포스팅 제목을 작성해. (텍스트만)
    2. 본문은 HTML 태그(<h2>, <p>, <strong>, <br>, <ul>, <li>)를 사용해서 아주 상세하게 작성해. (최소 1,500자 이상)
    3. 마지막에 [태그: 단어1, 단어2, 단어3] 형식으로 태그 5개를 적어줘.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const lines = response.split('\n');
  const title = lines[0].replace(/#/g, '').trim();

  let content = '';
  let tags = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('[태그:')) {
      tags = line.replace('[태그:', '').replace(']', '').trim();
    } else {
      content += line + '\n';
    }
  }

  return { title, content, tags };
}

async function postToBlogger() {
  console.log('🐟 브라우저 자동 포스팅 엔진 가동 🐟');
  
  const postData = await generateBlogPost();
  console.log(`✨ AI 글 작성 완료: ${postData.title}`);

  let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(executablePath)) {
    executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  }

  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: executablePath,
    args: [
      '--start-maximized', 
      '--disable-blink-features=AutomationControlled',
      '--use-fake-ui-for-media-stream',
      '--disable-infobars'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  
  try {
    console.log('🌐 블로그 접속 중...');
    await page.goto(`https://www.blogger.com/blog/posts/${BLOG_ID}`);

    // 로그인 여부 확인
    if (page.url().includes('accounts.google.com')) {
      console.log('⚠️ 로그인이 필요합니다. 브라우저 창에서 로그인을 완료해 주세요!');
      await page.waitForURL(`**/blog/posts/${BLOG_ID}**`, { timeout: 300000 });
      console.log('✅ 로그인 확인되었습니다.');
    }

    console.log('🌐 블로그 접속 중...');
    await page.goto(`https://www.blogger.com/blog/posts/${BLOG_ID}?hl=ko`, { waitUntil: 'load' });
    await page.waitForTimeout(5000); // 충분히 로딩되길 대기

    console.log('📝 새 글 쓰기 버튼 클릭 시도...');
    
    // 화면에 보이는 모든 버튼 후보군을 가져옵니다.
    const selectors = [
        'div[aria-label*="새 글"]',
        'div[role="button"]:has-text("새 글")',
        'span:has-text("새 글")',
        'a[href*="/blog/post/edit/new/"]'
    ];

    let clicked = false;
    for (const selector of selectors) {
        const elements = await page.$$(selector);
        for (const el of elements) {
            if (await el.isVisible()) {
                console.log(`✅ 보이는 버튼 발견! (${selector}) 클릭 중...`);
                await el.click({ force: true });
                clicked = true;
                break;
            }
        }
        if (clicked) break;
    }

    if (!clicked) {
        console.log('⚠️ 버튼을 찾지 못해 강제 주소 이동을 시도합니다.');
        await page.goto(`https://www.blogger.com/blog/post/edit/${BLOG_ID}/new?hl=ko`);
    }
    
    console.log('⏳ 편집 화면 진입 대기 중...');
    await page.waitForURL(url => url.href.includes('/post/edit/'), { timeout: 30000 });
    await page.waitForTimeout(5000);

    console.log('✍️ 제목 입력 중...');
    // 제목 칸 찾기 (모든 가능한 경우의 수)
    const titleSelectors = [
        'input[aria-label="제목"]',
        'input[placeholder="제목"]',
        '.whsOnd.zHQkBf',
        'input[type="text"][maxlength="255"]'
    ];
    
    let titleInput = null;
    for (const selector of titleSelectors) {
        try {
            titleInput = await page.waitForSelector(selector, { timeout: 5000 });
            if (titleInput) break;
        } catch (e) {}
    }

    if (!titleInput) {
        console.log('⚠️ 제목 칸을 특정하지 못해 첫 번째 입력창을 시도합니다.');
        titleInput = page.locator('input[type="text"]').first();
    }


    console.log('✍️ 제목 입력 중...');
    titleInput = await page.waitForSelector('input[aria-label="제목"], input[class*="whsOnd"]', { timeout: 30000 });
    await titleInput.click();
    await page.waitForTimeout(500);
    await titleInput.fill('');
    await page.keyboard.type(postData.title, { delay: 50 });
    await page.waitForTimeout(1000); // 제목 입력 후 잠시 대기

    console.log('📄 본문 영역(흰 공간) 클릭 및 입력 중...');
    let editorFilled = false;
    try {
        // 사용자님이 그려주신 '본문' 영역(아이프레임)을 찾아 클릭
        const frames = page.frames();
        for (const frame of frames) {
            const body = await frame.$('body[contenteditable="true"]');
            if (body) {
                const box = await body.boundingBox();
                if (box) {
                    // 본문 영역의 정중앙을 클릭합니다.
                    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
                    console.log('✅ 본문 영역 중앙 클릭 완료');
                    await page.waitForTimeout(500);
                    
                    await frame.evaluate((content) => {
                        document.body.innerHTML = content;
                    }, postData.content);
                    editorFilled = true;
                    break;
                }
            }
        }
    } catch (e) {
        console.log('⚠️ 본문 입력 중 에러:', e.message);
    }

    if (!editorFilled) {
        console.log('⚠️ 본문 입력창을 찾지 못해 탭 키로 이동 시도...');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        await page.keyboard.type(postData.content);
    }

    console.log('🚀 우측 상단 주황색 [게시] 버튼 클릭...');
    try {
        // 정확히 '게시'라고 써진 버튼만 찾기 (미리보기 절대 금지)
        const publishButton = await page.waitForSelector('div[role="button"][aria-label="게시"], div[data-tooltip="게시"]', { timeout: 10000 });
        if (publishButton) {
            console.log('✅ 진짜 주황색 게시 버튼 클릭!');
            await publishButton.click({ force: true });
            
            await page.waitForTimeout(2000);
            
            // 최종 확인 팝업
            const confirmBtns = await page.$$('div[role="button"], span, button');
            for (const cBtn of confirmBtns) {
                const cText = await cBtn.innerText();
                if ((cText.includes('확인') || cText.includes('Confirm')) && await cBtn.isVisible()) {
                    await cBtn.click({ force: true });
                    console.log('🎉 포스팅 완료!');
                    return;
                }
            }
        }
    } catch (e) {
        console.log('❌ 발행 과정 중 에러:', e.message);
        // 예비책: 텍스트로 다시 시도
        await page.click('div[role="button"]:has-text("게시")', { force: true });
    }
    await page.waitForTimeout(5000);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await browser.close();
    console.log('🐟 엔진 작동 종료 🐟');
  }
}

postToBlogger();
