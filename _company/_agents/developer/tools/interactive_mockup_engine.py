import json
from typing import List, Dict, Any

# [ASSET_ERROR_OVERLAY] 스펙을 기반으로 초기화된 상수 (Designer가 정의한 규격 사용)
GLITCH_COLOR = "neon-cyan"
ERROR_OVERLAY_DURATION_MS = 500 # 시스템 오류 경고 표시 시간(ms)

class TimeSyncMockup:
    """
    시간 코드와 스크립트 텍스트를 기반으로 인터랙티브 목업의 상태 변화를 시뮬레이션하는 엔진.
    API 호출 방식으로 동작하여, 특정 단어 등장 시 ASSET_ERROR_OVERLAY 트리거를 발생시킴.
    """

    def __init__(self, storyboard_data: Dict[str, Any]):
        # Storyboard 데이터가 핵심 입력값입니다. (Scene별 시간 코드 및 내용 포함)
        self.storyboard = storyboard_data
        print("⚙️ TimeSyncMockup Engine Initialized.")

    def process_scene(self, scene_id: str, content: Dict[str, Any]) -> List[Dict]:
        """
        특정 씬의 내용을 처리하고 발생할 모든 시각/청각 이벤트 리스트를 반환합니다.
        """
        print(f"\n--- Processing Scene {scene_id} ---")
        events = []
        start_time = content['start_time'] # 예: "00:00:15"

        # 1. 시간 코드 기반 이벤트 처리
        for segment in content.get('script_segments', []):
            text = segment['text']
            segment_duration = segment['duration_seconds']

            # 2. 트리거 단어 감지 및 오류 오버레이 발생 시뮬레이션
            triggered_words = self._find_triggers(text)
            
            scene_events = {
                "start_time": start_time,
                "script_segment_id": segment['segment_id'],
                "duration_seconds": segment_duration,
                "content": text.strip()
            }

            if triggered_words:
                # 핵심 트리거 감지 시, 오류 오버레이 발생 로직을 추가합니다.
                for word in triggered_words:
                    event = {
                        "type": "ASSET_ERROR_OVERLAY",
                        "trigger_word": word,
                        "time_code": f"{start_time} + {segment['elapsed_seconds']:.2f}", # 정확한 Time Code 출력
                        "visual_spec": f"[{GLITCH_COLOR} Flicker] ({ERROR_OVERLAY_DURATION_MS}ms)",
                        "audio_cue": "System Buzz/Alert Tone (High Pitch)"
                    }
                    scene_events["triggers"] = scene_events.get("triggers", []) + [event]
            else:
                # 일반적인 콘텐츠 흐름 이벤트 기록
                 scene_events["triggers"] = []

            events.append(scene_events)
        
        return events

    def _find_triggers(self, text: str) -> List[str]:
        """
        스크립트 텍스트 내에서 사전에 정의된 핵심 트리거 단어를 찾아 반환합니다.
        (실제 구현 시 DB/API 연동 필요)
        """
        # 예시: '취약성', '공백', '진단' 등의 키워드를 감지한다고 가정
        keywords = ["취약성", "공백", "시간적 동기화"] 
        found_triggers = []
        for word in keywords:
            if word in text:
                # 중복 방지를 위해 리스트에 추가
                if word not in found_triggers:
                    found_triggers.append(word)
        return found_triggers

    def run_simulation(self, storyboard_data: Dict[str, Any]) -> List[Dict]:
        """ 전체 스토리보드를 순차적으로 시뮬레이션합니다. """
        all_events = []
        for scene_id, scene_data in storyboard_data.items():
            events = self.process_scene(scene_id, scene_data)
            all_events.extend(events)
        return all_events

# 테스트 예시 (이 부분은 실행 시 주석 처리하거나 별도 test 파일에서 사용합니다.)
if __name__ == '__main__':
    print("--- Running Mockup Engine Test ---")
    # 가상 데이터 로드 및 테스트 진행...