import './style.css';

// ===== 네비게이션 =====
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const page = document.getElementById(`page-${item.dataset.page}`);
    if (page) page.classList.add('active');
  });
});

// ===== 인사말 시간 기반 =====
function setGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById('greeting-text');
  if (!el) return;
  const g = h < 6 ? '새벽이에요' : h < 12 ? '좋은 아침이에요' : h < 18 ? '좋은 오후에요' : '좋은 저녁이에요';
  el.textContent = `${g}, 지현님 👋`;
}
setGreeting();

// ===== 숫자 카운트 애니메이션 =====
function animateCounters() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = current;
    }, 30);
  });
}
setTimeout(animateCounters, 300);

// ===== 추천 카드 데이터 =====
const recommendations = [
  { id: 1, category: 'food', badge: '🍽️ 점심 추천', title: '을지로 수제버거 "버거보이"', desc: '지현님이 선호하는 수제버거 + 조용한 분위기. 도보 8분 거리.', price: '₩14,500', rating: '★★★★★ 4.8', score: 97, color: '#fb923c',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
  { id: 2, category: 'food', badge: '🍽️ 점심 추천', title: '성수동 파스타 "라쿠치나"', desc: '크림파스타 전문. 런치 세트 할인 중. 예약 가능.', price: '₩16,000', rating: '★★★★☆ 4.5', score: 91, color: '#f87171',
    img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop' },
  { id: 3, category: 'food', badge: '🍽️ 점심 추천', title: '한남동 한식 "소반"', desc: '건강식 위주. 오늘 수면 부족 고려 시 비타민 메뉴 추천.', price: '₩12,000', rating: '★★★★★ 4.9', score: 94, color: '#34d399',
    img: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop' },
  { id: 4, category: 'travel', badge: '✈️ 주말 여행', title: '제주 감성 숙소 "오름스테이"', desc: '6월 주말 빈 일정 감지. 선호 스타일 기반 숙소 추천.', price: '₩89,000/박', rating: '★★★★★ 4.9', score: 95, color: '#60a5fa',
    img: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=400&h=300&fit=crop' },
  { id: 5, category: 'shopping', badge: '🛍️ 생일 선물', title: '조말론 향수 세트', desc: '어머니 선호 브랜드. 생신 선물 적합. 당일 배송 가능.', price: '₩48,000', rating: '★★★★★ 4.7', score: 92, color: '#a78bfa',
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop' },
  { id: 6, category: 'schedule', badge: '📅 일정 최적화', title: '오후 미팅 리마인더', desc: '14:00 팀 미팅 전 자료 정리 완료. 회의실 B 자동 예약됨.', price: '자동 완료', rating: '✓ 검증됨', score: 100, color: '#34d399',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop' },
];

function renderRecommendations(filter = 'all') {
  const grid = document.getElementById('recommendation-grid');
  if (!grid) return;
  const filtered = filter === 'all' ? recommendations : recommendations.filter(r => r.category === filter);
  grid.innerHTML = filtered.map(r => `
    <div class="rec-card" data-id="${r.id}">
      <div class="rec-card-image" style="background-image:url('${r.img}')">
        <span class="rec-card-badge">${r.badge}</span>
        <span class="rec-card-score">매칭 ${r.score}%</span>
      </div>
      <div class="rec-card-body">
        <h4 class="rec-card-title">${r.title}</h4>
        <p class="rec-card-desc">${r.desc}</p>
        <div class="rec-card-meta">
          <span class="rec-card-price">${r.price}</span>
          <span class="rec-card-rating">${r.rating}</span>
        </div>
        <div class="rec-card-actions">
          <button class="btn btn-primary btn-sm" onclick="handleAction('${r.title}', '예약')">예약하기</button>
          <button class="btn btn-ghost btn-sm" onclick="handleAction('${r.title}', '상세')">상세보기</button>
        </div>
      </div>
    </div>
  `).join('');
}
renderRecommendations();

// 필터 탭
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderRecommendations(tab.dataset.filter);
  });
});

// ===== 에이전트 상세 =====
function renderAgents() {
  const grid = document.getElementById('agents-detail-grid');
  if (!grid) return;
  const agents = [
    { icon: '🧠', name: '컨텍스트 엔진', role: '사용자의 캘린더, 이메일, 건강 데이터를 분석하여 현재 상황을 정의합니다. RAG 기반 장기 기억 관리.',
      metrics: [
        { label: '분석된 데이터 포인트', value: '2,847건', pct: 85, color: 'var(--accent)' },
        { label: '장기 기억 정확도', value: '94.2%', pct: 94, color: 'var(--green)' },
        { label: '응답 지연시간', value: '120ms', pct: 30, color: 'var(--blue)' },
      ]},
    { icon: '🤖', name: '액션 엔진 (LAM)', role: '웹사이트 및 앱 UI를 직접 탐색하여 예약, 구매, 비교를 자동 수행합니다.',
      metrics: [
        { label: '오늘 실행 작업', value: '12건', pct: 60, color: 'var(--orange)' },
        { label: '실행 성공률', value: '98.7%', pct: 98, color: 'var(--green)' },
        { label: '평균 실행 시간', value: '3.2초', pct: 40, color: 'var(--accent)' },
      ]},
    { icon: '🛡️', name: '검증 에이전트', role: '광고성 정보, 가짜 리뷰, 과다 청구 여부를 실시간으로 검증합니다.',
      metrics: [
        { label: '차단된 위협', value: '23건', pct: 70, color: 'var(--red)' },
        { label: '가짜 리뷰 탐지율', value: '96.1%', pct: 96, color: 'var(--green)' },
        { label: '검증 정확도', value: '99.3%', pct: 99, color: 'var(--green)' },
      ]},
  ];
  grid.innerHTML = agents.map(a => `
    <div class="agent-detail-card">
      <div class="agent-detail-icon">${a.icon}</div>
      <h3 class="agent-detail-name">${a.name}</h3>
      <p class="agent-detail-role">${a.role}</p>
      <div class="agent-metrics">
        ${a.metrics.map(m => `
          <div>
            <div class="metric-row">
              <span class="metric-label">${m.label}</span>
              <span class="metric-value">${m.value}</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill" style="width:${m.pct}%;background:${m.color}"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}
renderAgents();

// ===== 라이프 로그 =====
function renderLifelog() {
  const container = document.getElementById('lifelog-container');
  if (!container) return;
  const days = ['월','화','수','목','금','토','일'];
  const sleepData = [7.2,6.8,5.5,4.5,0,0,0];
  const stepData = [8200,9100,6500,3200,0,0,0];
  container.innerHTML = `
    <div class="lifelog-card">
      <h3>💤 수면 패턴</h3>
      <div class="health-chart">
        ${sleepData.map((v, i) => `<div class="chart-bar" data-label="${days[i]}" style="height:${v ? (v / 8) * 100 : 5}%;background:${v < 5 ? 'var(--red)' : v < 6.5 ? 'var(--orange)' : 'var(--accent)'}"></div>`).join('')}
      </div>
      <div class="chart-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--accent)"></div>충분</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--orange)"></div>부족</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--red)"></div>위험</div>
      </div>
    </div>
    <div class="lifelog-card">
      <h3>🚶 활동량</h3>
      <div class="health-chart">
        ${stepData.map((v, i) => `<div class="chart-bar" data-label="${days[i]}" style="height:${v ? (v / 10000) * 100 : 5}%;background:${v > 8000 ? 'var(--green)' : v > 5000 ? 'var(--blue)' : 'var(--orange)'}"></div>`).join('')}
      </div>
      <div class="chart-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--green)"></div>목표 달성</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--blue)"></div>보통</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--orange)"></div>부족</div>
      </div>
    </div>
    <div class="lifelog-card">
      <h3>📅 오늘의 일정</h3>
      <div class="lifelog-timeline">
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--green)"></div>
          <div class="timeline-content"><div class="timeline-title">아침 루틴 완료</div><div class="timeline-desc">명상 10분 + 스트레칭</div></div>
          <span class="timeline-time">07:30</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--accent)"></div>
          <div class="timeline-content"><div class="timeline-title">점심 예약</div><div class="timeline-desc">Aura가 자동 예약 - 버거보이 12:30</div></div>
          <span class="timeline-time">11:45</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--orange)"></div>
          <div class="timeline-content"><div class="timeline-title">팀 미팅</div><div class="timeline-desc">회의실 B - 프로젝트 진행 리뷰</div></div>
          <span class="timeline-time">14:00</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--blue)"></div>
          <div class="timeline-content"><div class="timeline-title">휴식 알림</div><div class="timeline-desc">수면 부족 감지 → 카페 휴식 제안</div></div>
          <span class="timeline-time">13:30</span>
        </div>
      </div>
    </div>
    <div class="lifelog-card">
      <h3>💳 소비 분석</h3>
      <div class="lifelog-timeline">
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--green)"></div>
          <div class="timeline-content"><div class="timeline-title">이번 주 지출</div><div class="timeline-desc">₩142,500 / 예산 ₩200,000</div></div>
          <span class="timeline-time">71%</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--accent)"></div>
          <div class="timeline-content"><div class="timeline-title">절약 금액</div><div class="timeline-desc">Aura가 찾은 최저가로 ₩12,300 절약</div></div>
          <span class="timeline-time">이번 달</span>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--red)"></div>
          <div class="timeline-content"><div class="timeline-title">구독 경고</div><div class="timeline-desc">넷플릭스 프리미엄 다음 달 인상 예정</div></div>
          <span class="timeline-time">알림</span>
        </div>
      </div>
    </div>
  `;
}
renderLifelog();

// ===== 프라이버시 금고 =====
function renderPrivacy() {
  const container = document.getElementById('privacy-container');
  if (!container) return;
  const items = [
    { icon: '🔐', title: '로컬 데이터 처리', desc: '민감한 개인 정보는 클라우드에 전송하지 않고 기기 내에서 직접 처리합니다.', toggle: true, active: true, encryption: 100 },
    { icon: '🛡️', title: 'TEE 암호화', desc: 'Trusted Execution Environment 내에서 데이터를 암호화하여 처리합니다.', toggle: true, active: true, encryption: 98 },
    { icon: '👁️', title: '데이터 접근 로그', desc: '어떤 에이전트가 어떤 데이터에 접근했는지 실시간으로 기록합니다.', toggle: false, encryption: 0 },
    { icon: '🗑️', title: '자동 삭제 정책', desc: '30일 이상 된 행동 로그는 자동으로 암호화 삭제됩니다.', toggle: true, active: true, encryption: 85 },
  ];
  container.innerHTML = items.map(item => `
    <div class="privacy-card">
      <div class="privacy-icon">${item.icon}</div>
      <h3 class="privacy-title">${item.title}</h3>
      <p class="privacy-desc">${item.desc}</p>
      ${item.toggle ? `
        <div class="privacy-toggle">
          <span class="toggle-label">${item.active ? '활성화됨' : '비활성화됨'}</span>
          <div class="toggle-switch ${item.active ? 'active' : ''}" onclick="this.classList.toggle('active');this.previousElementSibling.textContent=this.classList.contains('active')?'활성화됨':'비활성화됨'"></div>
        </div>
        ${item.encryption ? `
        <div class="encryption-meter">
          <div class="encryption-label"><span>암호화 수준</span><span>${item.encryption}%</span></div>
          <div class="encryption-bar"><div class="encryption-fill" style="width:${item.encryption}%"></div></div>
        </div>` : ''}
      ` : `
        <div style="padding:12px 16px;background:var(--glass);border-radius:var(--radius-sm)">
          <div style="font-size:13px;font-weight:500;margin-bottom:8px">최근 접근 기록</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.8">
            • 컨텍스트 엔진 → 캘린더 (2분 전)<br>
            • 액션 엔진 → 결제정보 (15분 전)<br>
            • 검증 에이전트 → 리뷰 데이터 (23분 전)
          </div>
        </div>
      `}
    </div>
  `).join('');
}
renderPrivacy();

// ===== 모달 & 토스트 =====
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalLoader = document.getElementById('modal-loader');
const modalConfirmText = document.getElementById('modal-confirm-text');

window.handleAction = function(name, type) {
  modalTitle.textContent = type === '예약' ? '예약 확인' : '상세 정보';
  modalBody.innerHTML = type === '예약'
    ? `<p><strong>${name}</strong>을(를) 예약하시겠습니까?</p><p style="margin-top:8px;font-size:13px">Aura가 자동으로 이름, 연락처, 인원수를 입력합니다.</p>`
    : `<p><strong>${name}</strong>의 상세 정보를 불러오고 있습니다...</p>`;
  modalConfirmText.textContent = type === '예약' ? '예약 실행' : '확인';
  modalOverlay.classList.add('active');
};

document.getElementById('modal-close')?.addEventListener('click', () => modalOverlay.classList.remove('active'));
document.getElementById('modal-cancel')?.addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay?.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

document.getElementById('modal-confirm')?.addEventListener('click', () => {
  modalLoader.classList.add('show');
  modalConfirmText.textContent = '실행 중...';
  setTimeout(() => {
    modalLoader.classList.remove('show');
    modalOverlay.classList.remove('active');
    showToast('success', '✅ 작업이 성공적으로 완료되었습니다!');
  }, 1500);
});

function showToast(type, message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== 제안 카드 버튼 이벤트 =====
document.getElementById('btn-book-cafe')?.addEventListener('click', () => {
  window.handleAction('성수동 조용한 카페', '예약');
});
document.getElementById('btn-view-gifts')?.addEventListener('click', () => {
  window.handleAction('어머니 생신 선물', '상세');
});
document.getElementById('btn-compare-sub')?.addEventListener('click', () => {
  window.handleAction('구독 서비스 비교', '상세');
});

// ===== 활동 바 애니메이션 =====
setTimeout(() => {
  document.querySelectorAll('.metric-bar-fill').forEach(el => {
    el.style.width = el.style.width;
  });
}, 500);
