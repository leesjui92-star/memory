const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

// 1. 오디오 생성 (PowerShell TTS 활용)
function generateAudio(text, outputPath) {
  const scriptPath = path.join(__dirname, 'tts.ps1');
  const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" "${outputPath}" "${text.replace(/"/g, "'")}"`;
  try {
    execSync(command);
    return true;
  } catch (e) {
    console.error('❌ 오디오 생성 실패:', e.message);
    return false;
  }
}

// 2. 개별 장면 영상 만들기 (이미지 + 오디오)
function createSceneVideo(imagePath, audioPath, duration, outputPath) {
  const command = `"${ffmpeg}" -y -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" "${outputPath}"`;
  try {
    execSync(command);
    return true;
  } catch (e) {
    console.error('❌ 장면 영상 생성 실패:', e.message);
    return false;
  }
}

// 3. 메인 실행 함수
async function makeVideo() {
  const scriptData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/current_script.json'), 'utf8'));
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const sceneFiles = [];

  console.log(`🎬 '${scriptData.title}' 영상 제작을 시작합니다...`);

  for (const scene of scriptData.scenes) {
    console.log(`[장면 ${scene.id}] 처리 중...`);
    
    const audioPath = path.join(tempDir, `scene_${scene.id}.wav`);
    const sceneVideoPath = path.join(tempDir, `scene_${scene.id}.mp4`);
    const placeholderImage = path.join(__dirname, '../../kodari_profile.png'); // 임시 이미지

    // 오디오 생성
    generateAudio(scene.text, audioPath);
    
    // 장면 영상 생성 (오디오 길이에 맞춤)
    createSceneVideo(placeholderImage, audioPath, scene.duration, sceneVideoPath);
    
    sceneFiles.push(sceneVideoPath);
  }

  // 전체 합치기
  const listFilePath = path.join(tempDir, 'list.txt');
  const listContent = sceneFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listFilePath, listContent);

  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const finalOutputPath = path.join(outputDir, 'final_shorts.mp4');

  console.log('🎞️ 최종 영상 합성 중...');
  const concatCommand = `"${ffmpeg}" -y -f concat -safe 0 -i "${listFilePath}" -c copy "${finalOutputPath}"`;
  execSync(concatCommand);

  console.log(`\n🎉 완성되었습니다!`);
  console.log(`👉 저장 경로: ${finalOutputPath}`);
}

if (require.main === module) {
  makeVideo();
}
