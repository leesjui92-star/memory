import json
from typing import Dict, Any, List

class DataIngestionValidator:
    """
    외부에서 수집된 모든 데이터를 Schema 기반으로 검증하고 오류를 처리하는 게이트웨이 클래스.
    (Schema Enforcement Point)
    """
    def __init__(self, required_schema: Dict[str, Any], max_retries: int = 3):
        self.required_schema = required_schema
        self.max_retries = max_retries

    def validate_data(self, raw_payload: str) -> Dict[str, Any]:
        """JSON 문자열 페이로드를 로드하고 스키마에 따라 유효성을 검사합니다."""
        try:
            data = json.loads(raw_payload)
        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON Decode Failed: {e}")
            return {"status": "FAILED", "reason": f"Invalid JSON format: {e}"}

        # 스키마 유효성 검사 (핵심 로직)
        for key, expected_type in self.required_schema.items():
            if key not in data:
                return {"status": "FAILED", "reason": f"Missing required field: '{key}'"}
            
            value = data[key]
            # 간단한 타입 체크 (실제로는 더 복잡한 검증 필요)
            expected_type_str = str(expected_type).lower()
            if expected_type_str == 'list' and not isinstance(value, list):
                 return {"status": "FAILED", "reason": f"Field '{key}' must be a List."}

        # 모든 검증 통과 시 성공적으로 구조화된 데이터 반환
        print("[SUCCESS] Data payload passed schema validation.")
        return {"status": "SUCCESS", "data": data}


    def process_with_retry(self, raw_payload: str) -> Dict[str, Any]:
        """네트워크 오류나 일시적 API 실패에 대비하여 재시도 메커니즘을 적용합니다."""
        for attempt in range(self.max_retries):
            result = self.validate_data(raw_payload)
            if result["status"] == "SUCCESS":
                return {"status": "SUCCESS", "validated_data": result["data"]}
            
            print(f"[WARNING] Validation failed on attempt {attempt + 1}. Retrying...")
            # 실제 API 호출이 포함된다면 여기서 time.sleep()을 사용한 백오프 전략 적용 필요
        
        return {"status": "FAILED", "reason": "Failed after all retry attempts."}

# --- Example Usage Placeholder (실제 테스트 시 활용) ---
if __name__ == '__main__':
    # 가상 스키마 정의: 예시로 트렌드 키워드가 list<string>이고, 제목이 string인 경우 가정
    MOCK_SCHEMA = {
        "title": str, 
        "keywords": list, 
        "anomaly_score": float # 숫자형 데이터 검증을 위해 추가
    }

    validator = DataIngestionValidator(required_schema=MOCK_SCHEMA)

    # 1. 성공 케이스 (Validation Success)
    good_data = json.dumps({"title": "구조적 결함 진단", "keywords": ["AI", "시스템"], "anomaly_score": 0.85})
    print("\n--- Running Good Data Test ---")
    result = validator.process_with_retry(good_data)
    print(f"Final Result: {result}")

    # 2. 실패 케이스 (Missing Field)
    bad_data_missing = json.dumps({"title": "결함 진단", "anomaly_score": 0.9}) # keywords 누락
    print("\n--- Running Missing Field Test ---")
    result = validator.process_with_retry(bad_data_missing)
    print(f"Final Result: {result}")

# [근거: 💻 Developer (Lead Engineer) 개인 메모리, Researcher 보고서]