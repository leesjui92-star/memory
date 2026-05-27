# ⚙️ 기술 명세서: D.I.S. 강제 유도 컴포넌트 (Diagnostic Trigger Component)

## 목표 기능: 콘텐츠의 자연스러운 종료 지점(T-5s / T-3s)에서 시각적/청각적으로 '시스템 오류'를 인지시키고, 해결책을 제시하는 인터랙티브 오버레이 구현.
## 적용 범위: YouTube 롱폼 (V2), Instagram 쇼츠 (V1).

### [A] 컴포넌트 정의 및 동작 원리
#### A-1. System Anomaly Alert Overlay (유튜브 전용)
*   **위치:** 화면 중앙을 가로지르는 경고창 스타일 (Tech Noir, Neon Red 계열).
*   **애니메이션 로직:** T-5s에 *Slow Fade In*으로 시작 $\rightarrow$ T-2s에 *Pulse Animation* (깜빡임) 적용 $\rightarrow$ 패키지 노출 시 *Staggered Flash* 효과.
*   **데이터 연동 Mock API:** `GET /diagnostic/anomaly_level` -> 이 API가 호출되는 순간, "진단 필요" 상태가 발동됨을 개발팀에 명시해야 함.

#### A-2. Diagnostic Failure Message (인스타 전용)
*   **위치:** 화면 전체를 덮는 일회성 오버레이.
*   **애니메이션 로직:** T-3s에 *Glitch Effect*와 함께 나타남 $\rightarrow$ 경고 문구(텍스트)가 빠르게 깜빡이며 강조됨 (High Contrast).
*   **CTA 강제화:** 텍스트 하단에 '더 알아보기' 버튼을 배치하되, 실제로는 프로필 링크로 강제 이동시키는 로직 필요.

### [B] 패키지 제시 및 가격 플래시 로직
1.  **패턴:** Standard Tier (₩29,000)를 메인으로 보여주면서도, Premium Tier (₩99,000)의 *가치*만 시각적으로 강조하여 **앵커링 효과**를 극대화합니다.
2.  **구현 로직:** 가격 노출 시 단순히 텍스트로 나열하는 것이 아니라, 마치 "시스템이 추천하는 최적 해결책"처럼 경고창 내부의 'Solution Box'에 통합되어야 합니다.

---