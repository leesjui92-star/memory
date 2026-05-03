require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COOKIES_PATH = path.join(__dirname, 'naver_cookies.json');

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

  // 도움말 무조건 끄기
  try { 
    await page.evaluate(() => {
      document.querySelectorAll('.se-popup-close, .se-help-layer-close').forEach(b => b.click());
    });
  } catch (e) {}

  console.log('제목 및 본문 입력 중...');
  await page.click('.se-title-text');
  await page.keyboard.type(postData.title, { delay: 50 });
  await page.click('.se-content');
  await page.keyboard.type(postData.body, { delay: 1 }); 
  await page.waitForTimeout(3000);

  console.log('1차 발행 버튼 클릭 (상단 초록색)...');
  await page.evaluate(() => {
    const btn = document.querySelector('.publish_btn__Y6piz') || 
                Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('발행') && !b.innerText.includes('예약'));
    if (btn) btn.click();
  });
  
  console.log('발행 설정창 대기...');
  await page.waitForTimeout(3000);

  console.log('2차 최종 발행 버튼 강제 클릭...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('발행'));
    const finalBtn = btns[btns.length - 1]; 
    if (finalBtn) finalBtn.click();
  });

  console.log('🚀 서버 전송 및 완료 대기 (20초)...');
  await page.waitForTimeout(20000); 
  console.log('🎉 모든 프로세스 완료!');
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  try {
    const postData = {
      title: "여름철 냉장고 파먹기! 식비 아끼는 꿀팁 5가지 🍎",
      body: `안녕하세요! 오늘은 여름철 식비를 절반으로 줄여줄 '냉장고 파먹기' 꿀팁을 가져왔습니다.

[1. 냉장고 지도 만들기]
냉장고 문 앞에 무엇이 들어있는지 적어두세요.

[2. 유통기한 임박 재료 우선순위]
빨리 먹어야 할 재료부터 요리하세요.

[3. 소분 보관의 마법]
재료를 미리 다듬어서 냉동 보관하면 버리는 게 없어요.

오늘부터 바로 시작해보세요! #절약 #살림꿀팁 #냉장고파먹기 #짠테크 #생활정보`
    };
    await naverLogin(page);
    await postToNaver(page, postData);
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  } finally {
    await browser.close();
  }
}

main();
