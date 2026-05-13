import subprocess
import sys
from typing import Dict, Any

def run_script_validation(script_path: str, test_case_data: Any = None) -> Dict[str, Any]:
    """
    주어진 스크립트 파일을 시스템 레벨에서 실행하고, 에러 코드와 경고를 포착하는 함수.
    실제 환경에서는 mock 객체를 사용하여 외부 API 호출을 격리해야 합니다.
    """
    print(f"--- [INFO] Running validation for: {script_path} ---")
    
    # ⚠️ 주의: 실제로는 Mocking Library (e.g., unittest.mock)를 사용하여 
    # 외부 API 호출 및 DB 접근을 가짜 데이터로 대체해야 합니다.
    try:
        # subprocess.run 대신 직접 실행하여 경고(Warning) 출력을 포착하는 것이 더 안정적입니다.
        result = subprocess.run(
            [sys.executable, script_path], 
            capture_output=True, 
            text=True, 
            check=False  # 에러가 나도 강제 종료하지 않음
        )

        validation_status = {
            "script": script_path,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "warnings_found": "DeprecationWarning 또는 기타 경고가 발견되었습니다.", 
            "passed": result.returncode == 0 and "DeprecationWarning" not in result.stderr # 임시 로직
        }

        if validation_status["returncode"] != 0:
             validation_status["error_details"] = f"Exit Code {result.returncode}: {result.stderr}"
        else:
            validation_status["error_details"] = None

    except Exception as e:
        validation_status = {"script": script_path, "passed": False, "error_details": str(e)}
    
    print(f"--- [STATUS] {script_path} Validation Complete. Passed: {validation_status['passed']} ---")
    return validation_status

def main():
    """메인 실행 함수."""
    # 테스트할 스크립트 리스트를 정의합니다.
    scripts_to_test = [
        "../src/auto_planner.py", 
        "../src/trend_sniper.py"
    ]

    all_results = []
    for script in scripts_to_test:
        result = run_script_validation(script)
        all_results.append(result)
    
    print("\n=========================================")
    print("✅ 통합 시스템 검증 테스트 보고서 완료")
    print("=========================================\n")
    for result in all_results:
        if not result['passed']:
            print(f"🚨 [FAIL] {result['script']} - 실패 원인:\n{result['error_details']}")

if __name__ == "__main__":
    # 이 모듈은 실제 실행 환경에서 테스트 스크립트의 경로를 정확히 지정해야 합니다.
    main()