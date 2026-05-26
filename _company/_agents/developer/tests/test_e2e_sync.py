import unittest
from datetime import timedelta
import time

# 최근 작업 파일의 절대 경로를 사용하여 모킹 서비스 임포트
# c:\Users\leesj\OneDrive\Desktop\사용하지 않는 바탕화면\초보프로젝트\mock_api_service.py
try:
    from mock_api_service import MockAPIService
except ImportError as e:
    print(f"🚨 ERROR: MockAPIService를 불러올 수 없습니다. 경로를 확인해주세요: {e}")
    exit()

class TimeCodeSyncTest(unittest.TestCase):
    """
    T+25s, T+36s 등 핵심 시간 코드에 맞춰 API 이벤트가 발생하는지 E2E 테스트합니다.
    시간 흐름을 시뮬레이션하며 시스템의 안정성을 검증하는 것이 목표입니다.
    """

    def setUp(self):
        # Mock 서비스 초기화 (테스트 격리를 위해 각 테스트마다 새로 생성)
        self.mock_api = MockAPIService()
        print("\n[TEST SETUP] Mock API Service가 준비되었습니다.")

    def test_sync_flow_validation(self):
        """
        스크립트 시간 흐름을 시뮬레이션하며 T+25s와 T+36s의 트리거를 검증합니다.
        """
        print("\n" + "="*50)
        print("🚀 E2E 싱크 검증 시작: 시간 코드 기반 API 호출 테스트")
        print("="*50)

        # --- 가상 영상 재생 및 시간 흐름 시뮬레이션 ---
        test_script = [
            (0, "Intro Scene (T+0s)", None),
            (10, "Build Up - Problem Definition", None),
            # ------------------ T+25s 트리거 구간 ------------------
            (25, "System Failure Warning Point", "ALERT_FAIL_V6"), # <- Trigger 1: T+25s
            (30, "Basic Solution Intro", None),
            # ------------------ T+36s 트리거 구간 ------------------
            (36, "Standard Tier Urgency Peak", "CALL_STANDARD_V6"), # <- Trigger 2: T+36s
            (45, "Resolution & CTA", None)
        ]

        for timecode, description, trigger_key in test_script:
            # 시간 진행 시뮬레이션 (실제로는 loop/sleep 대신 테스트 로직으로 대체됨)
            time.sleep(0.1) # 로그 가독성을 위한 최소 딜레이 추가
            print(f"\n[TIMECODE: T+{timecode}s] -> {description}")

            if trigger_key:
                # 핵심 트리거 감지 시, Mock API 호출을 강제 실행하여 검증
                print(f"✨ [TRIGGER DETECTED!] 시간 코드 ({timecode}s) 도달. API 호출 시도: {trigger_key}")
                try:
                    response = self.mock_api.call_component(trigger_key, timecode=timecode)
                    self.assertIsNotNone(response, f"🚨 FAIL: Time={timecode}s에서 {trigger_key}에 대한 응답이 null입니다.")
                    print(f"✅ SUCCESS: API 호출 성공. 데이터 수신 확인 (Status: {response['status']})")

                except Exception as e:
                    self.fail(f"🚨 CRITICAL FAIL: Time={timecode}s에서 API 호출 중 예외 발생. 에러: {e}")
            else:
                print("... 일반 스토리 진행 중. 이벤트 없음.")

        print("\n" + "="*50)
        print("✅ E2E 싱크 검증 완료. 모든 트리거가 정상 작동했습니다.")
        print("="*50)


if __name__ == "__main__":
    # 이 파일을 직접 실행할 때 unittest 프레임워크를 사용합니다.
    unittest.main(argv=['first-arg-is-ignored'], exit=False)