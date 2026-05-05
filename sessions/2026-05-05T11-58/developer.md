# 💻 Developer — 외부 자료 수집을 위한 'Knowledge Ingestion Gateway' API를 설계하고 구축합니다. 특히, YouTube Data API와 웹 크롤링(BeautifulSoup/Scrapy) 기술을 통합하여 구조화된 데이터 파이프라인이 작동하도록 초기 백엔드 프레임워크를 완성하십시오.

💻 Developer: 작업 시작합니다.

CEO의 지시에 따라, 외부 자료를 수집하고 구조화하는 핵심 인프라인 **'Knowledge Ingestion Gateway API'** 초기 백엔드 프레임워크를 설계했습니다. 이 게이트웨이는 YouTube Data API와 웹 크롤링 기능을 결합하여 모든 외부 데이터를 표준화된 데이터 파이프라인으로 통합하는 역할을 수행합니다.

실행을 위해 다음의 구조로 파일을 구성하고, 환경 변수 설정과 함께 사용법을 안내합니다.

### 🛠️ 프로젝트 파일 구조 및 준비물

```
knowledge_gateway/
├── .env                  # API Key 저장을 위한 환경변수 파일
├── main.py               # Knowledge Ingestion Gateway 실행 파일 (API 엔드포인트 시뮬레이션)
└── services/
    ├── youtube_api.py    # YouTube Data API 클라이언트 모듈
    └── web_scraper.py    # 웹 크롤링(BeautifulSoup) 모듈
```

### 🚀 구현 코드

#### 1. `.env` 파일 (환경 변수 설정)

⚠️ **주의:** 실제 API 키로 대체해야 합니다.

```dotenv
YOUTUBE_API_KEY="YOUR_GOOGLE_API_KEY"
# 스크래핑 대상 사이트의 User-Agent를 여기에 정의할 수 있습니다.
DEFAULT_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/Chrome"
```

#### 2. `services/youtube_api.py` (YouTube API 통합 모듈)

이 모듈은 특정 검색어에 대해 구조화된 비디오 메타데이터를 가져옵니다.

```python
import os
from googleapiclient.discovery import build

class YouTubeAPIClient:
    """
    YouTube Data API v3 클라이언트를 초기화하고 핵심 기능을 제공합니다.
    """
    def __init__(self):
        api_key = os.environ.get("YOUTUBE_API_KEY")
        if not api_key:
            raise ValueError("FATAL: YOUTUBE_API_KEY가 .env 파일에 설정되지 않았습니다.")
        
        # YouTube API 서비스 객체 생성
        self.youtube = build('youtube', 'v3', developerKey=api_key)

    def search_videos(self, query: str, max_results: int = 5) -> list[dict]:
        """
        주어진 검색어에 대한 비디오 메타데이터 리스트를 가져옵니다.
        :param query: 검색할 키워드 (예: 'AI 자동화')
        :param max_results: 반환할 최대 결과 수
        :return: 구조화된 딕셔너리 목록
        """
        print(f"[API Call] Searching YouTube for '{query}'...")
        try:
            search_response = self.youtube.search().list(
                q=query,
                part='snippet',
                type='video', # 비디오만 필터링
                maxResults=max_results
            ).execute()

            videos_data = []
            for item in search_response.get('items', []):
                snippet = item['snippet']
                videos_data.append({
                    "source": "YouTube",
                    "title": snippet['title'],
                    "description_preview": snippet['description'][:100] + "...", # 설명 미리보기 (길이 제한)
                    "video_id": item['id']['videoId'],
                    "published_at": snippet['publishedAt']
                })
            return videos_data

        except Exception as e:
            print(f"!!! YouTube API 호출 중 오류 발생: {e}")
            return []
```

#### 3. `services/web_scraper.py` (웹 크롤링 모듈)

BeautifulSoup를 사용하여 주어진 URL의 핵심 텍스트 콘텐츠를 추출합니다.

```python
import requests
from bs4 import BeautifulSoup
import os

class WebScraper:
    """
    주어진 URL에서 구조화된 웹 콘텐츠(본문 텍스트)를 크롤링하여 반환합니다.
    """
    def __init__(self):
        # User-Agent 설정은 기본적인 방어 장치입니다.
        self.headers = {
            "User-Agent": os.environ.get("DEFAULT_USER_AGENT", "Custom/KnowledgeGatewayBot")
        }

    def scrape_article(self, url: str) -> dict:
        """
        URL에 접속하여 주요 기사 본문 텍스트를 추출합니다.
        :param url: 크롤링할 웹페이지 URL
        :return: 구조화된 데이터 (성공/실패 여부와 함께)
        """
        print(f"[Scrape Call] Scraping content from {url}...")
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status() # HTTP 에러 발생 시 예외 처리

            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 핵심 콘텐츠 영역을 추정하여 텍스트를 추출하는 로직 (사이트마다 수정 필요)
            article_body = soup.find('article') or soup.find('main') # 가장 일반적인 기사 컨테이너 선택자 사용 시도
            
            if article_body:
                text = article_body.get_text(separator='\n', strip=True)
                return {
                    "source": "WebScrape",
                    "url": url,
                    "extracted_content": text[:2000] + "...", # 길이 제한 및 미리보기
                    "status": "SUCCESS"
                }
            else:
                # 특정 구조를 찾지 못했을 경우 전체 본문 텍스트를 시도 (차선책)
                text = soup.get_text(separator='\n', strip=True)[:2000] + "..."
                return {
                    "source": "WebScrape",
                    "url": url,
                    "extracted_content": text,
                    "status": "PARTIAL_SUCCESS_FALLBACK"
                }

        except requests.exceptions.RequestException as e:
            return {"source": "WebScrape", "url": url, "status": f"ERROR: {e}", "extracted_content": ""}
```

#### 4. `main.py` (Knowledge Ingestion Gateway 통합 로직)

이 파일은 두 서비스를 호출하고 결과를 표준 JSON 형식으로 반환하는 게이트웨이 역할을 합니다.

```python
from services.youtube_api import YouTubeAPIClient
from services.web_scraper import WebScraper
import json

class KnowledgeIngestionGateway:
    """
    YouTube API와 웹 스크래핑 기능을 통합하여 구조화된 지식 데이터 파이프라인을 구축합니다.
    """
    def __init__(self):
        print("--- 💡 KNOWLEDGE INGESTION GATEWAY 초기화 완료 ---")
        try:
            self.youtube_client = YouTubeAPIClient()
            self.scraper = WebScraper()
        except ValueError as e:
            print(f"!!! 게이트웨이 초기화 실패: {e}")
            exit(1)

    def ingest_knowledge(self, query: str, youtube_url: str = None, web_url: str = None) -> list[dict]:
        """
        단일 호출로 여러 소스의 지식을 수집하고 통합합니다.
        :param query: (필수) YouTube 검색어 또는 주제 키워드
        :param youtube_url: (선택) 특정 웹페이지 URL을 크롤링할 때 사용
        :param web_url: (선택) 실제 스크랩 할 URL
        :return: 통합된 지식 데이터 리스트
        """
        ingested_data = []

        # 1. YouTube Data API 호출 및 구조화
        youtube_results = self.youtube_client.search_videos(query=query, max_results=3)
        if youtube_results:
            ingested_data.append({"type": "YouTube", "data": youtube_results})

        # 2. 웹 크롤링 호출 및 구조화 (web_url이 제공된 경우만 실행)
        if web_url:
            scraped_result = self.scraper.scrape_article(web_url)
            ingested_data.append({"type": "Web", "data": scraped_result})

        return ingested_data

# --- 사용 예시 (API 테스트 시뮬레이션) ---
if __name__ == "__main__":
    gateway = KnowledgeIngestionGateway()
    
    # [테스트 케이스] 'Anti-Establishment Finance' 주제로 유튜브 검색 및 특정 웹사이트 크롤링을 동시에 수행
    print("\n================================================================")
    print("🚀 테스트 실행: YouTube + Web Scraping 동시 호출")
    print("================================================================\n")

    test_data = gateway.ingest_knowledge(
        query="Anti-Establishment Finance", 
        web_url="https://www.example.com/article" # 실제 테스트 URL로 변경하세요
    )

    # 최종 결과 출력 (파이프라인에 저장할 구조화된 데이터)
    print("\n==================== [최종 통합 지식 아카이브] ====================")
    final_output = {
        "timestamp": "2026-05-XX",
        "query": "Anti-Establishment Finance",
        "ingested_sources": test_data
    }
    print(json.dumps(final_output, indent=4, ensure_ascii=False))

```

### 🚀 사용 방법 (1줄 요약)

`pip install google-api-python-client beautifulsoup4 requests` 명령어로 라이브러리를 설치한 후, `main.py` 파일을 실행하여 지식 게이트웨이를 테스트하십시오.

---
📊 평가: 완료 — 요청된 YouTube Data API와 웹 크롤링을 통합하는 초기 백엔드 프레임워크를 모듈별로 분리하여 완성했기 때문에 목표가 달성되었습니다.
📝 다음 단계: [Dev] 이 아키텍처의 성능 최적화 및 안정화를 위해, 스크래핑 대상 사이트 목록(Whitelist)을 관리하고 API 호출 제한(Rate Limiting) 로직을 추가하십시오.
