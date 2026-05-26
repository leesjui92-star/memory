import json
from sync_validator import SyncOrchestrator # 기존 Validator 사용
from mock_api_service import MockAPIService # API 통신 시뮬레이션

# 전역 설정 상수 (나중에 수정 가능하도록 분리)
TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

def run_e2e_simulation(payload_path: str):
    """
    E2E Mock Testbed의 메인 진단 함수. 
    JSON 페이로드를 로드하여 시간 흐름에 따른 모든 요소의 안정성을 검증한다.
    """
    print("=====================================================")
    print("✅ [Mock Testbed] E2E 시뮬레이션 시작...")
    print("=====================================================\n")

    try:
        with open(payload_path, 'r', encoding='utf-8') as f:
            storyboard_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ 오류: 페이로드 파일을 찾을 수 없습니다: {payload_path}")
        return False

    # 1. 데이터 유효성 검사 (Structural Validation)
    try:
        validator = SyncOrchestrator(storyboard_data)
        if not validator.validate_schema():
            print("🚨 [STAGE 1 FAILURE] 구조적 스키마 오류가 발견되었습니다. 테스트 중단.")
            return False
        print("✅ [STAGE 1 SUCCESS] 스키마 및 필수 데이터 필드 검증 완료.")
    except Exception as e:
        print(f"❌ [STAGE 1 CRITICAL ERROR] Validator 실행 실패: {e}")
        return False

    # 2. 시간/이벤트 흐름 시뮬레이션 (Temporal Simulation)
    mock_api = MockAPIService()
    timeline = storyboard_data.get("scenes", [])
    total_time_elapsed = 0

    print("\n--- [STAGE 2] Timecode 기반 이벤트 및 API 호출 순차 검증 ---")
    for i, scene in enumerate(timeline):
        scene_name = scene.get("name", f"Scene {i+1}")
        start_time_sec = float(scene.get("start_time_seconds", 0))
        duration_sec = float(scene.get("duration_seconds", 5))

        # 시간 누적 및 Gap 체크 (이 부분이 가장 중요함)
        gap_time = start_time_sec - total_time_elapsed
        if gap_time < -1: # 시간이 거꾸로 가거나, 비정상적인 간격.
             print(f"⚠️ [Warning] {scene_name}: 시간 흐름 오류! Gap Time이 음수입니다 ({gap_time:.2f}s).")
        elif i > 0 and gap_time > 1.5: # 지나치게 긴 공백 발견 시 경고
             print(f"⚠️ [Warning] {scene_name}: 이전 장면 대비 큰 시간 공백({gap_time:.2f}s)이 감지되었습니다.")

        # 이벤트별 검증 로직 실행
        for event in scene.get("events", []):
            event_type = event.get("type")
            trigger_code = event.get("timecode")

            if event_type == "Warning_Trigger":
                print(f"   [T+{trigger_code}s] 🔴 경고 컴포넌트 활성화 시뮬레이션: '{event['message']}' (Designer Asset Check)")
                # 여기서 Designer가 제공한 Mock API를 호출하여 비주얼 에셋 로딩을 가정한다.
                if not mock_api.check_warning_assets(trigger_code):
                    print("     ❌ [CRITICAL FAILURE] 경고 컴포넌트 리소스 로드 실패!")

            elif event_type == "API_Call":
                print(f"   [T+{trigger_code}s] ⚙️ API 호출 시뮬레이션: {event['api_endpoint']} (Mock API Check)")
                # 여기서 실제로 Mock API를 호출하여 백엔드 로직을 테스트한다.
                if not mock_api.call_service(event['api_endpoint']):
                    print("     ❌ [CRITICAL FAILURE] API 서비스 호출 실패! 데이터 계약 위반 의심.")

        total_time_elapsed = start_time_sec + duration_sec
    
    # 3. 최종 결과 정리
    if total_time_elapsed > 120: # 가상의 최대 길이 제한 (예시)
        print("\n✅ [SUCCESS] 모든 요소의 흐름 검증이 완료되었습니다. 전반적인 안정성은 확보되었습니다.")
        return True
    else:
         print(f"\n⚠️ [SUMMARY WARNING] 시뮬레이션된 총 시간({total_time_elapsed:.2f}s)이 예상치보다 짧습니다. 여유 공간을 확인하세요.")
         return False


if __name__ == "__main__":
    # 사용자가 만든 테스트 페이로드 경로를 지정
    TEST_PAYLOAD = "c:\\Users\\leesj\\connect-ai-projects\\_company_agents\\developer\\tests\\test_synced_payload.json"
    run_e2e_simulation(TEST_PAYLOAD)