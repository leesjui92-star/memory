const { chromium } = require('playwright');
const path = require('path');

async function setup() {
    console.log('🚀 구글 로그인 세션을 저장하기 위한 브라우저를 실행합니다...');
    
    // 세션 정보를 저장할 폴더 경로 (기존 user_data 활용)
    const userDataDir = path.join(__dirname, 'user_data');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // 눈에 보이게 실행
        args: ['--disable-blink-features=AutomationControlled'] // 봇 감지 우회
    });

    const page = await context.newPage();
    
    // Blogger 대시보드로 이동
    await page.goto('https://www.blogger.com/go/signin');

    console.log('\n---------------------------------------------------------');
    console.log('✅ 브라우저에서 구글 로그인을 완료해 주세요!');
    console.log('✅ 로그인이 끝나고 Blogger 대시보드가 보이면 브라우저를 닫지 말고');
    console.log('   이 터미널에서 Ctrl+C를 눌러 종료하거나 브라우저를 수동으로 닫으세요.');
    console.log('---------------------------------------------------------\n');

    // 사용자가 브라우저를 닫을 때까지 대기
    await new Promise(() => {}); 
}

setup().catch(err => {
    console.error('❌ 에러 발생:', err);
});
