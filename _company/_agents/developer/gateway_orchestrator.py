# gateway_orchestrator.py

import json
from typing import Dict, Any, Optional
from datetime import datetime

# ==============================================================================
# 🚨 MOCK API MODULES (실제 환경에서는 외부 라이브러리 호출로 대체됨)
# 테스트를 위해 실패/성공 케이스가 가능한 모의 함수 사용
# ==============================================================================

def call_auto_planner(input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """자동 플래너 API 호출 시뮬레이션. 성공 또는 누락 데이터 에러 테스트용."""
    print("--- [API] Calling Auto Planner...")
    if input_data.get("fail_auto"):
        raise ConnectionError("Auto Planner Service: API Key Missing or Timeout.")
    # 의도적으로 구조가 불완전한 데이터를 반환하는 시나리오 구현
    return {
        "source": "AutoPlanner",
        "structural_failure_points": [
            {"time": "0:15", "type": "Data Drift Warning", "impact": "High"},
            # 'severity' 필드가 누락되어 Validator가 처리해야 함을 테스트
            {"time": "1:30", "type": "System Overload Alert", "details": "Core Dependency Failure"} 
        ]
    }

def call_trend_sniper(input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """트렌드 스나이퍼 API 호출 시뮬레이션. 성공 또는 데이터 형식 에러 테스트용."""
    print("--- [API] Calling Trend Sniper...")
    if input_data.get("fail_trend"):
        return None # 명시적 Null 반환으로 처리 로직 검증 (NoneType)
    # 트렌드 스나이퍼는 텍스트 기반의 구조화된 데이터를 반환한다고 가정
    return {
        "source": "TrendSniper",
        "key_phrases": ["System Collapse", "Data Integrity Crisis"],
        "market_sentiment": {"score": 0.85, "trend": "Falling"} # 데이터 타입 일치성 검증 대상
    }

# ==============================================================================
# ✅ CORE ORCHESTRATOR CLASS (게이트웨이)
# ==============================================================================

class GatewayOrchestrator:
    """
    여러 외부 API 소스로부터 데이터를 통합 수집하고, 
    표준화된 '숏폼 API 메타데이터 JSON 스키마 v4.0' 형식으로 변환 및 검증하는 핵심 게이트웨이.
    """

    def __init__(self):
        print("💻 GatewayOrchestrator 초기화 완료. 데이터 수집 준비 중.")
        self.collected_data: Dict[str, Any] = {}

    def run_ingestion(self, input_params: Dict[str, Any]) -> bool:
        """모든 외부 API를 순차적으로 호출하고 실패를 처리하여 데이터를 통합합니다."""
        print("\n==========================================")
        print("🚀 [STAGE 1] 데이터 인제스천 시작 (Robust Call)")
        print("==========================================")

        # 1. Auto Planner 호출 및 예외 처리
        try:
            planner_data = call_auto_planner(input_params)
            self.collected_data['planner'] = planner_data or {"structural_failure_points": []}
            print("✅ [Success] Auto Planner 데이터 수집 완료.")
        except ConnectionError as e:
            # 강건한 예외 처리 1: API 연결 문제 (Connection Error)
            self.collected_data['planner'] = {"error": f"Connection Failed: {e}", "structural_failure_points": []}
            print(f"⚠️ [WARNING] Auto Planner 호출 실패: {e}. 빈 배열로 대체합니다.")
        except Exception as e:
            # 강건한 예외 처리 2: 예측 못한 시스템 오류 (General Error)
            self.collected_data['planner'] = {"error": f"Unknown Failure: {type(e).__name__}", "structural_failure_points": []}
            print(f"❌ [CRITICAL] Auto Planner 예상치 못한 실패: {e}. 게이트웨이 중단 위험.")

        # 2. Trend Sniper 호출 및 예외 처리
        try:
            sniper_data = call_trend_sniper(input_params)
            self.collected_data['sniper'] = sniper_data if sniper_data else {} # None이면 빈 딕셔너리로 처리
            print("✅ [Success] Trend Sniper 데이터 수집 완료.")
        except Exception as e:
            # 강건한 예외 처리 3: 예측 못한 시스템 오류 (General Error)
            self.collected_data['sniper'] = {"error": f"Unknown Failure: {type(e).__name__}"}
            print(f"❌ [CRITICAL] Trend Sniper 예상치 못한 실패: {e}.")

        return True


    def validate_and_transform(self) -> Optional[Dict[str, Any]]:
        """
        수집된 데이터를 v4.0 스키마에 맞춰 변환하고 유효성을 검사합니다. 
        (데이터 누락/비정형화 방지 로직 최우선 구현)
        """
        print("\n==========================================")
        print("✨ [STAGE 2] 데이터 변환 및 유효성 검증 (Schema v4.0)")
        print("==========================================")

        # --- 1. 기본 구조 정의 및 초기화 ---
        final_payload: Dict[str, Any] = {
            "schema_version": "v4.0",
            "timestamp": datetime.now().isoformat(),
            "structural_narrative": [], # 최종 출력 배열 (핵심)
            "metadata": {
                "source_status": "Partial Success", 
                "error_log": []
            }
        }

        # --- 2. Planner 데이터 처리 및 변환 로직 ---
        planner = self.collected_data.get('planner', {})
        if 'error' in planner:
             final_payload["metadata"]["source_status"] = "Partial Failure (Planner)"
             final_payload["metadata"]["error_log"].append(f"Planner Failed: {planner['error']}")
        else:
            # 구조적 실패 지점 순회 및 스키마 매핑
            for item in planner.get('structural_failure_points', []):
                try:
                    # 데이터 누락 처리 (Missing Key Handling)
                    time = str(item.get('time', 'N/A')) # 시간 필드가 없으면 N/A로 대체
                    if time == 'N/A': continue

                    narrative_entry = {
                        "timestamp": time,
                        "warning_type": item.get("type", "Unknown Warning"),
                        "severity": item.get("impact", "Low").upper(), # 강제 상위 케이스 변환 (ENUM 처리)
                        "description": str(item.get('details', 'No details provided')) 
                    }
                    final_payload["structural_narrative"].append(narrative_entry)
                except Exception as e:
                    # 항목 단위 예외 처리 (Item Level Failure Handling)
                    final_payload["metadata"]["error_log"].append(f"Failed to process structural point {item}: {str(e)}")

        # --- 3. Trend Sniper 데이터 처리 및 변환 로직 ---
        sniper = self.collected_data.get('sniper', {})
        if 'error' in sniper:
            final_payload["metadata"]["source_status"] = "Partial Failure (Sniper)"
            final_payload["metadata"]["error_log"].append(f"Sniper Failed: {sniper['error']}")
        else:
            # 데이터 타입 검증 및 매핑
            try:
                sentiment_score = float(sniper.get('market_sentiment', {}).get('score')) # 강제 Float 변환 시도
                final_payload["metadata"]["key_phrases"] = sniper.get("key_phrases", [])

                # 최종 메타데이터에 중요한 수치 정보를 추가하여 구조화함
                final_payload["metadata"]["critical_metric"] = {
                    "sentiment_score": sentiment_score, 
                    "trend_status": sniper.get('market_sentiment', {}).get('trend')
                }
            except ValueError:
                 # 데이터 타입 불일치 처리 (Type Mismatch Handling)
                final_payload["metadata"]["error_log"].append("Critical Metric Conversion Failed: Sentiment score is not a valid float.")


        return final_payload

    def save_to_file(self, data: Dict[str, Any], path: str):
        """최종 결과물을 파일로 저장하는 유틸리티."""
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4)
            print(f"\n✅ [COMPLETE] 최종 구조화된 JSON 페이로드 생성이 완료되었습니다. ({path})")
        except Exception as e:
            print(f"❌ [FATAL] 파일 저장 중 오류 발생: {e}")


# ==============================================================================
# 🧪 실행 및 테스트 로직 (Test Harness)
# ==============================================================================

def run_test_harness():
    """전체 게이트웨이 워크플로우를 시뮬레이션하고 결과를 검증합니다."""
    print("\n############################################################")
    print("=== 🚀 [SYSTEM TEST START] Gateway Orchestrator E2E Test ===")
    print("############################################################\n")

    # 테스트 환경 설정: 의도적으로 에러를 포함한 입력 파라미터 사용
    test_params = {
        "fail_auto": False, # 1차 테스트에서는 성공 경로로 시작
        "fail_trend": None  # Trend Sniper는 정상 작동 가정
    }

    orchestrator = GatewayOrchestrator()
    
    # 1. 데이터 인제스천 실행
    orchestrator.run_ingestion(test_params)

    # 2. 변환 및 검증 실행
    final_data = orchestrator.validate_and_transform()

    if final_data:
        output_path = "synced_metadata_v4.0_test_run.json"
        orchestrator.save_to_file(final_data, output_path)
    else:
        print("\n❌ [FAIL] 최종 페이로드 생성 실패. 필수 데이터가 누락되었습니다.")

if __name__ == "__main__":
    run_test_harness()