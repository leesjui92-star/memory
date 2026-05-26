import json
from sync_validator import SyncOrchestrator # 수정된 Validator를 임포트 가정

# --------------------------------------------------------------
# MOCK API DATA SOURCE SIMULATION (T+36s Critical Failure Point)
# 이 데이터는 레오/디자이너가 만든 최종 블루프린트를 모방합니다.
MOCK_API_PAYLOAD = {
    "scene": "Critical System Anomaly Detection",
    "timecode": 36.0, # T+36초 지점 지정
    "event_type": "Data Inconsistency Check",
    "api_call": None, # Mock API가 실패하는 상황 시뮬레이션
    "visual_state": {"status": "DEGRADED", "error_code": "SYS-E404"}
}

def mock_api_trigger(payload):
    """Mock API 호출을 시뮬레이션하고 데이터를 반환합니다."""
    print("============================================================")
    print("[🌐 Mock API Trigger] T+36s 데이터 바인딩 로직 실행 중...")
    print(f"-> 입력 Payload: {json.dumps(payload, indent=2)}")

    # 핵심 시뮬레이션: API 호출 실패를 유도하여 오류 상황을 만듭니다.
    if payload["timecode"] == 36.0 and "SYS-E404" in payload["visual_state"]["error_code"]:
        print("[⚠️ API Call] 데이터 불일치 감지. Mock API 응답: FAILURE")
        return {"status": "FAILURE", "data": None}
    else:
        print("[✅ API Call] 정상 응답 (시뮬레이션).")
        return {"status": "SUCCESS", "data": {"timestamp": "2026-12-31T23:59:59"}}

def run_e2e_test(storyboard_data):
    """E2E 통합 테스트를 실행하고 결과 및 UI 렌더링 흐름을 시뮬레이션합니다."""
    print("\n\n=================== [🚀 E2E TEST HARNESS START] ===================")

    # 1. Validator 초기화 (Backend Logic Check)
    orchestrator = SyncOrchestrator(storyboard_data)
    validation_result = orchestrator.run_validation(storyboard_data)
    print(f"\n[⚙️ Validation Module] 검증 결과 수신: {validation_result['status']}")

    # 2. Mock API 호출 시뮬레이션 (Data Binding Check)
    api_response = mock_api_trigger(MOCK_API_PAYLOAD)

    # 3. 최종 오류 처리 및 UI 렌더링 로직 실행 (Frontend Simulation)
    if validation_result['status'] == "FAILURE" and api_response["status"] == "FAILURE":
        print("\n[🖥️ Frontend Renderer] *** CRITICAL ALERT TRIGGERED ***")
        # T+36초 시퀀스의 핵심 목표: 오류 코드 및 경고 UI 반영
        error_code = MOCK_API_PAYLOAD['visual_state']['error_code']
        severity = validation_result['ui_alert_severity']

        print(f"    [🚨 VISUAL] 배경 오버레이 활성화 (색상: RED, 깜빡임)")
        print(f"    [🔊 AUDIO] 임펄스 사운드 트리거 (Sub-Bass 150ms) - {severity} 레벨")
        print("    --------------------------------------------------")
        print(f"    > 시스템 경고 메시지: {validation_result['message']}")
        print(f"    > 구조적 결함 코드: <span style='color:red;'>{error_code}</span> (실시간 데이터 바인딩 성공)")
        print("    --------------------------------------------------")
        return True # 테스트 통과 (오류 감지 및 UI 반영까지 완료)

    elif validation_result['status'] == "SUCCESS":
        print("\n[🖥️ Frontend Renderer] [✅ SUCCESS] 모든 시스템 요소가 안정적으로 작동합니다.")
        return False

# --------------------------------------------------------------
# 실행부: 의도적으로 오류를 포함한 테스트 페이로드를 사용합니다.
if __name__ == "__main__":
    # test_synced_payload_error.json 파일의 데이터를 로드하여 테스트에 사용합니다.
    # (실제로는 JSON 파일을 읽어서 전달받아야 하지만, 여기서는 구조체로 직접 입력)
    test_data = {
        "timecode": 36.0,
        "event_type": "Data Inconsistency Check",
        "api_call": None, # 실패 유도
        "visual_state": {"status": "DEGRADED", "error_code": "SYS-E404"}
    }
    run_e2e_test(test_data)
# --------------------------------------------------------------