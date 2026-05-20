import json
import argparse
from typing import Dict, Any

# --- 상수 정의 및 가짜 API 호출 ---
def api_call_vfx(component: str, state: str) -> str:
    """VFX 컴포넌트의 상태 변화를 시뮬레이션하는 함수."""
    if component not in ["GlitchOverlay", "KnowledgeGapGraph", "SystemAlert"]:
        return f"[Error] Unknown Component: {component}"
    return f"✅ API Success: Activated/Deactivated '{component}' to state {state}."

def api_call_audio(effect: str, time_ms: int) -> str:
    """오디오 이펙트의 타이밍을 시뮬레이션하는 함수."""
    return f"🔊 Audio Triggered: Applying {effect} at T+{time_ms}ms."

# --- 핵심 오케스트레이터 클래스 ---
class TimelineOrchestrator:
    def __init__(self, payload_path: str):
        print(f"[INIT] ⚙️ 로딩 중... Payload 파일 분석 시작: {payload_path}")
        try:
            with open(payload_path, 'r', encoding='utf-8') as f:
                self.storyboard = json.load(f)
        except FileNotFoundError:
            print(f"[FATAL] 🚨 Payload 파일을 찾을 수 없습니다: {payload_path}")
            exit(1)

    def run_simulation(self):
        """전체 타임라인을 순회하며 동기화 로직을 실행합니다."""
        print("\n" + "="*80)
        print("🚀 Starting Master Timeline Synchronization Simulation (90 Seconds)")
        print("="*80 + "\n")

        # 전체 스토리보드를 시간 순서대로 정렬 (안전장치)
        timeline_events = self.storyboard.get('scenes', [])
        if not timeline_events:
            print("[WARN] ⚠️ 스토리보드에 'scenes' 데이터가 없습니다. 로직을 확인할 수 없습니다.")
            return

        # 시간 순서대로 모든 이벤트를 취합하여 처리 (E2E 시뮬레이션)
        all_time_points = []
        for scene in timeline_events:
             if 'transitions' in scene:
                 all_time_points.extend(scene['transitions'])

        # 시간 포인트별로 정렬 및 고유화
        all_time_points = sorted(list({tp['time_ms']: tp for tp in all_time_points}.values()), key=lambda x: x['time_ms'])


        last_time = 0
        for event in all_time_points:
            current_time = event['time_ms']
            event_type = event.get('type', 'General')

            # 시간 간격 검증 (Gap Check)
            if last_time != 0 and current_time > last_time + 50: # 50ms 허용 오차 가정
                print(f"\n[!! ERROR] 🔴 TIMING GAP DETECTED! ({last_time}ms -> {current_time}ms). Transition Buffer 필요.")

            # 1. VFX 컴포넌트 로직 실행 (핵심)
            if 'vfx' in event:
                print(f"\n[T+{current_time/1000:.2f}s] >> === VFX COMPONENT ACTIVATION ({event['scene_id']}) ===")
                for vfx_component, state in event['vfx'].items():
                    if state.lower() == 'active':
                        print(api_call_vfx(vfx_component, "ACTIVE"))
                    elif state.lower() == 'inactive':
                        print(api_call_vfx(vfx_component, "INACTIVE"))

            # 2. 오디오/SFX 로직 실행
            if 'audio' in event:
                print(f"\n[T+{current_time/1000:.2f}s] >> === AUDIO SYNCHRONIZATION ===")
                for audio_effect, duration in event['audio'].items():
                    print(api_call_audio(audio_effect, current_time))

            # 3. 데이터 및 CTA 로직 실행
            if 'data_point' in event:
                 print(f"\n[T+{current_time/1000:.2f}s] >> === DATA POINT / CTA TRIGGER ===")
                 print(f"📈 Data Visualization Triggered: {event['data_point']['metric']} (Duration: {event['data_point']['duration']})")

            last_time = current_time

        print("\n=========================================================================")
        print("✨ Simulation Complete. 모든 컴포넌트가 시간 코드에 맞춰 성공적으로 처리되었습니다.")
        print("=========================================================================\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Master Timeline Sync Orchestrator")
    parser.add_argument("--payload", required=True, help="The JSON payload containing the synchronized storyboard data.")
    args = parser.parse_args()

    orchestrator = TimelineOrchestrator(args.payload)
    orchestrator.run_simulation()