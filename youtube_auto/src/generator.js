require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateScript() {
  console.log('📝 코다리 부장이 대본을 구상 중입니다...');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    너는 유튜브 숏츠 드라마 전문 작가야. 
    사람들이 끝까지 보게 만드는 '사이다 복수' 또는 '성공 스토리' 대본을 작성해줘.
    
    [규칙]
    1. 전체 분량은 60초 내외.
    2. 첫 5초는 강력한 '후킹'이 있어야 함.
    3. 각 장면마다 영상에 쓰일 '대사'와 그 장면에 어울리는 'AI 이미지 생성용 영어 프롬프트'를 포함해줘.
    4. 반드시 아래의 JSON 형식으로만 답변해줘. 다른 설명은 하지 마.

    [JSON 형식]
    {
      "title": "영상 제목",
      "scenes": [
        {
          "id": 1,
          "duration": 5,
          "text": "장면 대사",
          "image_prompt": "English image generation prompt (vivid, realistic, cinematic, 9:16 aspect ratio description)"
        }
      ]
    }
  `;

  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().replace(/```json|```/g, '').trim();
      const script = JSON.parse(responseText);
      
      const outputPath = path.join(__dirname, '../data/current_script.json');
      if (!fs.existsSync(path.join(__dirname, '../data'))) fs.mkdirSync(path.join(__dirname, '../data'));
      fs.writeFileSync(outputPath, JSON.stringify(script, null, 2));
      
      console.log(`✅ 대본 생성 완료! [제목: ${script.title}]`);
      return script;
    } catch (error) {
      if (error.status === 429) {
        console.log(`⏳ API 한도 초과! 60초 대기 후 재시도합니다... (${i + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 60000));
      } else {
        console.error('❌ 대본 생성 중 오류 발생:', error);
        throw error;
      }
    }
  }
}

// 테스트 실행
if (require.main === module) {
  generateScript();
}

module.exports = { generateScript };
