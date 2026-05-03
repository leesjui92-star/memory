# 📱 Secretary — 제시된 'B.U.I.L.D.' 마스터 시스템 프롬프트 전체 내용을 요약하고, 이 프로젝트의 핵심 산출물(Deliverables)과 개발 단계별 체크리스트를 포함하는 공식 문서 보고서 초안을 작성하십시오. 특히 `AI_City_Master_Plan.md`에 기록되어야 할 모든 원칙과 가이드를 정리해야 합니다.

📱 Secretary: 작업 시작합니다.

## 📄 [공식 보고서] B.U.I.L.D. 마스터 시스템 구축 프로토콜 요약 및 가이드라인
**문서 버전:** 1.0 (CEO 지시 기반)
**작성자:** JAY CORP Secretary
**배포일:** YYYY-MM-DD

---

### I. 프로젝트 개요: B.U.I.L.D.의 정의
B.U.I.L.D.은 단순한 자동화 툴을 넘어, **[React + FastAPI]**와 최신 AI 모델(Gemini/Veo)을 통합하여 작동하는 '초자동화 영상 콘텐츠 생산 도시'를 구축하는 마스터 시스템입니다. 이 시스템의 목표는 수동적이고 반복적인 모든 과정을 최소 단위로 분해하고 지능적으로 연결하여, 고품질 영상을 신속하게 대량 생산하는 파이프라인 전체를 구현하는 것입니다.

**핵심 가치:** 원천 콘텐츠 확장(Atomization) 및 재사용성 극대화
**운영 모델:** AI 멘토 제이(Jay)가 설계한 프로토콜을 엄수하는 중앙 집중식 CMS 구조.

### II. 핵심 산출물 (Deliverables) 목록
프로젝트 완료 시, 다음의 기능적/구조적 산출물이 완성되어야 합니다. 이들이 곧 '도시'를 구성하는 필수 시설입니다.

| 구분 | 이름 | 기술 스택 | 역할 및 설명 |
| :--- | :--- | :--- | :--- |
| **[Master Plan]** | `AI_City_Master_Plan.md` | Markdown/Wiki | 도시의 모든 원칙, 공법(Blueprint), 현재 상태, 사용 모델 버전 등 '진실을 기록하는 단일 출처 (Single Source of Truth)'입니다. |
| **[Backend Core]** | FastAPI 서버 (`main.py`) | Python/FastAPI | 지상(Front-end)과 지하 설비(AI 서비스 로직)를 연결하는 중앙 API 게이트웨이 및 통제 시스템입니다. |
| **[Service Logic]** | `google_ai.py` | Python/VertexAI SDK | Gemini 3 (텍스트, 이미지), Veo 3.1 (영상) 등 모든 AI 모델의 호출 로직을 관리하고 순차적 처리(Polling 포함)를 담당합니다. |
| **[Frontend UI]** | React Dashboard (`App.jsx`) | React/Tailwind CSS | 사용자에게 직관적인 워크플로우를 제공하는 관제 센터 역할을 합니다. (D&D, 실시간 상황판 구현). |
| **[Asset Pipeline]** | 데이터 파이프라인 | FastAPI + DB | 시장 조사(텍스트) $\rightarrow$ 이미지 생성 $\rightarrow$ 합성 $\rightarrow$ 영상 송출의 4단계 과정을 자동화하여 자산을 생산합니다. |

### III. ✨ `AI_City_Master_Plan.md` 필수 기록 가이드라인
이 문서는 단순한 로그북이 아닙니다. 이 프로젝트를 이해하는 모든 팀원이 따라야 할 **'운영 원칙(Protocol)'**을 담아야 합니다. 다음 항목들을 반드시 포함하여 작성해야 합니다.

1.  **[아키텍처 원칙]**:
    *   **원천 데이터 보존:** 모든 가공 전의 원본 콘텐츠는 `00_Raw/` 폴더에 영구적으로 보관하며, 어떤 단계에서 사용되었는지 추적할 수 있어야 한다. (Non-Destructive Workflow)
    *   **모듈성 및 확장성:** 모든 기능은 독립적인 서비스 모듈로 분리되어야 하며, 새로운 AI 모델(e.g., GPT-5, Sora 등)이 추가될 경우 최소한의 코드 수정으로 통합할 수 있는 구조여야 한다.
2.  **[기술 스택 표준]**:
    *   **Backend:** Python 3.10+ / FastAPI 사용을 원칙으로 하며, 비동기 처리(Async/Await)를 전면 적용한다.
    *   **Frontend:** React (Hooks 기반) 및 Tailwind CSS v3 이상을 사용하여 디자인 시스템을 통일한다.
    *   **API 표준:** 모든 API는 Pydantic Model을 통해 요청/응답 데이터 스키마를 엄격히 정의해야 한다.
3.  **[운영 워크플로우]**:
    *   **재시도 메커니즘 (Retry):** Veo 등 외부 서비스 호출 실패(지진) 시, 3회까지 지연 시간과 함께 자동으로 재시도하는 로직을 필수적으로 포함한다.
    *   **상태 관리:** 콘텐츠 생산의 모든 단계(Search $\rightarrow$ Image $\rightarrow$ Synthesis $\rightarrow$ Video)는 사용자가 실시간으로 추적할 수 있는 명확한 상태 코드를 가져야 한다.

### IV. 🛠️ 개발 단계별 체크리스트 (Actionable Checklist)
아래 순서대로 진행되어야 시스템의 견고성을 확보할 수 있습니다. 이 체크리스트가 실제 프로젝트 관리 도구(Jira, Trello 등)에 반영되어야 합니다.

**✅ [Phase 0: Foundation - 마스터 플랜 구축]**
*   [ ] `AI_City_Master_Plan.md` 초안을 작성하고 핵심 원칙을 정의한다.
*   [ ] `.env` 파일을 생성하고 GCP API 키와 프로젝트 ID를 확보하여 환경 변수를 설정한다.

**✅ [Phase 1: Backend Core - 지하 발전소 건설]**
*   [ ] FastAPI 서버의 기본 구조(`main.py`)를 확립하고 RESTful API 게이트웨이를 구현한다.
*   [ ] `google_ai.py` 모듈을 생성하고 Gemini/Veo 호출 로직을 분리하여 작성한다.
*   [ ] Veo 영상 생성을 위한 비동기 Polling 시스템(주기적 상태 확인)을 구축하여 다운로드 기능까지 완성한다.

**✅ [Phase 2: Infrastructure - 견고한 내부 설계]**
*   [ ] Pydantic 모델을 이용해 모든 API의 Request/Response 스키마를 정의하고 검증 로직을 적용한다.
*   [ ] AI 서비스 호출 실패(Timeout, Error)에 대비하여 **3회 재시도 및 지연 시간(Backoff)** 기능을 구현한다.

**✅ [Phase 3: Frontend - 지상 랜드마크 건설]**
*   [ ] Tailwind CSS를 기반으로 Dark Mode와 Glassmorphism 디자인을 적용한 Dashboard 레이아웃을 완성한다.
*   [ ] **실시간 상황판(Status Board)** 컴포넌트를 개발하여, 모든 프로세스 단계를 애니메이션 카드로 시각화한다.
*   [ ] 드래그 앤 드롭 기능을 구현하는 '입국 심사대' UI를 설계하고 연동한다.

**✅ [Phase 4: Deployment - 시스템 가동]**
*   [ ] 최종 통합 테스트(End-to-End Test)를 수행하여, 검색부터 영상 다운로드까지 모든 과정이 정상 작동함을 검증한다.
*   [ ] 성공적인 빌드 로그와 사용된 자원 목록을 `AI_City_Master_Plan.md`에 기록하고 최종 승인 받는다.

---

📊 평가: 완료 — B.U.I.L.D. 프로토콜의 모든 내용을 구조화하고, 이를 개발팀이 즉시 활용할 수 있는 명확한 공식 문서 초안으로 변환했습니다.
📝 다음 단계: 이 보고서를 기반으로 각 기술 스택별(Backend/Frontend) 전문 팀에게 상세 설계 및 구현 작업을 지시하십시오.
