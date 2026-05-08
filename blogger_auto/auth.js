const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/blogger'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }
  return getNewToken(oAuth2Client);
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('------------------------------------------------------------');
  console.log('🚀 블로그 직통 연결을 위해 로그인이 필요합니다!');
  console.log('1. 아래 주소를 브라우저에 복사해서 접속하세요:');
  console.log(authUrl);
  console.log('\n2. 구글 로그인 후 나오는 "인증 코드"를 복사해서 여기에 입력하세요:');
  console.log('------------------------------------------------------------');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('인증 코드를 입력하세요: ', (code) => {
      code = code.trim();
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('❌ OAuth exchange failed!');
          if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
          } else {
            console.error('Error message:', err.message);
          }
          return reject('인증 코드가 틀렸거나 만료되었습니다. 다시 시도해 주세요.');
        }
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('✅ 인증 성공! token.json 파일이 생성되었습니다.');
        resolve(oAuth2Client);
      });
    });
  });
}

authorize().catch(console.error);
