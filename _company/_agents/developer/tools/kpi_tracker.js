// kpi_tracker.js: 모든 KPI 측정 로직을 중앙 집중화하는 모듈 (Event Emitter 역할)

/**
 * @typedef {object} TrackingData
 * @property {string} eventName - 발생한 이벤트의 표준명 (예: 'T25s_KnowledgeGap', 'T36s_CTA_View')
 * @property {string} kpiTarget - 측정하고자 하는 핵심 KPI 이름 (예: 'AWD_Rate', 'Conversion_Intent')
 * @property {object} data - 해당 이벤트에 필요한 추가 데이터 (사용자 정보, 세션 정보 등)
 */

/**
 * 표준화된 트래킹 이벤트를 발송하는 함수. 실제 배포 시 Google Analytics 또는 자체 백엔드 API를 호출한다고 가정합니다.
 * @param {string} eventName 
 * @param {object} data 
 */
const trackEvent = (eventName, data) => {
    console.log("=======================================");
    console.warn(`[🔥 KPI TRACKER] 이벤트 감지 및 발송 시도: ${eventName}`);
    console.log(`[🎯 Target KPI]: ${data.kpiTarget || 'N/A'}`);
    console.log("[📦 Payload Data]");
    console.dir(data);
    console.log("=======================================");

    // TODO: 실제 환경에서는 fetch()를 사용하여 백엔드 추적 API 엔드포인트로 POST 요청을 보냅니다.
    // 예시: fetch('/api/track', { method: 'POST', body: JSON.stringify({ event: eventName, ...data }) });
};

/**
 * T+25초 지점의 KPI 측정을 시뮬레이션합니다. (지식 공백 구간)
 * @param {object} sessionData - 현재 세션 정보 
 */
const trackT25sGap = (sessionData) => {
    trackEvent(
        'Knowledge_Gap_Signal',
        {
            kpiTarget: 'AverageViewDuration_AnomalyDetection', // T+25s 지점의 평균 시청 지속 시간 측정
            userSessionId: sessionData.userId,
            timestamp: new Date().toISOString(),
            context: "T+25초 정보 공백 구간 진입",
        }
    );
};

/**
 * T+36초 지점의 KPI 측정을 시뮬레이션합니다. (CTA 경고 에셋 노출)
 * @param {object} sessionData - 현재 세션 정보 
 */
const trackT36sCTA = (sessionData) => {
    trackEvent(
        'High_Urgency_CallToAction',
        {
            kpiTarget: 'ConversionRate_DiagnosticNecessity', // 전문 진단 필요성 유발로 인한 전환율 측정
            userSessionId: sessionData.userId,
            timestamp: new Date().toISOString(),
            context: "T+36초 경고 에셋 노출 및 CTA 발생",
        }
    );
};

// 외부에서 사용할 수 있도록 객체로 내보냅니다.
export { trackEvent, trackT25sGap, trackT36sCTA };