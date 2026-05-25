import json
from typing import List, Dict, Any

class KPIValidator:
    """
    T+25s와 T+36s 지점의 가상 시청자 이벤트 스트림을 받아 
    주요 KPI를 계산하고 진단하는 핵심 엔진 클래스.
    [근거: CEO 지시, 코다리 개인 메모리]
    """

    def __init__(self, storyboard_data: Dict):
        # 통합 테스트 환경의 기준 데이터(페이로드)를 로드합니다.
        self.storyboard = storyboard_data
        self.kpi_results: Dict[str, Any] = {
            "total_views": 0,
            "view_duration_sum": 0.0, # 초 단위 누적 시간
            "cta_clicks": 0,
            "critical_defect_detected": False,
            "diagnostic_report": []
        }

    def process_event(self, event: Dict) -> None:
        """
        단일 가상 시청자 이벤트를 처리하고 KPI를 업데이트합니다.
        예시 이벤트 구조: 
        {"timestamp": 15.2, "event_type": "VIEW", "duration": 3.0, "is_cta": False}
        {"timestamp": 25.0, "event_type": "CTA_CLICK", "target": "KnowledgeGapAlert"}
        """
        timestamp = event.get("timestamp")
        event_type = event.get("event_type")

        if timestamp is None or event_type is None:
            self.kpi_results["diagnostic_report"].append(
                f"⚠️ [System Error]: Invalid event structure received at {timestamp}. Skipping."
            )
            return

        # 1. 총 시청자 수 카운트 (View 시작점 기준)
        if event_type == "VIEW":
            self.kpi_results["total_views"] += 1
        
        # 2. 평균 체류 시간(Average View Duration) 계산 로직
        elif event_type == "VIEW" and event.get("duration", 0) > 0:
            self.kpi_results["view_duration_sum"] += event.get("duration")

        # 3. CTA 클릭 이벤트 처리 (T+25s, T+36s 집중 검증)
        elif event_type == "CTA_CLICK":
            self.kpi_results["cta_clicks"] += 1
            report = f"✅ [KPI Detected]: CTA Click recorded at T+{timestamp:.2f}s. Target: {event.get('target', 'Unknown')}"
            self.kpi_results["diagnostic_report"].append(report)

        # 4. 시스템 결함 진단 (예시: T+36s에서 사운드 누락 체크)
        if timestamp > 35 and event_type == "SOUND_MISSING":
             self.kpi_results["critical_defect_detected"] = True
             report = f"🚨 [CRITICAL DEFECT]: System Sound Missing detected at T+{timestamp:.2f}s! (Expected High-Pass Whine)"
             self.kpi_results["diagnostic_report"].append(report)


    def generate_final_report(self, total_simulated_time: float = 60.0) -> Dict[str, Any]:
        """
        최종 KPI 보고서를 생성하고 진단합니다.
        """
        avg_view_duration = (self.kpi_results["view_duration_sum"] / self.kpi_results["total_views"]) if self.kpi_results["total_views"] > 0 else 0.0

        final_report = {
            "Overall Status": "PASS" if not self.kpi_results["critical_defect_detected"] else "FAILURE",
            "Simulation Time": f"{total_simulated_time:.2f}s",
            "KPI Metrics": {
                "Total Viewers Simulated": self.kpi_results["total_views"],
                "Average View Duration (seconds)": round(avg_view_duration, 2),
                "CTA Click Count (Targeted Events)": self.kpi_results["cta_clicks"]
            },
            "Diagnosis Log": "\n".join(self.kpi_results["diagnostic_report"])
        }

        if self.kpi_results["critical_defect_detected"]:
             final_report["Overall Status"] = "FAILURE (System Sync Error)"

        return final_report

# --- 테스트 예시 함수 (API 호출을 모방) ---
def run_simulation(storyboard_data: Dict, event_stream: List[Dict]):
    """
    실제 API 엔드포인트에서 이 함수가 호출된다고 가정합니다. 
    테스트 시나리오를 실행하는 메인 함수입니다.
    """
    print("===========================================")
    print("⚙️ [KPI Simulation Engine] 초기화 및 테스트 시작...")
    validator = KPIValidator(storyboard_data)

    for event in event_stream:
        validator.process_event(event)
    
    report = validator.generate_final_report()
    
    print("\n✅ [Simulation Complete] 최종 진단 보고서:")
    print("-------------------------------------------")
    print(json.dumps(report, indent=4))
    print("===========================================")

# 예시 페이로드 (실제 test_synced_payload.json을 로드하는 것으로 대체)
if __name__ == "__main__":
    dummy_storyboard = {"schema_version": "v1.0"} # 실제 스키마 데이터 사용 예정
    
    # 🟢 시나리오 1: 성공적인 KPI 측정 (정상 케이스)
    success_stream = [
        {"timestamp": 1.0, "event_type": "VIEW", "duration": 3.5, "is_cta": False}, # View 1
        {"timestamp": 10.0, "event_type": "VIEW", "duration": 4.0, "is_cta": False},# View 2
        {"timestamp": 25.0, "event_type": "CTA_CLICK", "target": "KnowledgeGapAlert"}, # T+25s Click
        {"timestamp": 36.0, "event_type": "CTA_CLICK", "target": "FinalDiagnosisNeed"}  # T+36s Click
    ]
    print("\n--- [테스트 시나리오 A: 정상 KPI 측정 케이스 실행]")
    run_simulation(dummy_storyboard, success_stream)


    # 🔴 시나리오 2: 시스템 결함 발생 (오류 케이스)
    failure_stream = [
        {"timestamp": 1.0, "event_type": "VIEW", "duration": 3.5, "is_cta": False}, # View 1
        # T+25s와 T+36s 사이의 중요 사운드 이벤트 누락 (결함 시뮬레이션)
        {"timestamp": 37.0, "event_type": "SOUND_MISSING", "reason": "Missing High-Pass Whine"}, # 결함 발생 지점
        {"timestamp": 45.0, "event_type": "CTA_CLICK", "target": "ManualReview"}  # 그래도 CTA는 클릭됨
    ]
    print("\n--- [테스트 시나리오 B: 시스템 결함 진단 케이스 실행]")
    run_simulation(dummy_storyboard, failure_stream)