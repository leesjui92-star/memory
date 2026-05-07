# 📺 YouTube — 유튜브 API 활용 가이드라인을 제공합니다. 단순히 영상 링크만 가져오는 것이 아니라, '자동 생성된 스크립트(Transcript)'와 '최대 반응이 나온 30초 구간의 핵심 문장'을 구조화하여 추출하는 프로토콜을 개발팀에 전달하십시오.

📺 YouTube: 작업 시작합니다.

## 🌐 [프로토콜] 고도화된 지식 수집 및 구조적 불안정성 추출 프로토콜 v2.0
**대상:** 개발팀/개발자 에이전트
**목표:** 단순 메타데이터(제목, 링크) 수집을 넘어, 영상의 **'핵심 의문점(Loop Hook)'**과 시청자의 **'최대 감정 반응 지점'**을 구조화된 데이터로 추출하는 파이프라인 설계. 이를 통해 콘텐츠 기획 단계에서부터 '진단 강박'을 유발할 수 있는 원천 데이터를 확보합니다.

---

### 1. 시스템 개요 및 흐름도 (Workflow Overview)
본 프로토콜은 **[API 호출] → [전사(Transcription)] → [감정 분석/시간 매핑] → [데이터 구조화]**의 4단계로 작동하며, 최종 결과물은 검색 가능한 JSON 형태여야 합니다.

#### ⚙️ 데이터 파이프라인 단계별 실행 지침 (Implementation Guide)

| 단계 | 수행 기능 | 활용 API / 기술 | 목표 산출물 |
| :--- | :--- | :--- | :--- |
| **Step 1: 원천 수집** | 영상 ID 기반 메타데이터 및 트랜스크립트 요청. | YouTube Data API (Videos, Captions) | `video_meta` (제목, 길이, 발행일) & `full_transcript` |
| **Step 2: 스크립트 분할/구조화** | 전체 스크립트를 문장 단위로 분리하고 타임스탬프와 연결. | N/A (Post-processing Logic) | `{timestamp: [start, end], text: "문장 내용"}` 배열 |
| **Step 3: 반응 지점 포착 (Critical)** | 댓글 데이터(Comment Harvester)와 스크립트 타임스탬프를 결합하여 감정적 클라이맥스를 찾아냄. | Comment API + Sentiment Analysis Model | `reaction_hotspots` (시간대, 핵심 키워드, 예상 질문) |
| **Step 4: 최종 데이터 구조화** | 모든 정보를 통합하고 '구조적 위험' 관점의 해설을 추가하여 저장. | JSON Schema / Database Entry | **최종 결과물 (아래 참조)** |

---

### 2. 핵심 산출물 추출 프로토콜 상세 (Extraction Protocols)

#### A. 트랜스크립트(Transcript) 구조화 요구사항
1.  **분할 단위:** 모든 문장은 반드시 시작 시간(`start`)과 종료 시간(`end`)을 포함해야 합니다.
2.  **필터링:** 단순한 구어체 반복이나 잡담은 제외하고, **주요 주장이 담긴 핵심 문장(Thesis Statement)**만 추출합니다.
3.  **메타 태그:** 각 스크립트 블록에 해당 내용이 다루는 주제 분류 코드 (예: `[FINANCE]`, `[SYSTEM_FAIL]`, `[BEHAVIORAL]`)를 필수적으로 붙입니다.

#### B. 최대 반응 30초 구간 추출 프로토콜 (`Reaction Hotspot Finder`)
이것은 단순한 시청률 지표가 아닌, **'집단적 의문점 폭발'**의 시간대를 포착하는 것이 목표입니다.

1.  **데이터 결합:** `Comment Harvester`에서 수집된 댓글 데이터 (댓글 내용 + 작성 시간)와 스크립트 타임스탬프를 교차 분석합니다.
2.  **가중치 산정:** 다음 요소들의 가중치를 조합하여 점수화합니다:
    *   **A. 감정 강도 (Sentiment Score):** "??", "이게 가능한가요?", "진짜 위험한데" 등 의문과 공포를 나타내는 키워드 비율. (최우선)
    *   **B. 밀도 (Density):** 짧은 시간 내에 많은 댓글이 쏟아져 나오는 구간. (집단적 불안감의 증거)
    *   **C. 핵심 키워드 일치:** 현재 스크립트가 언급하는 위험 주제와 댓글에서 공통적으로 추출되는 단어 간의 연관성.
3.  **결과 도출:** 이 세 가지 가중치를 종합하여 점수가 가장 높은 **최대 30초 구간 (Hotspot)**을 지정하고, 해당 시간대의 스크립트 문장과 그 구간에 집중된 대표 댓글(Representative Comment)들을 함께 추출합니다.

---

### 3. 최종 데이터 구조화 예시 (JSON Schema Template)
개발팀은 아래의 JSON 스키마를 반드시 따르도록 파이프라인을 구축해야 합니다.

```json
{
  "video_id": "xxxxxxxxxxx",
  "title": "[원본 영상 제목]",
  "metadata": {
    "publish_date": "YYYY-MM-DD",
    "core_theme_tags": ["Anti-Establishment Finance", "System Failure"], 
    "risk_score_assessment": "높음 (Critical)" // AI가 판단하는 구조적 위험 점수
  },
  "transcript_segments": [
    {
      "start": 5.2,
      "end": 8.9,
      "text": "현재의 연금 시스템은 인구 감소와 물가 상승을 반영하지 못하고 있습니다.",
      "semantic_tag": "[FINANCE]",
      "difficulty_level": "HIGH (핵심 의문 제시)" // 이 문장이 왜 중요한지 주석 처리
    },
    // ... 더 많은 세그먼트
  ],
  "hotspot_analysis": {
    "time_range": "14:30 - 15:02", // 최대 반응 구간 (30초 내외)
    "peak_reason": "댓글 폭발 및 '개인 자산 위험'에 대한 공포심 극대화 지점 포착.",
    "extracted_hook_sentences": [
      {
        "source_time": "14:35",
        "text": "이대로 가면 20년 뒤 저희 부모님 세대는 어떻게 되는 걸까요?", // 핵심 질문 문장
        "type": "Diagnostic Hook Question"
      },
      // ...
    ],
    "representative_comment_sample": {
      "snippet": "정부 발표는 늘 이런 식으로 피해를 가중시키네요. 정말 믿을 수 있나요?",
      "sentiment_score": 0.92, // 1.0에 가까울수록 강한 부정적 의문
      "source_time_context": "Hotspot 구간 발생 시점과 연관됨."
    }
  }
}
```

📊 평가: 완료 — 요구된 모든 핵심 요소(스크립트 구조화, 반응 지점 포착)를 포함하는 고도화된 프로토콜을 제시하여 개발팀에게 충분한 실행 가이드를 제공했습니다.
📝 다음 단계: 개발팀 에이전트를 호출하여 위 프로토콜에 기반한 '데이터 파이프라인 초안' 구현 및 테스트 환경 설정을 요청해야 합니다.
