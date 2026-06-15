const STANDARD_PACKAGES = [
  { idSuffix: "001", cantidad: 100 }, { idSuffix: "002", cantidad: 500 }, { idSuffix: "003", cantidad: 1000 },
  { idSuffix: "004", cantidad: 2000 }, { idSuffix: "005", cantidad: 3000 }, { idSuffix: "006", cantidad: 5000 }, { idSuffix: "007", cantidad: 10000 }
];
const COMMENTS_PACKAGES = [
  { idSuffix: "001", cantidad: 1 }, { idSuffix: "002", cantidad: 3 }, { idSuffix: "003", cantidad: 5 },
  { idSuffix: "004", cantidad: 7 }, { idSuffix: "005", cantidad: 10 }, { idSuffix: "006", cantidad: 20 }, { idSuffix: "007", cantidad: 30 }
];
const USD_TO_BS = 10;
let currentPlatform = "instagram", currentService = "likes";
let currentSelectedRow = null;

const SERVICE_IDS = {
  instagram: { 
     seguidores: "IG-FOL-3411",
     likes: "IG-LIK-5350", 
     vistas: "IG-VWS-3844", 
     comentarios: "IG-CMT-5493" 
  },
  tiktok: { 
    seguidores: "TT-FOL-4793", 
    likes: "TT-LIK-1801", 
    vistas: "TT-VWS-4700", 
    comentarios: "TT-CMT-4251" 
  }
};

const PANEL_IDS = {
  instagram: { seguidores: "3411", likes: "5350", vistas: "3844", comentarios: "5493" },
  tiktok: { seguidores: "4793", likes: "1801", vistas: "4700", comentarios: "4251" }
};

const defaultCost = { 
  instagram: { seguidores: 1.074, likes: 0.418, vistas: 0.184, comentarios: 24.202 }, 
  tiktok: { seguidores: 5.786, likes: 0.653, vistas: 0.138, comentarios: 35.00 } 
};
const DEFAULT_MARGIN = 250;

const serviceConfig = {
  seguidores: { title: "Seguidores", desc: "Crecimiento de audiencia", combinedDesc: "Crecimiento de audiencia orgánica", icon: "fas fa-users", iconClass: "seguidores" },
  likes: { title: "Likes", desc: "Interacción en publicaciones", combinedDesc: "Interacción en publicaciones", icon: "fas fa-heart", iconClass: "likes" },
  vistas: { title: "Vistas", desc: "Visibilidad y alcance", combinedDesc: "Visibilidad y alcance", icon: "fas fa-eye", iconClass: "vistas" },
  comentarios: { title: "Comentarios", desc: "Engagement auténtico", combinedDesc: "Engagement auténtico", icon: "fas fa-comments", iconClass: "comentarios" }
};

function getCurrentPackages() { return currentService === "comentarios" ? COMMENTS_PACKAGES : STANDARD_PACKAGES; }
function getKey(k) { return `sb_${currentPlatform}_${currentService}_${k}`; }

function save() {
  const base = document.getElementById('baseCostPerThousand')?.value;
  const margin = document.getElementById('profitMarginPercent')?.value;
  if (base) localStorage.setItem(getKey('baseCost'), base);
  if (margin) localStorage.setItem(getKey('margin'), margin);
}

function load() {
  const baseSaved = localStorage.getItem(getKey('baseCost'));
  const marginSaved = localStorage.getItem(getKey('margin'));
  const baseInput = document.getElementById('baseCostPerThousand');
  const marginInput = document.getElementById('profitMarginPercent');
  if (baseSaved && baseInput) baseInput.value = baseSaved;
  else if (baseInput) baseInput.value = (defaultCost[currentPlatform]?.[currentService] ?? 1.07).toFixed(2);
  if (marginSaved && marginInput) marginInput.value = marginSaved;
  else if (marginInput) marginInput.value = DEFAULT_MARGIN;
}

function getServiceBaseCost(svc) {
  const key = `sb_${currentPlatform}_${svc}_baseCost`;
  const savedBase = localStorage.getItem(key);
  if (savedBase) return parseFloat(savedBase);
  return defaultCost[currentPlatform]?.[svc] ?? 1.07;
}

function getServiceMargin(svc) {
  const key = `sb_${currentPlatform}_${svc}_margin`;
  const savedMargin = localStorage.getItem(key);
  if (savedMargin) return parseFloat(savedMargin);
  return DEFAULT_MARGIN;
}

function generateServiceId() { return SERVICE_IDS[currentPlatform][currentService]; }
function updateServiceIdBadge() { document.getElementById('badgeId').innerHTML = generateServiceId(); }
function updateBadge() { document.getElementById('panelIdBadge').innerHTML = `ID #${PANEL_IDS[currentPlatform][currentService]}`; }

function getParams() {
  let base = parseFloat(document.getElementById('baseCostPerThousand')?.value);
  let margin = parseFloat(document.getElementById('profitMarginPercent')?.value);
  return { base: isNaN(base) || base < 0 ? 0 : base, margin: isNaN(margin) || margin < 0 ? 0 : margin };
}

function computeCost(b, q) { return (b / 1000) * q; }
function computeSale(c, m) { return c * (1 + m / 100); }

function genId(suffix) {
  const plat = currentPlatform === "instagram" ? "IG" : "TT";
  const svc = currentService === "seguidores" ? "FOL" : currentService === "likes" ? "LIK" : currentService === "vistas" ? "VWS" : "CMT";
  return `${plat}-${svc}-${suffix}`;
}

function renderTable() {
  const { base, margin } = getParams();
  const tbody = document.getElementById('priceTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const packages = getCurrentPackages();
  for (let p of packages) {
    const cost = computeCost(base, p.cantidad);
    const sale = computeSale(cost, margin);
    const bs = sale * USD_TO_BS;
    const row = tbody.insertRow();
    const dynamicId = genId(p.idSuffix);
    row.insertCell(0).innerHTML = `<span class="id-cell">${dynamicId}</span>`;
    row.insertCell(1).innerHTML = `${p.cantidad.toLocaleString()}`;
    row.insertCell(2).innerHTML = `$${cost.toFixed(2)}`;
    row.insertCell(3).innerHTML = `$${sale.toFixed(2)}`;
    row.insertCell(4).innerHTML = `<span class="bs-amount">Bs ${bs.toFixed(0)}</span>`;
    row.addEventListener('click', (function(clickedRow) {
      return function() {
        if (currentSelectedRow && currentSelectedRow !== clickedRow) currentSelectedRow.classList.remove('selected');
        if (clickedRow.classList.contains('selected')) { clickedRow.classList.remove('selected'); currentSelectedRow = null; }
        else { clickedRow.classList.add('selected'); currentSelectedRow = clickedRow; }
      };
    })(row));
  }
}

function updateKPI() {
  const { base, margin } = getParams();
  const cost1k = computeCost(base, 1000);
  const sale1k = computeSale(cost1k, margin);
  const profitUsd = sale1k - cost1k;
  const profitBs = profitUsd * USD_TO_BS;
  document.getElementById('kpiMainValue').innerHTML = `Bs ${profitBs.toFixed(0)}`;
  document.getElementById('kpiPercent').innerHTML = `+${margin}%`;
  document.getElementById('detailCost').innerHTML = `$${cost1k.toFixed(2)}`;
  document.getElementById('detailSale').innerHTML = `$${sale1k.toFixed(2)}`;
  document.getElementById('detailProfit').innerHTML = `$${profitUsd.toFixed(2)}`;
}

function updateBadgeContent() {
  const platformName = currentPlatform === "instagram" ? "Instagram" : "TikTok";
  const serviceName = serviceConfig[currentService].title;
  document.getElementById('badgeTitle').innerHTML = `${serviceName} • <span>${platformName}</span>`;
  document.getElementById('badgeDesc').innerHTML = serviceConfig[currentService].combinedDesc;
  const iconContainer = document.getElementById('badgeIcon');
  const config = serviceConfig[currentService];
  iconContainer.innerHTML = `<i class="${config.icon}"></i>`;
  iconContainer.className = `badge-icon ${config.iconClass}`;
}

function refresh() { renderTable(); updateKPI(); updateUI(); updateBadge(); updateBadgeContent(); updateServiceIdBadge(); save(); }

function updateUI() {
  document.querySelectorAll('.service-item').forEach(c => { if (c.dataset.service === currentService) c.classList.add('active'); else c.classList.remove('active'); });
  const tik = document.getElementById('btnTikTok'), ins = document.getElementById('btnInstagram');
  if (currentPlatform === 'tiktok') { tik.classList.add('active'); ins.classList.remove('active'); } else { ins.classList.add('active'); tik.classList.remove('active'); }
}

function switchTo(platform, service) { save(); currentPlatform = platform; currentService = service; load(); refresh(); }

function bind() {
  document.getElementById('baseCostPerThousand')?.addEventListener('input', () => refresh());
  document.getElementById('profitMarginPercent')?.addEventListener('input', () => refresh());
  document.getElementById('btnTikTok')?.addEventListener('click', () => { if (currentPlatform !== 'tiktok') switchTo('tiktok', currentService); });
  document.getElementById('btnInstagram')?.addEventListener('click', () => { if (currentPlatform !== 'instagram') switchTo('instagram', currentService); });
  document.querySelectorAll('.service-item').forEach(c => { c.addEventListener('click', () => { if (c.dataset.service !== currentService) switchTo(currentPlatform, c.dataset.service); }); });
}

function init() { load(); bind(); refresh(); updateBadgeContent(); updateServiceIdBadge(); }
init();

/* ══════════════════════════════════════════
   MODAL COMBO - LÓGICA
   ══════════════════════════════════════════ */
const SVCCLR = { seguidores: '#ff3b6e', likes: '#ff7043', vistas: '#f5a623', comentarios: '#22d48a' };
const NAMES = { seguidores: 'Seguidores', likes: 'Likes', vistas: 'Vistas', comentarios: 'Comentarios' };

let pickedSvcs = new Set();
let customQtys = { seguidores: 1000, likes: 1000, vistas: 10000, comentarios: 50 };
let selectedPresetIndex = -1;

const PRESETS = [
  { name: 'Lanzamiento', emoji: '🚀', disc: 10, svcs: ['seguidores', 'likes'], qtys: { seguidores: 500, likes: 500 } },
  { name: 'Viral', emoji: '🔥', disc: 15, svcs: ['seguidores', 'likes', 'vistas', 'comentarios'], qtys: { seguidores: 1000, likes: 1000, vistas: 10000, comentarios: 30 } },
  { name: 'Influencer', emoji: '👑', disc: 20, svcs: ['seguidores', 'likes', 'vistas', 'comentarios'], qtys: { seguidores: 5000, likes: 3000, vistas: 10000, comentarios: 30 } }
];

function getServicePriceBs(svc, qty) {
  const base = getServiceBaseCost(svc);
  const margin = getServiceMargin(svc);
  const cost = computeCost(base, qty);
  const sale = computeSale(cost, margin);
  return sale * USD_TO_BS;
}

function updateSaveButtonText() {
  const platformName = currentPlatform === "instagram" ? "INSTAGRAM" : "TIKTOK";
  const platformIcon = currentPlatform === "instagram" 
    ? '<i class="fab fa-instagram" style="margin-right:6px"></i>' 
    : '<i class="fab fa-tiktok" style="margin-right:6px"></i>';
  const btn = document.getElementById('saveBtn');
  if (btn) btn.innerHTML = `⚡ GUARDAR COMBO ${platformIcon}${platformName}`;
}

function openComboModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  pickedSvcs = new Set();
  selectedPresetIndex = -1;
  document.querySelectorAll('.spick').forEach(b => b.classList.remove('picked'));
  document.querySelectorAll('.pcard').forEach(c => c.classList.remove('sel'));
  setDiscVal(10);
  updatePresetPrices();
  updateModalUI();
  updateSaveButtonText();
}

function closeComboModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function overlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeComboModal();
}

function updatePresetPrices() {
  PRESETS.forEach((p, i) => {
    let total = 0;
    for (let svc of p.svcs) total += getServicePriceBs(svc, p.qtys[svc]);
    const discounted = total * (1 - p.disc / 100);
    const priceEl = document.getElementById(`pc${i}price`);
    const offEl = document.getElementById(`pc${i}off`);
    if (priceEl) priceEl.textContent = `Bs ${discounted.toFixed(0)}`;
    if (offEl) offEl.textContent = `${p.disc}% OFF`;
  });
}

function updateSelectedPresetCard() {
  if (selectedPresetIndex < 0) return;
  const i = selectedPresetIndex;
  const disc = getDisc();
  let total = 0;
  for (let svc of pickedSvcs) {
    const qty = customQtys[svc] || 1000;
    total += getServicePriceBs(svc, qty);
  }
  const discounted = total * (1 - disc / 100);
  const priceEl = document.getElementById(`pc${i}price`);
  if (priceEl) priceEl.textContent = `Bs ${discounted.toFixed(0)}`;
  const offEl = document.getElementById(`pc${i}off`);
  if (offEl) offEl.textContent = `${disc}% OFF`;
  const svcsEl = document.getElementById(`ps${i}svcs`);
  if (svcsEl) {
    let html = '';
    for (let svc of pickedSvcs) {
      const qty = customQtys[svc] || 1000;
      html += `<div class="pcard-svc"><div class="pcard-svc-dot" style="background:${SVCCLR[svc]}"></div>${qty.toLocaleString()} ${NAMES[svc]}</div>`;
    }
    svcsEl.innerHTML = html;
  }
  PRESETS[i].svcs = Array.from(pickedSvcs);
  PRESETS[i].qtys = {...customQtys};
  PRESETS[i].disc = disc;
}

function loadPreset(i) {
  const p = PRESETS[i];
  selectedPresetIndex = i;
  document.querySelectorAll('.pcard').forEach((c, j) => c.classList.toggle('sel', j === i));
  pickedSvcs = new Set(p.svcs);
  document.querySelectorAll('.spick').forEach(b => { b.classList.toggle('picked', pickedSvcs.has(b.dataset.svc)); });
  Object.assign(customQtys, p.qtys);
  setDiscVal(p.disc);
  const platIcon = currentPlatform === "instagram" ? "📸" : "🎵";
  const platName = currentPlatform === "instagram" ? "Instagram" : "TikTok";
  document.getElementById('spComboName').innerHTML = `${p.emoji} ${p.name} <span style="opacity:0.6;font-size:11px">• ${platIcon} ${platName}</span>`;
  updateModalUI();
}

function togglePick(s, btn) {
  if (pickedSvcs.has(s)) { pickedSvcs.delete(s); btn.classList.remove('picked'); }
  else { pickedSvcs.add(s); btn.classList.add('picked'); }
  const platIcon = currentPlatform === "instagram" ? "📸" : "🎵";
  const platName = currentPlatform === "instagram" ? "Instagram" : "TikTok";
  document.getElementById('spComboName').innerHTML = `🎯 Personaliza tu combo <span style="opacity:0.6;font-size:11px">• ${platIcon} ${platName}</span>`;
  updateModalUI();
}

function updateModalUI() {
  const n = pickedSvcs.size, ok = n >= 2;
  document.getElementById('warnStrip').classList.toggle('show', n === 1);
  document.getElementById('qtyBlock').style.display = ok ? 'block' : 'none';
  document.getElementById('discBlock').style.display = ok ? 'block' : 'none';
  document.getElementById('saveBtn').disabled = !ok;
  if (ok) { renderQtyRows(); calcSummary(); }
  else clearSummary();
}

function renderQtyRows() {
  document.getElementById('qtyRows').innerHTML = [...pickedSvcs].map(s => `
    <div class="qty-row-m">
      <span class="qty-lbl" style="color:${SVCCLR[s]}">${NAMES[s]}</span>
      <div class="qty-ctrl">
        <button class="qbtn" onclick="stepQ('${s}',-1)">−</button>
        <input class="qnum" type="number" id="qn_${s}" value="${customQtys[s] || 1000}"
          min="1" oninput="customQtys['${s}']=parseInt(this.value)||1;calcSummary();updateSelectedPresetCard()">
        <button class="qbtn" onclick="stepQ('${s}',1)">+</button>
      </div>
    </div>`).join('');
}

function stepQ(s, d) {
  const inp = document.getElementById('qn_' + s);
  if (!inp) return;
  const steps = [1, 10, 50, 100, 500, 1000, 5000, 10000];
  let v = parseInt(inp.value) || 1;
  let step = steps.find(x => x >= Math.max(1, v / 10)) || 100;
  v = Math.max(1, v + d * step);
  inp.value = v;
  customQtys[s] = v;
  calcSummary();
  updateSelectedPresetCard();
}

function setDiscVal(v) {
  document.getElementById('discRange').value = v;
  const pct = (v / 25) * 100;
  document.getElementById('sliderFill').style.width = pct + '%';
  document.getElementById('sliderThumb').style.left = pct + '%';
  document.getElementById('discDisplay').textContent = v;
  document.querySelectorAll('.dp-btn').forEach(b => b.classList.toggle('active', parseInt(b.textContent) === v));
  calcSummary();
  updateSelectedPresetCard();
}

function onSlider() { setDiscVal(parseInt(document.getElementById('discRange').value)); }
function setDisc(v) { setDiscVal(v); }
function getDisc() { return parseInt(document.getElementById('discRange').value) || 0; }

function calcSummary() {
  if (pickedSvcs.size < 2) { clearSummary(); return; }
  const disc = getDisc();
  let totOrig = 0, totDisc = 0, rows = '';
  for (let s of pickedSvcs) {
    const qty = parseInt(document.getElementById('qn_' + s)?.value) || customQtys[s] || 1000;
    const bs = getServicePriceBs(s, qty);
    const bsD = bs * (1 - disc / 100);
    totOrig += bs;
    totDisc += bsD;
    rows += `<div class="sp-row">
      <div class="sp-row-left">
        <div class="sp-row-dot" style="background:${SVCCLR[s]}"></div>
        ${NAMES[s]} (${qty.toLocaleString()})
      </div>
      <div class="sp-row-val">Bs ${bsD.toFixed(0)}</div>
    </div>`;
  }
  const saved = totOrig - totDisc;
  document.getElementById('spRows').innerHTML = rows;
  document.getElementById('spOrig').textContent = 'Bs ' + totOrig.toFixed(0);
  document.getElementById('spDiscLbl').textContent = 'Descuento (' + disc + '%)';
  document.getElementById('spDiscVal').textContent = '- Bs ' + saved.toFixed(0);
  document.getElementById('spTotal').textContent = 'Bs ' + totDisc.toFixed(0);
  const pill = document.getElementById('spSave');
  if (disc > 0) { pill.classList.add('show'); document.getElementById('spSaveTxt').textContent = 'Ahorras Bs ' + saved.toFixed(0) + ' con este combo'; }
  else pill.classList.remove('show');
}

function clearSummary() {
  document.getElementById('spRows').innerHTML = '<div class="sp-empty">Selecciona servicios para ver el resumen</div>';
  document.getElementById('spOrig').textContent = 'Bs -';
  document.getElementById('spDiscVal').textContent = '- Bs -';
  document.getElementById('spTotal').textContent = 'Bs -';
  document.getElementById('spSave').classList.remove('show');
}

/* ── helper: #rrggbb → "r,g,b" ── */
function hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

function applyCombo() {
  if (pickedSvcs.size < 2) return;
  const disc = getDisc();
  const qtys = {};
  for (let s of pickedSvcs) {
    qtys[s] = parseInt(document.getElementById('qn_' + s)?.value) || customQtys[s] || 1000;
    customQtys[s] = qtys[s];
  }
  if (selectedPresetIndex >= 0) updateSelectedPresetCard();

  let name = 'Combo personalizado', emoji = '🎯';
  if (selectedPresetIndex >= 0) { name = PRESETS[selectedPresetIndex].name; emoji = PRESETS[selectedPresetIndex].emoji; }

  const platName = currentPlatform === "instagram" ? "Instagram" : "TikTok";
  const totalText = document.getElementById('spTotal').textContent;

  /* ── Actualizar banner de último combo guardado ── */
  document.getElementById('scbIcon').textContent     = emoji;
  const nameEl = document.getElementById('scbName');
  nameEl.innerHTML = `${name} <span class="scb-plat">• ${platName}</span>`;
  document.getElementById('scbDiscount').textContent = disc > 0 ? `${disc}% OFF` : 'Sin descuento';
  document.getElementById('scbTotal').textContent    = totalText;

  let pillsHtml = '';
  for (let s of pickedSvcs) {
    const qty = qtys[s] || 1000;
    const clr = SVCCLR[s];
    const rgb = hexToRgb(clr);
    pillsHtml += `<span class="scb-svc-pill" style="background:rgba(${rgb},0.12);color:${clr};border:1px solid rgba(${rgb},0.3)">${qty.toLocaleString()} ${NAMES[s]}</span>`;
  }
  document.getElementById('scbServices').innerHTML = pillsHtml;

  const banner = document.getElementById('savedComboBanner');
  banner.classList.remove('visible');
  void banner.offsetWidth;
  banner.classList.add('visible');

  closeComboModal();
}

function removeCombo() {
  const banner = document.getElementById('savedComboBanner');
  banner.style.transition = 'opacity 0.25s, transform 0.25s';
  banner.style.opacity = '0';
  banner.style.transform = 'translateY(-6px) scale(0.98)';
  setTimeout(() => {
    banner.classList.remove('visible');
    banner.style.transition = '';
    banner.style.opacity = '';
    banner.style.transform = '';
  }, 260);
}
