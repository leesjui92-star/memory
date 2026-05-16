import json
from typing import List, Dict, Any

# TODO: 실제 환경에서는 asset_loader.py의 API를 호출하여 데이터를 불러와야 합니다.
# 여기서는 구조 검증을 위해 Mock 데이터를 사용합니다.
def load_mock_assets(payload_data: Dict[str, Any]) -> List[Dict]:
    """
    가정: asset_loader.py에서 payload_data를 기반으로 실제 에셋 메타데이터를 불러오는 기능.
    현재는 구조 검증을 위해 Mock 데이터를 사용합니다.
    """
    print("--- ⚙️ [Validator] Loading assets from provided payload... ---")
    # 로더가 성공적으로 동작했다고 가정하고, 페이로드의 리스트를 반환합니다.
    return payload_data.get("assets", [])

class SyncOrchestrator:
    """
    모듈형 애셋들의 동기화 및 유효성을 시스템 레벨에서 검증하는 핵심 클래스.
    A-Sync Protocol에 기반하여 시간적, 구조적 결함을 진단합니다.
    """
    def __init__(self, storyboard_data: Dict):
        self.storyboard = storyboard_data

    def validate(self) -> bool:
        """
        전체 시스템 동기화 검증을 수행하고 결과를 반환합니다. (True: OK, False: Failure)
        """
        print("\n[✅ Sync Validator] Starting comprehensive synchronization check...")
        assets = load_mock_assets(self.storyboard)

        # 1. 필수 애셋 존재 여부 및 구조적 유효성 검사
        if not assets:
            print("🚨 [FAIL] Critical Error: No asset data found in the storyboard payload.")
            return False

        for i, asset in enumerate(assets):
            asset_id = asset.get("asset_id", f"Unknown Asset {i}")
            # 필수 필드 체크 (예: time_code, content_type)
            if 'time_code' not in asset or 'content_type' not in asset:
                print(f"🚨 [FAIL] Validation Error on '{asset_id}': Missing critical fields (time_code or content_type).")
                return False

        # 2. 시간 코드 동기화 및 간격 검증 (Time Gap Check)
        if not self._check_timeline_consistency(assets):
            print("🚨 [FAIL] Timing Error: Found inconsistency in time codes or invalid transitions.")
            return False

        # 3. 콘텐츠별 의존성 및 패턴 체크 (Dependency & Pattern Check)
        if not self._check_dependencies(assets):
            print("🚨 [FAIL] Dependency Error: Assets violate defined structural/technical dependencies.")
            return False

        print("\n✅ [SUCCESS] All assets passed Sync Validation check. System is stable.")
        return True

    def _check_timeline_consistency(self, assets: List[Dict]) -> bool:
        """시간 코드 순서와 간격(Gap)을 검증합니다."""
        print("  - Running Timeline Consistency Check...")
        try:
            sorted_assets = sorted(assets, key=lambda x: float(x['time_code']))
        except ValueError:
             print("   [ERROR] Time code format error detected. Cannot sort timeline.")
             return False

        for i in range(len(sorted_assets) - 1):
            current = sorted_assets[i]
            next_asset = sorted_assets[i+1]
            current_time = float(current['time_code'])
            next_time = float(next_asset['time_code'])

            # 시간 간격 (Gap) 체크: 일반적으로 최소 0.3초 이상의 전환 시간이 필요하다고 가정.
            gap = next_time - current_time
            if gap < 0.1 and i > 0: # 너무 짧은 간격 경고
                 print(f"   [WARN] Time Gap Warning between '{current['asset_id']}' ({current_time:.2f}s) and '{next_asset['asset_id']}' ({next_time:.2f}s). Gap is only {gap:.2f}s. Consider adding a transition module.")
            elif gap < 0:
                 # 시간 역행은 심각한 오류이므로 즉시 실패 처리
                print(f"   [CRITICAL FAIL] Time Reversal Detected! Next asset time ({next_time:.2f}s) is before current asset time ({current_time:.2f}s).")
                return False

        return True

    def _check_dependencies(self, assets: List[Dict]) -> bool:
        """애셋 간의 기술적/논리적 의존성(예: BGM은 언제 시작해야 하는가)을 검증합니다."""
        print("  - Running Dependency Check...")
        # 예시 1: CTA (Call To Action) 애셋이 반드시 'conclusion' 타입 다음에 와야 함.
        cta_found = False
        for asset in assets:
            if asset['content_type'] == 'CTA':
                cta_found = True
            elif asset['content_type'] == 'Conclusion' and cta_found:
                 pass 

        # 예시 2: 특정 애셋 타입(예: Graphic Overlay)이 누락되었는지 확인 (필수 요소 체크)
        if not any(a['content_type'] in ['Graphic Overlay', 'System Warning'] for a in assets):
            print("   [WARN] Dependency Warning: Mandatory 'Visual Effect Module' (e.g., Graphic Overlay or System Warning) is missing. This weakens the perceived authority.")

        return True


# --------------------------------------------------
# 테스트 실행 로직 및 데이터 정의 (메인 블록 역할)
if __name__ == "__main__":
    payload_data = {
        "storyboard_title": "Systemic Vulnerability Report",
        "assets": [
            {"asset_id": "intro_scene_01", "time_code": "00:00:00.00", "content_type": "Hook", "source": "Video Clip"},
            # 정상 흐름 (Success path simulation)
            {"asset_id": "main_data_02", "time_code": "00:00:03.50", "content_type": "Data Display", "source": "Chart"}, 
            {"asset_id": "tension_build_03", "time_code": "00:00:15.00", "content_type": "Narrative", "is_mandatory_effect": True}, # 의존성 체크를 위한 임시 플래그 추가
            # 🚨 오류 유발 지점: 시간 코드가 앞선 애셋보다 작음 (Time Reversal) -> 반드시 실패해야 함!
            {"asset_id": "incorrectly_placed_cta", "time_code": "00:00:10.00", "content_type": "CTA", "source": "Image"}, 
            # 시간 코드가 비어있는 애셋 (Missing Critical Field) -> 실패해야 함!
            {"asset_id": "final_conclusion_05", "time_code": "", "content_type": "Conclusion", "source": "Video Clip"}
        ]
    }

    print("\n===================================================")
    print("       🚀 SyncValidator Test Run: Failure Scenario")
    print("===================================================\n")

    try:
        orchestrator = SyncOrchestrator(payload_data)
        success = orchestrator.validate()
        print(f"\n[FINAL RESULT] Validation Status: {'PASS' if success else 'FAIL'} ❌")
    except Exception as e:
        print(f"\n[SYSTEM CRASH] An unhandled exception occurred during validation: {e}")