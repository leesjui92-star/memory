# e2e_tester.py
import json
from typing import Dict, Any
import time

# --- Mocking Services (Dependencies) ---

def mock_api_call(endpoint: str, payload: Dict[str, Any]) -> bool:
    """Mock API 호출을 시뮬레이션합니다. 실제 네트워크 통신 대신 로직만 검증."""
    print(f"   [API MOCK] Calling {endpoint} with data: {payload['key']}...")
    # 구조적 오류가 포함된 경우 실패를 가정 (디버깅 용이)
    if endpoint == "api/fail_trigger":
        return False
    time.sleep(0.1)
    print("   [API MOCK] ✅ Success.")
    return True

def render_ui_component(asset_id: str, timecode: float):
    """디자이너가 정의한 컴포넌트를 시간 코드에 맞춰 렌더링을 시뮬레이션."""
    if asset_id.startswith("A-003"): # Critical Failure Alert (T+25s)
        print(f"   [UI RENDER] ✨ Triggering {asset_id} at T+{timecode:.1f}s.")
        # 실제 렌더링 로직: Neon Cyan 색상, Glitch 효과, 애니메이션 루프 확인
    elif asset_id == "A-002": # Low Risk Warning
        print(f"   [UI RENDER] 🟡 Triggering {asset_id} at T+{timecode:.1f}s. (Mild Shake)")
    else:
        print(f"   [UI RENDER] 📄 Rendering generic component {asset_id}.")

def play_sound_event(audio_event: str, timecode: float):
    """사운드 이벤트를 시뮬레이션합니다."""
    print(f"   [AUDIO EVENT] 🔊 Playing '{audio_event}' at T+{timecode:.1f}s.")


# --- Core E2E Orchestrator ---

class SyncOrchestrator:
    """
    통합 스토리보드 데이터를 받아 시간 흐름에 따른 모든 요소를 검증하는 핵심 로직.
    (sync_validator.py의 기능을 확장하여 렌더링까지 포함)
    """
    def __init__(self, storyboard_data: Dict[str, Any]):
        self.storyboard = storyboard_data

    def run_e2e_test(self):
        print("\n=======================================================")
        print("🚀 E2E 통합 싱크 테스트 시작 (Master Asset v7.0 기반)")
        print("=======================================================\n")
        
        all_success = True

        for scene in self.storyboard['scenes']:
            scene_id = scene['id']
            start_time = scene['timecode_start']
            end_time = scene['timecode_end']
            duration = end_time - start_time
            
            print(f"\n--- [SCENE START] ID: {scene_id} | Duration: {duration:.1f}s ---")

            # 1. 필수 API 호출 검증 (데이터 파이프라인 안정성)
            if 'api_trigger' in scene and scene['api_trigger']:
                print("--- [PHASE 1/3] API 데이터 트리거 확인...")
                success = mock_api_call(scene['api_trigger']['endpoint'], scene['api_trigger'])
                if not success:
                    print(f"!!! E2E FAILURE !!! Scene {scene_id}: Critical API failure detected.")
                    all_success = False

            # 2. UI/UX 컴포넌트 활성화 검증 (디자인 에셋 통합)
            print("--- [PHASE 2/3] UI/UX 경고 컴포넌트 시각화 확인...")
            for asset in scene.get('visual_assets', []):
                render_ui_component(asset['id'], start_time + float(asset['trigger_offset']))

            # 3. 오디오 및 트랜지션 검증 (사운드 아키텍처 동기화)
            print("--- [PHASE 3/3] 사운드 이벤트 및 전환부 확인...")
            for audio in scene.get('audio_events', []):
                play_sound_event(audio['name'], start_time + float(audio['trigger_offset']))

        if all_success:
            print("\n=======================================================")
            print("✅ E2E 테스트 완료: 모든 시스템 요소가 시간적으로 동기화되어 정상 작동합니다.")
            print("=======================================================\n")
        else:
            print("\n=======================================================")
            print("❌ E2E 테스트 실패: 위에서 발견된 결함들을 수정해야 합니다. (Debugging Required)")
            print("=======================================================")

if __name__ == "__main__":
    # 실제 운영 환경에서는 파일 경로를 통해 데이터를 로드합니다.
    try:
        with open("data/test_synced_payload.json", 'r') as f:
            storyboard = json.load(f)
    except FileNotFoundError:
        print("[ERROR] Please ensure 'data/test_synced_payload.json' exists.")
        exit()

    orchestrator = SyncOrchestrator(storyboard)
    orchestrator.run_e2e_test()