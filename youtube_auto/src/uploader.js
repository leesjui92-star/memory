const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COOKIES_PATH = path.join(__dirname, '../data/youtube_cookies.json');

async function uploadToYouTube(videoPath, title, description) {
  console.log('🚀 진짜 크롬에 연결하여 업로드를 시작합니다...');
  
  // 이미 열려 있는 진짜 크롬에 접속합니다.
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  // 🕵️‍♂️ 스텔스 모드: 구글이 로봇인지 모르게 인식표를 지웁니다.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  // 쿠키가 있다면 로드
  if (fs.existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    await page.context().addCookies(cookies);
  }

  await page.goto('https://studio.youtube.com');

  // 로그인 여부 확인
  if (page.url().includes('accounts.google.com')) {
    console.log('🔑 로그인이 필요합니다. 브라우저 창에서 직접 로그인해 주세요!');
    console.log('로그인이 완료될 때까지 기다리는 중...');
    await page.waitForURL('https://studio.youtube.com/**', { timeout: 0 });
    
    // 로그인 성공 후 쿠키 저장
    const cookies = await page.context().cookies();
    if (!fs.existsSync(path.join(__dirname, '../data'))) fs.mkdirSync(path.join(__dirname, '../data'));
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    console.log('✅ 로그인 정보가 저장되었습니다.');
  }

  try {
    // 업로드 버튼 클릭
    console.log('📦 영상 업로드 중...');
    await page.click('#upload-icon');
    
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('#select-files-button'),
    ]);
    await fileChooser.setFiles(videoPath);

    // 제목 및 설명 입력 (시간이 좀 걸릴 수 있음)
    await page.waitForSelector('#textbox[aria-label="제목(필수)"]');
    await page.fill('#textbox[aria-label="제목(필수)"]', title);
    await page.fill('#textbox[aria-label="설명"]', description + "\n#Shorts #드라마 #코다리숏츠");

    // 아동용 아님 체크
    await page.click('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]');

    // 다음 버튼 연타 (3번)
    for(let i=0; i<3; i++) {
        await page.click('#next-button');
        await page.waitForTimeout(2000);
    }

    // 공개 설정 및 게시
    await page.click('tp-yt-paper-radio-button[name="PUBLIC"]');
    await page.click('#done-button');

    console.log('🎉 업로드 완료! 영상이 처리되는 데 시간이 걸릴 수 있습니다.');
    await page.waitForTimeout(5000);
  } catch (err) {
    console.error('❌ 업로드 중 에러 발생:', err.message);
  } finally {
    // 진짜 크롬을 끄지 않도록 close를 주석 처리합니다.
    // await browser.close(); 
  }
}

if (require.main === module) {
  const videoPath = path.join(__dirname, '../output/final_shorts.mp4');
  uploadToYouTube(videoPath, "테스트 영상", "코다리 부장이 자동으로 올린 영상입니다.");
}

module.exports = { uploadToYouTube };
