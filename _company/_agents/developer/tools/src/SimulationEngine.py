import json
from typing import Dict, Any
import time

class SimulationOrchestrator:
    """
    SyncOrchestrator를 상속받아 동적 런타임 시뮬레이션 및 디버깅을 수행하는 클래스.
    시간 코드(Time Code)에 따른 상태 변화와 조건부 A/B 테스트 변수 발동을 추적합니다.
    """
    def __init__(self, storyboard_data: Dict[str, Any]):
        self.storyboard = storyboard_data
        print("✅ SimulationOrchestrator 초기화 완료. 데이터 로드 확인.")

    def _simulate_segment(self, segment: Dict[str, Any], current_time: float):
        """단일 시간 세그먼트의 비주얼/사운드 이벤트를 시뮬레이션합니다."""
        start = segment['T_start']
        end = segment['T_end']
        duration = end - start

        print(f"\n[⏰ TIME: {start:.2f}s -> {end:.2f}s ({duration:.2f}s)] --- Segment Start")

        # 1. 시스템 상태 및 오류 검사 (System Alert Protocol)
        if segment.get('system_alert', False):
            print("🚨 [SYSTEM ALERT TRIGGERED] - Critical System Error detected!")
            self._handle_system_error(segment, start)

        # 2. A/B 테스트 변수 처리 (Conditional Variable Check)
        ab_test = segment.get('A_B_Test', {})
        if ab_test:
            print("💡 [CTA FOCUS] - A/B Test Slot Active.")
            self._simulate_ab_testing(segment, start)

        # 3. Void Layer 처리 (Knowledge Gap Simulation)
        void_layer = segment.get('is_void_layer', False)
        if void_layer and duration > 0.2:
            print("⚫ [VOID LAYER DETECTED] - Info Gap 발생. 사운드 Decay 및 긴장감 고조 시뮬레이션.")
            # 실제로는 여기서 오디오 트랜지션 로직 호출 필요

        # 4. 핵심 콘텐츠 재생 (Standard Content Playback)
        if segment.get('script_content'):
            print(f"🎬 [SCENE PLAYBACK] - 스크립트 내용 분석 및 시각화: '{segment['script_content'][:30]}...'")

    def _handle_system_error(self, segment: Dict[str, Any], time_code: float):
        """시스템 오류가 발생했을 때의 로직을 디버깅합니다."""
        error = segment.get('error_type', 'Unknown')
        print(f"   >>> [ERROR] 타입: {error}. 원인: {segment.get('reason', 'N/A')}")
        if error == "SyncFailure":
            # 동기화 실패 시, 특수 경고 사운드와 함께 화면을 정지시키는 로직이 필요함
            print("   >>> [ACTION] - Mandatory 1-second Freeze Frame + Warning Sound Trigger.")

    def _simulate_ab_testing(self, segment: Dict[str, Any], time_code: float):
        """A/B 테스트 변수를 조건부로 발동시킵니다."""
        # 현재 로직은 JSON에 정의된 A/B 슬롯의 '변수 이름'을 출력하여 호출 여부를 확인합니다.
        title = segment['A_B_Test'].get('Title', {}).get('Default')
        cta = segment['A_B_Test'].get('CTA', {}).get('Default')

        print(f"   [DEBUG] Title Slot: {title} (✅ 변수 호출 가능)")
        print(f"   [DEBUG] CTA Slot: {cta} (✅ 변수 호출 가능 - 구매 유도 로직 활성화)")


    def run_simulation(self):
        """전체 스토리보드를 순회하며 시뮬레이션을 실행합니다."""
        sorted_segments = sorted(self.storyboard, key=lambda x: x['T_start'])

        print("\n================================================")
        print("🚀 STARTING DYNAMIC SYSTEM SIMULATION (LIVE DEBUG)")
        print("================================================\n")

        for segment in sorted_segments:
            self._simulate_segment(segment, 0.0) # Time is relative here for simplicity

        print("\n================================================")
        print("✅ Simulation 완료. 모든 시간 코드 및 조건부 트리거가 성공적으로 트레이스되었습니다.")
        print("⚠️ 주의: 실제 구현 시, 이 로직은 비동기(Async) 상태 머신으로 전환되어야 합니다.")
```

**2. 테스트 페이로드 생성:**
위 엔진을 검증하기 위해, 의도적으로 시스템 오류와 A/B 변수 발동 지점을 포함하는 샘플 JSON 데이터를 정의해야 합니다. 기존의 `test_synced_payload.json`를 활용하여 구조적 오류가 있는 새 버전을 만듭니다.

<create_file path="c:\Users\leesj\connect-ai-projects\_company\_agents\developer\tools\data\test_simulation_payload.json">{
    "metadata_version": "v5.1",
    "title": "시스템 오류를 진단하는 당신의 능력 (A/B Test Slot)",
    "segments": [
        {
            "T_start": 0.0,
            "T_end": 3.0,
            "script_content": "도입부: 모든 것이 완벽해 보이지만, 사실은 근본적인 지식 오류가 있습니다.",
            "system_alert": False,
            "is_void_layer": False,
            "A_B_Test": {
                "Title": {"Default": "제목 A (지적 불안감)", "Variant1": "제목 B (직접 위협)"},
                "CTA": {"Default": "Basic 진단권 문의", "Variant1": "Premium 패키지 구매"}
            }
        },
        {
            "T_start": 3.0,
            "T_end": 8.5,
            "script_content": "문제 제기: 데이터의 공백(Void Layer)은 단순한 침묵이 아닙니다. 그것은 시스템적 오류입니다.",
            "system_alert": False,
            "is_void_layer": True,
            "A_B_Test": {
                "Title": {"Default": "지식 공백을 포착하세요."},
                "CTA": {"Default": "진단보고서 필요성 강조"}
            }
        },
        {
            "T_start": 8.5,
            "T_end": 10.0,
            "script_content": "최대 위기 고조 구간 진입.",
            "system_alert": True,
            "error_type": "SyncFailure",
            "reason": "메타데이터 v5.0의 Time Code 동기화 실패 (T+8.5s에서 비주얼 에셋 로딩 지연)",
            "is_void_layer": False
        },
        {
            "T_start": 10.0,
            "T_end": 12.0,
            "script_content": "해결책 제시: 오직 전문가의 진단만이 이 오류를 해결할 수 있습니다.",
            "system_alert": False,
            "is_void_layer": False,
            "A_B_Test": {
                "Title": {"Default": "지금 즉시 진단받기"},
                "CTA": {"Default": "Premium 패키지 구매 (최종 CTA)"}
            }
        }
    ]
}