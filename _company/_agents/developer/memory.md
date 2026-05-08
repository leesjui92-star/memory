# 💻 Developer (Lead Engineer) 개인 메모리

_Developer 에이전트만 읽고 쓰는 개인 노트. 학습·교훈·자주 쓰는 패턴이 누적됩니다._

## 학습 기록

- [2026-05-03] GitHub Sync 실패 오류('fatal: couldn't find remote ref main')의 원인을 진단하고, 해당 리포지토리의 현재 상태를 확인한 후 즉각적인 해결 방법을 제시하세요. (필요시 Git 명령어 및 환경 설정을 점검할 것) → 산출물 sessions/2026-05-03T04-50/developer.md
- [2026-05-03] 선정된 핵심 병목 지점을 해결하기 위한 '통합 자동화 아키텍처'를 설계하십시오. 필요한 기술 요소(예: Zapier/Make 같은 워크플로우 엔진, 특정 AI 모델의 API 연동 등)와 데이터 파이프라인 구성도를 구체적인 단계별로 그려내야 합니다. → 산출물 sessions/2026-05-03T08-08/developer.md
- [2026-05-03] P-Reinforce 아키텍처를 실제 구현하기 위한 기술 스택 및 워크플로우를 정의합니다. 1. 중앙 집중식 CMS API 설계 (지식 입력/출력 게이트웨이). 2. Graph.json 업데이트 자동화 파이프라인 구축(Graph Database 연동). 3. GitHub 커밋 트리거 로직을 개발하여, 지식이 변경될 때마다 자동으로 `[P-Reinforce]` 형식의 Commit 메시지를 생성하도록 구현합니다. → 산출물 sessions/2026-05-03T11-06/developer.md
- [2026-05-03] 도시 지도(File Structure)를 기반으로, 프로젝트의 초기 뼈대 코드를 구축합니다. 먼저 `AI_City_Project/` 폴더 구조를 생성하고, `.env` 파일과 필수 라이브러리 설치 목록을 정리한 후, 백엔드와 프론트엔드의 기본 'Hello World' API 연결 테스트 코드(Stub)를 작성하여 통신 경로를 확인하십시오. → 산출물 sessions/2026-05-03T11-16/developer.md
- [2026-05-03] 백엔드 개발에 집중합니다. `backend/services/google_ai.py` 파일 내부에 B.U.I.L.D. 프로토콜의 Zone 1(트렌드 분석)부터 Zone 4(Veo 영상 생성)까지의 로직 흐름을 담는 모듈화된 API 함수들을 우선 구현하십시오. 특히, Veo 영상 생성을 위한 'Polling(주기적 확인)' 시스템의 기본 틀과 재시도(Retry) 로직을 포함해야 합니다. → 산출물 sessions/2026-05-03T11-16/developer.md
- [2026-05-05] 외부 자료 수집을 위한 'Knowledge Ingestion Gateway' API를 설계하고 구축합니다. 특히, YouTube Data API와 웹 크롤링(BeautifulSoup/Scrapy) 기술을 통합하여 구조화된 데이터 파이프라인이 작동하도록 초기 백엔드 프레임워크를 완성하십시오. → 산출물 sessions/2026-05-05T11-58/developer.md
- [2026-05-08] Researcher와 Business 에이전트가 요청한 '불안정 요소 점수화(KRS)' 프레임워크를 데이터 구조로 변환할 수 있도록, Knowledge Ingestion Gateway API의 입력 및 출력 스키마를 재설계하고 업데이트하라. → 산출물 sessions/2026-05-08T02-14/developer.md
- [2026-05-08] Knowledge Ingestion Gateway API의 입력/출력 스키마를 최종적으로 검토하고, LLM 호출 실패 상황을 고려하여 안정적인 데이터 파이프라인 재구축 방안을 제시하라. → 산출물 sessions/2026-05-08T03-59/developer.md
- [2026-05-08] KRS 점수 기반 유료 진단 서비스의 가격 책정 및 판매 로드맵 실행을 위해, Knowledge Ingestion Gateway API와 데이터 파이프라인의 안정성을 최종적으로 확보하고 LLM 호출 실패에 대비한 Retry 메커니즘을 완벽하게 구현하고 테스트하라. → 산출물 sessions/2026-05-08T04-59/developer.md