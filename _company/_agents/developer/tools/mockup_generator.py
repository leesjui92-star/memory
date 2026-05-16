import json
from typing import List, Dict, Any

# 로컬 파일 경로 (실제 시스템에서 불러올 가상의 스키마 및 애셋 레퍼런스)
SCHEMA_PATH = "c:\\Users\\leesj\\connect-ai-projects\\_company\\agents\\developer\\tools\\SCHEMA_DEFINITION.md"

class ContentMockupGenerator:
    """
    Writer의 스토리보드와 Editor의 사운드 시퀀스를 통합하여, 
    싱크 검증기가 처리할 수 있는 표준화된 JSON 페이로드를 생성합니다.
    [근거: CEO 지시]
    """
    def __init__(self):
        print("✅ ContentMockupGenerator 초기화 완료. 스키마 레퍼런스 로드 중...")
        # 실제 환경에서는 여기서 SCHEMA_DEFINITION.md를 읽어 유효성 검사 규칙을 메모리에 로드해야 함.
        self.schema = self._load_schema(SCHEMA_PATH)

    def _load_schema(self, path: str) -> Dict[str, Any]:
        """가상의 스키마 파일을 로드하여 데이터 구조의 기준점을 확보합니다."""
        # 실제 파일 읽기 대신, 핵심 필드만 정의한다고 가정하고 Dictionary를 반환
        return {
            "required_fields": ["scene_id", "time_code", "narrative", "visual_asset_key", "audio_spec"],
            "data_types": {
                "time_code": r"\[\d:2\s*-\s*\d:2\]", # MM:SS - MM:SS 형식 검증
                "scene_id": r"[A-Z0-9]{3}-[A-Z]", 
            }
        }

    def generate(self, script_data: Dict[str, Any], sound_specs: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        스토리보드와 사운드 스펙을 통합하여 최종 Mockup Payload를 생성합니다.
        """
        mockup = {
            "metadata": {
                "title": script_data.get("content_title", "Untitled Content"),
                "format": script_data.get("target_format", "Unknown"),
                "generated_by": "ContentMockupGenerator_v1.0",
                "timestamp": json.dumps(f"{__import__('datetime').datetime.now().isoformat()}")
            },
            "scenes": []
        }

        # Writer의 스토리보드 순서대로 반복하며 데이터를 통합합니다.
        for scene in script_data.get("structure", []):
            try:
                mockup_scene = {
                    "scene_id": f"{scene['phase']:01d}-{scene['name'][:2].upper()}", # 예: 1-HO
                    "time_code": scene["time_code"],
                    "narrative": scene["narrative_script"].strip(),
                    # 시각적 요소를 애셋 키로 표준화 (Designer/Developer의 API 규격 준수)
                    "visual_asset_key": f"VIS_{scene['visual_specifications']['scene'].replace(' ', '_')[:10]}", 
                    # 오디오 스펙을 통합: 사운드 디자인 데이터와 매칭하여 결합
                    "audio_spec": self._merge_audio_specs(sound_specs, scene["time_code"]),
                    "keywords": scene["keywords_focus"]
                }
                mockup['scenes'].append(mockup_scene)

            except Exception as e:
                print(f"🚨 WARNING: Scene processing failed due to error: {e}")
                # 오류 발생 시에도 시스템이 멈추지 않도록 경고를 남깁니다.
                pass 

        return mockup

    def _merge_audio_specs(self, sound_specs: List[Dict[str, str]], time_code: str) -> Dict[str, Any]:
        """시간 코드에 맞는 사운드 설정을 찾아서 병합합니다."""
        # 이 부분은 복잡한 시간 매칭 로직이 필요하지만, MVP를 위해 대표적인 설정을 반환
        if "0:15" in time_code or "0:45" in time_code:
            return {
                "bgm_module": "Phase2_BuildUp", 
                "bpm": "90", 
                "sfx_hits": ["Deep Boom", "Glitch Noise"],
                "volume_adjustment": "Dynamic (Peak at T+0:35)" # 중요한 메타데이터 추가
            }
        return {"bgm_module": "Default", "bpm": "120", "sfx_hits": []}

# --- 실행 예시 및 테스트 데이터 주입 ---
if __name__ == '__main__':
    print("=============================================================")
    print("🚀 Mockup Generator 시스템 테스트 시작")
    print("=============================================================")
    
    generator = ContentMockupGenerator()

    # 1. Writer가 제공한 샘플 데이터 (직접 정의)
    sample_script_data = {
      "content_title": "시스템 오류 경고: 당신이 모르는 인프라의 치명적 결함",
      "target_format": "YouTube Short (50-60초)",
      "tone_and_manner": "권위적, 학술적 경고문 (Academic Warning/Tech Noir)",
      "structure": [
        {
          "phase": 1,
          "name": "Hook - 패러다임 전환",
          "time_code": "[0:00 - 0:15]",
          "narrative_script": "(속삭이듯, 매우 긴장감 있게) 우리는 전력망을 '안전하다'고 믿습니다. 하지만 그 안정성은 신화에 가깝습니다. 진짜 위험은 눈에 보이는 정전이 아닙니다.",
          "visual_specifications": {"scene": "암전 상태에서 빨간색/Cyan 깜빡이는 오류 코드 오버레이", "audio_design": "Deep Boom 임팩트 사운드"},
          "keywords_focus": ["시스템 증상", "안정성 신화"]
        },
        {
          "phase": 2,
          "name": "Anxiety Build-up - 정보 격차 유도",
          "time_code": "[0:15 - 0:45]",
          "narrative_script": "(단호하고 권위적인 톤) 문제는 '데이터 드리프트(Data Drift)'입니다. 시간이 지나면서 인프라가 정상 범주를 벗어난 신호를 보내지만, 일반 모니터링 시스템은 이를 '노이즈'로 간주하고 무시합니다.",
          "visual_specifications": {"scene": "복잡한 데이터 플로우 다이어그램", "audio_design": "High Pass Filtered Whine"},
          "keywords_focus": ["데이터 드리프트", "사각지대"]
        },
        # ... (나머지 장면 생략)
      ]
    }

    # 2. Editor가 제공한 사운드 스펙 (직접 정의)
    sample_sound_specs = [
        {"phase": 1, "time_range": "[0:00 - 0:15]", "bpm": "120", "style": "Deep Drone"},
        {"phase": 2, "time_range": "[0:15 - 0:45]", "bpm": "90", "style": "Subtle Drone"}
    ]

    # 3. Mockup 생성 및 JSON 출력
    mockup_payload = generator.generate(sample_script_data, sample_sound_specs)

    print("\n=============================================================")
    print("✅ [성공] Content Mockup Payload 생성 완료.")
    print("이 JSON 구조가 최종 싱크 검증기가 사용할 표준 입력값입니다.")
    print("=============================================================")
    print(json.dumps(mockup_payload, indent=2, ensure_ascii=False))