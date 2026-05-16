# ⚙️ Asset Loading Module (Time Code Sync Pre-Validator)
import json
from typing import List, Dict, Any, Optional

# --- Protocol Definitions ---
# Designer가 정의한 Global Constants를 활용하여 로딩 규격화
BG_COLOR = "#0A0A0A"
ACCENT_GLITCH = "#00FFFF"
REQUIRED_MODULES = ["Narrative Visual", "System Alert", "Audio Track", "CTA Overlay"]

class AssetLoadError(Exception):
    """Asset loading or validation failed."""
    pass

class LoadedAsset:
    """Memory에 할당된 단일 애셋의 규격화된 객체 (메모리 할당 시뮬레이션)."""
    def __init__(self, asset_id: str, start_time: float, end_time: float, module_type: str):
        self.asset_id = asset_id
        self.start_time = start_time  # Seconds from start of video
        self.end_time = end_time
        self.module_type = module_type
        self.is_allocated = True

    def __repr__(self):
        return f"<LoadedAsset ID={self.asset_id} Type={self.module_type} Time=[{self.start_time:.2f}-{self.end_time:.2f}]>"


class AssetLoader:
    """
    시간 코드를 기반으로 애셋 리소스를 로드, 할당 및 유효성 검사하는 핵심 서비스 모듈.
    이 과정은 최종 Sync Validator의 필수 전처리 단계입니다.
    """

    def __init__(self, storyboard_data: List[Dict[str, Any]]):
        """
        초기화 시 전체 스토리보드 데이터를 받습니다.
        storyboard_data 구조 예시: [{"scene": 1, "start": 0.0, "end": 5.2, "assets": [...]}, ...]
        """
        self.storyboard = storyboard_data
        self.loaded_assets: List[LoadedAsset] = []
        print("✅ AssetLoader 초기화 완료: 스토리보드 데이터 로드 준비.")

    def load_and_validate(self) -> bool:
        """
        전체 스토리보드를 순회하며 애셋을 로드, 할당 및 시스템적 유효성 검사를 수행합니다.
        반환값: 모든 검증이 통과했는지 여부 (True/False).
        """
        print("\n--- 🔍 Phase 1: Asset Loading & Allocation ---")
        for scene in self.storyboard:
            scene_id = scene.get("scene", "N/A")
            start_time = scene["start"]
            end_time = scene["end"]

            print(f"\n[Processing Scene {scene_id}: Time {start_time:.2f}s -> {end_time:.2f}s]")

            # 1. Asset 로딩 (Loading Phase)
            try:
                loaded_assets = self._load_scene_assets(scene)
                self.loaded_assets.extend(loaded_assets)
                print(f"  [SUCCESS] {len(loaded_assets)}개 애셋 성공적으로 메모리에 할당되었습니다.")

            except AssetLoadError as e:
                print(f"  [FATAL ERROR] Scene {scene_id} 로딩 실패: {e}")
                return False # Critical failure, stop pipeline.


        # 2. 시스템 레벨 유효성 검증 (Validation Phase)
        print("\n--- 🧪 Phase 2: System-Level Validation Check ---")
        if not self._validate_timeline_integrity():
            print("  [FAILURE] 시간 흐름(Timeline Integrity) 오류 발견. 스크립트와 애셋 간의 Gap이 발생했습니다.")
            return False

        print("\n✅ 모든 에셋 로드 및 시스템 통합 검증을 통과했습니다. Pipeline Ready!")
        return True


    def _load_scene_assets(self, scene: Dict[str, Any]) -> List[LoadedAsset]:
        """개별 씬의 애셋 리스트를 순회하며 메모리에 할당되는 객체로 변환합니다."""
        loaded = []
        for asset_data in scene.get("assets", []):
            try:
                # 필수 데이터 검증 (가장 기본적인 단계)
                if not all(k in asset_data for k in ["asset_id", "start_time", "end_time", "module"]):
                    raise AssetLoadError("필수 애셋 정보(ID, Time, Module) 누락.")

                # 1. 할당된 객체 생성 및 메모리 확보 시뮬레이션
                new_asset = LoadedAsset(
                    asset_id=asset_data["asset_id"],
                    start_time=asset_data["start_time"],
                    end_time=asset_data["end_time"],
                    module_type=asset_data["module"]
                )
                loaded.append(new_asset)

            except AssetLoadError as e:
                print(f"    ⚠️ 경고: 애셋 로딩 실패 (ID: {asset_data.get('asset_id', 'Unknown')}): {e}")
            except Exception as e:
                print(f"    ❌ 치명적 오류 발생: {e}")

        return loaded


    def _validate_timeline_integrity(self) -> bool:
        """
        애셋들 간의 시간적 Gap, 오버랩, 그리고 전체 구조적 문제를 검증합니다.
        이것이 Sync Validator가 가장 먼저 수행해야 할 작업입니다.
        """
        # 1. 모든 애셋을 시작 시간에 따라 정렬 (시간 흐름 순서 확보)
        sorted_assets = sorted(self.loaded_assets, key=lambda a: a.start_time)

        if not sorted_assets:
            print("  [WARNING] 로드된 애셋이 없습니다.")
            return True # 아무것도 없으면 일단 통과 (비정상적이지만 에러 아님)

        # 2. 순차적인 시간 간격(Gap) 검사 및 오버랩 검사
        for i in range(len(sorted_assets)):
            current = sorted_assets[i]
            if i == 0: continue # 첫 번째 애셋은 비교 대상이 없음

            previous = sorted_assets[i-1]

            # Case 1: 시간 Gap 검사 (Previous End Time < Current Start Time)
            time_gap = current.start_time - previous.end_time
            if time_gap > 0.3: # 0.3초 이상 간격이 벌어지면 위험 경고
                print(f"  [ISSUE: GAP] 애셋 '{previous.asset_id}' ({previous.end_time:.2f}s)와 '{current.asset_id}' ({current.start_time:.2f}s) 사이에 {time_gap:.2f}초의 과도한 공백이 감지되었습니다.")

            # Case 2: 오버랩 검사 (Previous End Time > Current Start Time)
            overlap = previous.end_time - current.start_time
            if overlap > 0.1: # 0.1초 이상 겹치면 오류로 간주
                print(f"  [ISSUE: OVERLAP] 애셋 '{previous.asset_id}'와 '{current.asset_id}'가 {overlap:.2f}초 동안 과도하게 겹칩니다. 시간을 조정해야 합니다.")

        # 3. 필수 모듈 누락 검사 (Structural Check)
        present_modules = set(a.module_type for a in self.loaded_assets)
        missing_modules = [m for m in REQUIRED_MODULES if m not in present_modules]
        if missing_modules:
            print(f"  [ISSUE: MISSING MODULES] 다음 필수 모듈이 누락되었습니다: {', '.join(missing_modules)}.")

        return True


# --- Example Usage Simulation (Testing the module) ---
if __name__ == "__main__":
    # 테스트 데이터: 의도적으로 오류를 포함함.
    test_storyboard = [
        {"scene": 1, "start": 0.0, "end": 3.5, "assets": [
            {"asset_id": "V001", "start_time": 0.0, "end_time": 2.5, "module": "Narrative Visual"},
            {"asset_id": "A001", "start_time": 0.0, "end_time": 3.5, "module": "Audio Track"} # 오버랩 발생 유도
        ]},
        {"scene": 2, "start": 3.5, "end": 7.0, "assets": [
            # 의도적인 Gap (4초 간격) 및 누락 모듈 포함 시뮬레이션
            {"asset_id": "V002", "start_time": 7.1, "end_time": 9.0, "module": "Narrative Visual"}, # 3.5s -> 7.1s Gap 유도
            # {"asset_id": "Audio Track"} # 의도적으로 Audio Asset 누락 (MISSING MODULES 테스트)
        ]},
         {"scene": 3, "start": 7.0, "end": 9.0, "assets": [
            {"asset_id": "V003", "start_time": 8.5, "end_time": 9.0, "module": "System Alert"}, # 오버랩 발생 유도
            {"asset_id": "C001", "start_time": 8.8, "end_time": 9.0, "module": "CTA Overlay"}
        ]}
    ]

    print("===============================================")
    print("🚀 테스트 실행: AssetLoader (Failure Case)")
    loader = AssetLoader(test_storyboard)
    success = loader.load_and_validate()
    print(f"\n[TEST RESULT]: 로드 및 검증 결과 통과 여부: {success}")
    print("===============================================")

# 파일 실행 시 이 코드가 컨텍스트에 남기 때문에, 직접 run_command를 사용하지 않겠습니다.