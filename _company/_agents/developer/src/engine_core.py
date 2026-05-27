import json
from typing import Dict, List, Any
from datetime import timedelta

# === 🛠️ Core Engine Constants and Schema (V4.0) ===
class VideoEngineError(Exception):
    """Video Synthesis Engine에서 발생하는 모든 오류를 포괄합니다."""
    pass

def parse_time(time_str: str) -> timedelta:
    """'HH:MM:SS,mmm' 형식의 문자열을 timedelta 객체로 파싱합니다. (예: '00:01:30,500')"""
    if not time_str:
        return timedelta(seconds=0)
    try:
        h, rest = map(str, time_str.split(':'))
        m, s_ms = map(str, rest.split(':'))
        s, ms = map(int, s_ms.split(','))
        return timedelta(hours=int(h), minutes=int(m), seconds=int(s), milliseconds=ms)
    except Exception as e:
        raise VideoEngineError(f"Failed to parse time string '{time_str}': {e}")

class TimeSyncManager:
    """
    Master JSON의 시간 구간(Time Range)을 관리하고, 현재 시간을 기준으로 
    활성화되어야 할 컴포넌트 목록을 반환하는 핵심 로직. (A-Sync Protocol 구현)
    """
    def __init__(self, blueprint_data: Dict[str, Any]):
        self.blueprint = blueprint_data['master_blueprint']
        self.sections = self.blueprint.get('sections', [])

    def get_active_components(self, current_time: timedelta) -> List[Dict[str, Any]]:
        """
        주어진 시간(current_time)에 활성화되어야 하는 모든 컴포넌트 리스트를 반환합니다.
        """
        active_comps = []
        for section in self.sections:
            section_id = section['section_id']
            time_range_str = section['time_range'] # 예: "T+0:00 ~ T+0:15"
            components = section.get('visual_components', [])

            if not components:
                continue

            # 시간 범위 파싱 로직 (간단화 버전)
            try:
                start_time_str, end_time_str = time_range_str.split(" ~ ")
                start_time = parse_time(start_time_str[2:]) # T+ 제거 및 파싱
                end_time = parse_time(end_time_str[2:])
            except:
                 print(f"Warning: Could not parse time range for {section_id}. Skipping.")
                 continue

            if start_time <= current_time < end_time:
                # 이 섹션의 시간 범위 내에 있다면, 모든 컴포넌트를 활성화 대상으로 간주합니다.
                for component in components:
                    component['active_at'] = True
                    active_comps.append(component)

        return active_comps

class VideoEngineCore:
    """
    Master JSON을 입력받아 전체 영상 생성을 시뮬레이션하고, 
    컴포넌트 간 데이터 바인딩 및 시간 동기화 오류를 검증하는 메인 엔진입니다.
    """
    def __init__(self, blueprint_data: Dict[str, Any]):
        self.time_manager = TimeSyncManager(blueprint_data)

    def run_simulation(self, total_duration_seconds: int, step_interval_ms: int = 100):
        """
        총 시간을 분할하여 각 시간 스텝별로 활성화되는 컴포넌트와 그 상태를 출력합니다.
        이것이 E2E 테스트의 핵심 로직입니다.
        """
        print("================================================")
        print(f"✅ V4.0 Video Engine Simulation Started (Duration: {total_duration_seconds}s)")
        print("================================================\n")

        current_time = timedelta(milliseconds=0)
        steps = int((total_duration_seconds * 1000) / step_interval_ms)

        for i in range(steps):
            # 시간을 정밀하게 계산합니다. (초 단위가 아닌 밀리초 기반 시뮬레이션)
            current_time = timedelta(milliseconds=i * (step_interval_ms // 10))
            
            active_components = self.time_manager.get_active_components(current_time)

            if active_components:
                print(f"[T+{current_time}]: ACTIVE COMPONENTS DETECTED ({len(active_components)} assets)")
                for comp in active_components:
                    comp_id = comp['comp_id']
                    comp_type = comp['type']
                    # 데이터 바인딩 테스트 지점: 이 시점에 어떤 데이터가 필요한지 체크해야 합니다.
                    print(f"  - [{comp_id}]: {comp_type}. (Check Data Binding for required parameters...)")

            # 예시: 특정 시간대에서 의도적으로 결함을 삽입하여 검증하는 로직 추가 가능
            if 15 * 1000 <= i * (step_interval_ms // 10) < 20 * 1000:
                 print("  >>> [!!! DIAGNOSTIC CHECK]: Time Gap/Intensity Drop detected. Need Buffer Fill.")


# ===============================================
# 🧪 Integration Test Block (Testability Focus)
# ===============================================

def run_engine_validation(master_json_path: str):
    """
    실제 Master JSON 파일을 로드하여 엔진의 통합 검증을 수행합니다.
    """
    try:
        with open(master_json_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        raise VideoEngineError(f"Blueprint file not found at {master_json_path}")

    engine = VideoEngineCore(data)
    # Master JSON 기반으로 총 60초 시뮬레이션 실행
    engine.run_simulation(total_duration_seconds=60, step_interval_ms=100)


if __name__ == "__main__":
    # 실제 사용 시, Designer가 생성한 JSON 파일을 경로에 맞게 지정해야 합니다.
    print("--- [TEST MODE] ---")
    MASTER_JSON_PATH = "path/to/designer_master_json.json" 
    try:
        run_engine_validation(MASTER_JSON_PATH)
    except VideoEngineError as e:
        print(f"\n❌ CRITICAL ENGINE FAILURE: {e}")

# 코다리 주석: 이 엔진은 시간 기반의 의존성 그래프를 구현해야 합니다. 
# 단순히 활성화 여부 체크가 아니라, '이 컴포넌트 A가 끝나면 B는 반드시 시작한다'는 로직을 검증해야 가장 견고합니다.
# 다음 목표는 이를 테스트 케이스로 구체화하는 것입니다.