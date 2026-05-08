const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const BLOG_ID = process.env.BLOG_ID;
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

async function generatePostContent(topic) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
        const prompt = `
당신은 애드센스 승인을 목표로 하는 반려견 전문 파워블로거입니다. 
주제: ${topic}

[글쓰기 및 AdSense 최적화 규칙]
1. **독창적인 정보 제공**: 검색자가 실제로 도움을 받을 수 있는 유용한 정보를 상세히 작성하세요. (글자 수 공백 제외 1000자 이상 권장)
2. **구조화된 글쓰기**: <h2>, <h3> 태그를 활용하여 소제목을 구성하고, 가독성 있게 <p> 태그로 문단을 나누세요.
3. **친근한 구어체**: AI 느낌을 빼기 위해 '~해요', '~더라고요' 같은 말투를 사용하고, 가상의 경험담을 섞어주세요.
4. **연결어 주의**: '결론적으로', '게다가' 같은 표현 대신 '그나저나', '여기서 꿀팁!', '정말 중요한 건' 등의 자연스러운 표현을 쓰세요.
5. **해시태그**: 글 맨 마지막에 주제와 관련된 인기 해시태그를 5~10개 정도 넣어주세요. (예: #강아지 #반려견 #댕댕이 등)
6. **금기어**: 'AI', '인공지능', '챗봇' 등의 단어는 절대 언급하지 마세요.
7. [TITLE], [CONTENT], [LABELS]로 명확히 구분해서 출력하되, [CONTENT] 부분은 바로 블로그에 붙여넣을 수 있는 **HTML 형식**으로 작성하세요. [LABELS]는 쉼표로 구분된 3~5개의 단어로 작성하세요.
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const title = text.match(/\[TITLE\](.*)/)?.[1]?.trim() || topic;
        const content = text.split('[CONTENT]')[1]?.split('[LABELS]')[0]?.trim() || text;
        const labels = text.match(/\[LABELS\](.*)/)?.[1]?.trim() || "";
        
        return { title, content, labels };
    } catch (e) { 
        console.error('AI 생성 에러:', e.message);
        return { title: topic, content: topic + "에 대해 더 자세히 알아볼까요?" }; 
    }
}

async function postToBlogger(title, content, labels) {
    const userDataDir = path.join(__dirname, 'user_data');
    console.log('🌐 브라우저 실행 중...');
    
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        args: ['--disable-blink-features=AutomationControlled']
    });
    const page = await context.newPage();

    try {
        const listUrl = `https://www.blogger.com/blog/posts/${BLOG_ID}`;
        console.log(`📄 글 목록 이동: ${listUrl}`);
        await page.goto(listUrl, { waitUntil: 'load' });
        await page.waitForTimeout(5000);

        console.log('➕ [새 글] 버튼 클릭 시도...');
        await page.evaluate(() => {
            const el = Array.from(document.querySelectorAll('div[role="button"], button, span')).find(e => e.innerText.includes('새 글') || e.innerText.includes('New post'));
            if (el) el.click();
        });

        console.log('⏳ 에디터 로딩 대기...');
        await page.waitForTimeout(10000);

        // --- 정밀 입력 로직 ---
        console.log('✍️ 제목 입력창 정밀 탐색 중...');
        const titleInputSelector = 'input[aria-label="제목"], input[aria-label="Title"], input[placeholder="제목"], input[placeholder="Title"]';
        try {
            await page.waitForSelector(titleInputSelector, { timeout: 5000 });
            await page.fill(titleInputSelector, title);
            console.log('✅ 제목 입력 성공!');
        } catch (e) {
            console.log('⚠️ 제목창을 못 찾아 대체 시도...');
            await page.evaluate((t) => {
                const inputs = Array.from(document.querySelectorAll('input'));
                const target = inputs.find(i => (i.ariaLabel || '').includes('제목') || (i.placeholder || '').includes('제목') || (i.type === 'text' && i.offsetWidth > 400));
                if (target) { target.focus(); target.value = t; target.dispatchEvent(new Event('input', { bubbles: true })); }
            }, title);
        }

        console.log('✍️ 본문 입력 중...');
        try {
            await page.waitForTimeout(5000); // 로딩 대기시간 증가
            
            // 1. 작성 모드 확인 및 Compose view로 전환 시도 (필요시)
            const isHtmlView = await page.evaluate(() => {
                const btn = document.querySelector('div[aria-label="HTML 보기"], div[aria-label="HTML view"]');
                return !!btn;
            });

            if (isHtmlView) {
                console.log('📝 HTML 보기 모드 탐지, 작성 보기로 전환 시도...');
                await page.click('div[aria-label="HTML 보기"], div[aria-label="HTML view"]');
                await page.waitForTimeout(1000);
                const composeBtn = await page.$('div[role="menuitem"] >> text="작성 보기"');
                if (composeBtn) await composeBtn.click();
                await page.waitForTimeout(3000);
            }

            // 2. 구체적인 iframe과 body 탐색
            let frame = null;
            const editorIframe = await page.waitForSelector('iframe.editor-canvas, iframe[title="Rich Text Editor"]', { timeout: 10000 }).catch(() => null);
            
            if (editorIframe) {
                frame = await editorIframe.contentFrame();
            } else {
                // 다른 모든 프레임 탐색
                const frames = page.frames();
                for (const f of frames) {
                    const isEditable = await f.$('body.editable, [contenteditable="true"]').catch(() => null);
                    if (isEditable) {
                        frame = f;
                        break;
                    }
                }
            }

            if (frame) {
                console.log('✅ 에디터 프레임 발견, 내용 입력 중...');
                await frame.evaluate((c) => {
                    const body = document.querySelector('body.editable') || document.body;
                    body.focus();
                    // innerHTML 직접 설정보다 execCommand가 더 안정적일 수 있음
                    document.execCommand('selectAll', false, null);
                    document.execCommand('delete', false, null);
                    document.execCommand('insertHTML', false, c);
                    body.dispatchEvent(new Event('input', { bubbles: true }));
                }, content);
                console.log('✅ 본문 입력 성공!');
            } else {
                console.log('⚠️ 에디터를 찾지 못해 키보드 입력을 시도합니다...');
                await page.keyboard.press('Tab');
                await page.waitForTimeout(1000);
                await page.keyboard.type(content, { delay: 1 });
            }
        } catch (e) {
            console.error('⚠️ 본문 입력 중 오류:', e.message);
        }

        // --- 라벨 입력 로직 ---
        console.log('🏷️ 라벨 입력 시도...');
        try {
            await page.evaluate(() => {
                const labelSection = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.innerText.includes('라벨') || el.innerText.includes('Labels'));
                if (labelSection && labelSection.getAttribute('aria-expanded') !== 'true') {
                    labelSection.click();
                }
            });
            await page.waitForTimeout(2000);

            const labelSelector = 'textarea[aria-label="쉼표로 라벨을 구분하세요."], textarea[aria-label="Separate labels by commas"]';
            await page.waitForSelector(labelSelector, { timeout: 5000 });
            await page.focus(labelSelector);
            await page.keyboard.type(labels);
            await page.waitForTimeout(500);
            await page.keyboard.press('Enter'); // 라벨 확정을 위해 Enter 입력
            console.log('✅ 라벨 입력 성공!');
        } catch (e) {
            console.log('⚠️ 라벨 입력 중 오류 (무시하고 진행):', e.message);
        }

        console.log('🚀 발행 시도...');
        const finalize = async (labels) => {
            await page.evaluate((labels) => {
                const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
                const target = btns.find(b => labels.some(l => b.innerText.includes(l)));
                if (target) target.click();
            }, labels);
        };

        // 1단계: 발행/게시 버튼 클릭
        await finalize(['게시', '발행', 'Publish']);
        await page.waitForTimeout(3000);
        
        // 2단계: 확인/Confirm 버튼 클릭 (팝업)
        await finalize(['확인', 'Confirm', '발행']); 
        
        console.log('🎉 모든 과정 완료!');
        await page.waitForTimeout(5000);

    } catch (err) {
        console.error('❌ 에러:', err.message);
        await page.screenshot({ path: path.join(__dirname, 'error_screenshot.png'), fullPage: true });
    } finally {
        await context.close();
    }
}

async function run(isTest = false) {
    const topics = [
        "반려견과 함께 가기 좋은 카페 추천",
        "강아지 화식 직접 만들어본 후기",
        "강아지 분리불안 훈련 꿀팁",
        "반려견 건강검진 주기와 비용 정리",
        "산책 후 강아지 발 관리법"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    console.log(`🚀 [${new Date().toLocaleString()}] 자동 포스팅 시작! 주제: ${randomTopic}`);
    const { title, content, labels } = await generatePostContent(randomTopic);
    await postToBlogger(title, content, labels);
    console.log(`✅ [${new Date().toLocaleString()}] 포스팅 완료!`);
}

// 1. 즉시 실행 테스트 (실행 시 한 번 바로 올라감)
console.log('🧪 테스트 실행을 시작합니다...');
run(true);

// 2. 매일 아침 9시 예약 (node-cron)
// '0 9 * * *' -> 매일 09:00:00 실행
cron.schedule('0 9 * * *', () => {
    run();
}, {
    scheduled: true,
    timezone: "Asia/Seoul"
});

console.log('⏰ 매일 오전 9시 예약이 설정되었습니다. (Asia/Seoul)');
