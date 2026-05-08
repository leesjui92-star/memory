const { generateScript } = require('./src/generator');
const { uploadToYouTube } = require('./src/uploader');
const { execSync } = require('child_process');
const path = require('path');

async function startEngine() {
  console.log('🐟 코다리 숏츠 완전 자동화 엔진 가동! 🐟');
  console.log('-------------------------------------------');

  try {
    // 1. 대본 생성
    const script = await generateScript();
    if (!script) return;

    // 2. 영상 제작 (이미지/음성/합성 포함)
    console.log('🎞️ 영상 제작 프로세스 시작...');
    execSync('node src/video_maker.js', { stdio: 'inherit' });

    // 3. 유튜브 업로드
    const videoPath = path.join(__dirname, 'output/final_shorts.mp4');
    await uploadToYouTube(videoPath, script.title, "코다리 부장의 완전 자동화 시스템으로 생성된 영상입니다.");

    console.log('-------------------------------------------');
    console.log('✅ 오늘의 숏츠 자동 업로드 작업이 완료되었습니다! 충성! 🫡');
  } catch (err) {
    console.error('❌ 엔진 작동 중 오류 발생:', err.message);
  }
}

startEngine();
