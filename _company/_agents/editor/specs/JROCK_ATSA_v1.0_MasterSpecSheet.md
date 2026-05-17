# JROCK 사운드 마스터 스펙 시트: Anomaly Protocol (ATSA v1.0)

## 📌 개요
*   **목표:** 시스템 경고/데이터 오류 테마의 공통 오디오 아키텍처(ATSA) 확립 및 표준화.
*   **톤앤매너:** Dystopian, Techno-Noir, Cognitive Instability.
*   **주파수 초점:** Low Frequency Sub-Bass Drone을 메인으로 사용하여 공간적 압박감을 조성한다.

## I. BGM 모드 아키텍처 (BPM/Key 기반)
1.  **Hook & 도입부:** 90~120 BPM, Minor Chord. Heartbeat Pulse + High-Pass Whine 사용.
2.  **문제 정의/정보 전달:** 100~140 BPM, 불안정한 Minor Chord 변주. Low Frequency Pulse 패턴 삽입 필수.
3.  **클라이맥스/정보 폭로:** Sudden Drop (무음) $\rightarrow$ 180~240 BPM 급상승. Vacuum Sound와 Sub-Bass Boom 조합.

## II. SFX 이벤트 라이브러리 (Time Code Trigger Module)
*   **A. Hook Start:** Deep Rumble (Duration: 1s, Crescendo).
*   **B. Data Error:** BZZZT + Glitch 사운드 (Duration: 0.3s). `music_generate --type='DataError'`.
*   **C. Key Concept Reveal:** Warning + Impact Hit (Duration: 0.4s). `music_generate --type='Alert'`.
*   **D. Climax Boom:** Sub-Bass Boom (Duration: 0.5s). `music_generate --type='Climax'`.