const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

// 오디오 생성 함수
function generateAudio(text, outputPath) {
  const scriptPath = path.join(__dirname, 'src/tts.ps1');
  const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" "${outputPath}" "${text.replace(/"/g, "'")}"`;
  execSync(command);
}

// 장면 생성 함수
function createScene(imagePath, audioPath, duration, outputPath) {
  const command = `"${ffmpeg}" -y -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" "${outputPath}"`;
  execSync(command);
}

async function start() {
  console.log('🎞️ 1호기 사이다 드라마 합성 시작...');
  const assetsDir = path.join(__dirname, 'assets');
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const scenes = [
    { img: 'scene_1.png', text: '아, 더러워! 야, 이거 당장 안 닦아? 너 같은 쓰레기들은 이 맛에 쓰는 거지.', dur: 6 },
    { img: 'scene_2.png', text: '청소부가 사람이냐? 그냥 배경이지! 너네 부모도 이러고 살지?', dur: 6 },
    { img: 'scene_3.png', text: '회장님! 늦어서 죄송합니다. 이사회 준비 완료되었습니다. / 자네, 오늘부로 해고야.', dur: 8 }
  ];

  const sceneFiles = [];
  for (let i = 0; i < scenes.length; i++) {
    console.log(`[${i+1}/3] 장면 제작 중...`);
    const audioPath = path.join(tempDir, `v_${i}.wav`);
    const videoPath = path.join(tempDir, `v_${i}.mp4`);
    generateAudio(scenes[i].text, audioPath);
    createScene(path.join(assetsDir, scenes[i].img), audioPath, scenes[i].dur, videoPath);
    sceneFiles.push(videoPath);
  }

  const listPath = path.join(tempDir, 'list.txt');
  fs.writeFileSync(listPath, sceneFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const finalPath = path.join(__dirname, 'output/viral_shorts_ep1.mp4');
  console.log('🎬 최종 영상 인코딩 중...');
  execSync(`"${ffmpeg}" -y -f concat -safe 0 -i "${listPath}" -c copy "${finalPath}"`);

  console.log(`\n🎉 완성! 경로: ${finalPath}`);
}

start();
