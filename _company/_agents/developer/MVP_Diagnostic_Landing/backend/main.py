from fastapi import FastAPI
from pydantic import BaseModel
import logging

# 로깅 설정 (시스템 로그처럼 보이게)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app = FastAPI(title="Diagnostic Service API")

# 💡 데이터 모델 정의: 사용자가 입력할 수 있는 모든 필드를 구조화합니다.
class UserInputData(BaseModel):
    name: str | None = None
    email: str | None = None
    system_risk_description: str | None = None # 핵심 D.I.S. 데이터
    interest_area: str | None = None

# 💡 API 엔드포인트 정의 (여기에 로직이 들어갈 겁니다)
@app.post("/api/v1/diagnose/")
async def process_diagnostic_input(data: UserInputData):
    """
    사용자의 입력 데이터를 받아 진단 의도 점수(D.I.S.)를 계산하고, 
    리드 데이터베이스에 기록하는 시뮬레이션 API입니다.
    """
    if not data.email or not data.system_risk_description:
        logging.warning("Missing critical diagnostic input (Email/Risk Description).")
        return {"status": "error", "message": "Required fields are missing."}

    # --- D.I.S. 계산 로직 Placeholder ---
    # 실제로는 복잡한 AI 모델 호출이나 데이터베이스 조회 과정이 들어갑니다.
    # 여기서는 간단히 문자열 길이와 이메일 유효성을 기반으로 점수를 부여합니다.
    base_score = len(data.system_risk_description) % 10 + 75 # 최소 점수 75점 확보 가정
    dis_score = base_score + (1 if "@" in data.email else 0)

    logging.info(f"Processing Lead: Name={data.name}, D.I.S. Calculated: {dis_score}")
    # 실제로는 여기에 DB 저장 로직이 들어갑니다.

    return {
        "status": "success", 
        "message": f"진단 데이터가 성공적으로 접수되었습니다. D.I.S.: {dis_score}점.",
        "diagnostic_intent_score": dis_score,
        "next_step": "/api/v1/download-checklist/" # 다음 행동 유도
    }

@app.get("/api/v1/download-checklist/")
async def download_trigger():
    """
    체크리스트 다운로드 요청을 처리하고, 리드 정보를 교환하는 API입니다. 
    (실제로는 사용자 인증 및 DB 체크 후 파일을 제공해야 합니다.)
    """
    return {
        "status": "success", 
        "message": "클릭하신 링크를 통해 필수 진단 체크리스트 다운로드가 시작됩니다.",
        "download_url": "/assets/checklist-template.pdf" # 실제 파일 경로
    }

# FastAPI 실행 방법 안내 (README에 추가 예정)

<create_file path="c:\Users\leesj\connect-ai-projects\_company\_agents\developer\MVP_Diagnostic_Landing/frontend/package.json">{
  "name": "diagnostic-landing",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}