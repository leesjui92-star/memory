require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyG5EUoNtWOEhRPKNs2MopjmQfJ47iwJzEOmGfIJ-_FaeL5PU3NAcShRmqRNmZwx-6N/exec';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. 제미나이(Gemini) AI로 글 자동 생성 ---
async function generateBlogPost() {
  console.log('🤖 제미나이 AI가 글감을 고민하고 있습니다...');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const prompt = `
    너는 15년 경력의 '반려견 건강 관리 수의사'이자 10만 구독자를 보유한 파워 블로거야.
    반려견을 키우는 사람들에게 실질적으로 도움이 되고, 읽고 나면 감동과 지식을 동시에 얻을 수 있는 고품질 블로그 포스팅을 작성해 줘.
    
    [작성 규칙]
    1. 첫 줄은 매력적인 포스팅 제목을 작성해. (HTML 태그 없이 텍스트만)
    2. 본문은 최소 1,500자 이상으로 아주 상세하게 작성해.
    3. HTML 태그(<h2>, <h3>, <p>, <strong>, <br>, <ul>, <li>)를 사용해서 전문 웹사이트처럼 가독성 있게 구성해.
    4. 실제 사례나 수의학적 근거를 들어서 신뢰도를 높여줘.
    5. 마지막에 독자에게 따뜻한 인사를 건네고 [태그: 단어1, 단어2, 단어3] 형식으로 관련 태그 5개를 적어줘.
    6. 주제 예시: 슬개골 탈구 관리, 노령견 치매 예방, 강아지 화식 레시피, 반려견 분리불안 해결 등
  `;

  let result;
  for (let i = 0; i < 3; i++) {
    try {
      result = await model.generateContent(prompt);
      break;
    } catch (error) {
      if (error.status === 429) {
        console.log(`\n⏳ 구글 서버 혼잡 중. 60초 대기 후 재시도... (${i + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 60000));
      } else {
        throw error;
      }
    }
  }

  if (!result) throw new Error('AI 서버가 응답하지 않습니다. 나중에 다시 시도해주세요.');

  const response = result.response.text();
  const lines = response.split('\n');
  const title = lines[0].replace(/#/g, '').trim();

  let content = '';
  let tags = ['반려견', '건강관리'];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('[태그:')) {
      tags = line.replace('[태그:', '').replace(']', '').split(',').map(t => t.trim());
    } else {
      content += line + '\n';
    }
  }

  return { title, content, tags };
}

// --- 2. 구글 앱스 스크립트를 통해 블로그에 업로드 ---
async function postToBlogger(postData) {
  console.log(`📝 블로그로 전송 중... [제목: ${postData.title}]`);

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: postData.title,
      content: postData.content,
      labels: postData.tags
    }),
    redirect: 'follow'
  });

  const text = await response.text();
  
  try {
    const result = JSON.parse(text);
    if (result.success) {
      console.log(`🎉 성공적으로 업로드 되었습니다!`);
      console.log(`👉 포스팅 주소: ${result.url}`);
    } else {
      console.error('❌ 업로드 실패:', result.error);
    }
  } catch(e) {
    console.log('서버 응답:', text);
  }
}

// --- 메인 실행 ---
async function main() {
  console.log('🐟 코다리 부장의 100% 완전 자동 포스팅 엔진 가동 🐟');
  console.log('----------------------------------------------------');
  try {
    const postData = await generateBlogPost();
    console.log('✨ AI 글 작성 완료!');
    await postToBlogger(postData);
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
  console.log('----------------------------------------------------');
  console.log('🐟 엔진 작동 종료 🐟');
}

main();
