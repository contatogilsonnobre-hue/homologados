let PORTAL_DATA = null;
let clickCount = 0;

const CONFIG = {
  API_URL: 'COLE_AQUI_SUA_API'
};

const ADMIN_PASSWORD = 'admin123';

function initializeLoginScreen() {
  document.body.classList.add('login-locked');
  document.getElementById('loginOverlay').style.display = 'flex';
}

function validateLogin() {
  const u = document.getElementById('loginUser').value;
  const p = document.getElementById('loginPassword').value;

  if (!PORTAL_DATA) return alert('Carregando...');

  if (u === PORTAL_DATA.loginUsername && p === PORTAL_DATA.loginPassword) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.body.classList.remove('login-locked');
    document.getElementById('appShell').classList.remove('hidden');
  } else {
    alert('Login inválido');
  }
}

function renderPortal(data) {
  PORTAL_DATA = data;

  document.getElementById('reportName').textContent = data.report.name;
  document.getElementById('updateDate').textContent = data.lastUpdate.date;
  document.getElementById('updateTime').textContent = data.lastUpdate.time;

  renderProducts(data.recentProducts);
}

function renderProducts(list) {
  const el = document.getElementById('recentProductsList');

  el.innerHTML = list.map(p => `
    <div class="product-item">
      <div>
        <strong>${p.modelo}</strong>
        <span>${p.categoria}</span>
      </div>
      <div>${p.data}</div>
    </div>
  `).join('');
}

function openReport() {
  if (!PORTAL_DATA.report.url) return alert('Sem PDF');
  window.open(PORTAL_DATA.report.url);
}

/* ================= ADMIN ================= */

function secretClick() {
  clickCount++;
  if (clickCount >= 5) {
    openAdmin();
    clickCount = 0;
  }

  setTimeout(() => clickCount = 0, 2000);
}

function openAdmin() {
  const pass = prompt('Senha admin:');
  if (pass !== ADMIN_PASSWORD) return;

  document.getElementById('adminModal').style.display = 'flex';

  document.getElementById('adminPdf').value = PORTAL_DATA.report.url;
  document.getElementById('adminDate').value = PORTAL_DATA.lastUpdate.date;
  document.getElementById('adminTime').value = PORTAL_DATA.lastUpdate.time;
}

function saveAdmin() {
  PORTAL_DATA.report.url = document.getElementById('adminPdf').value;
  PORTAL_DATA.lastUpdate.date = document.getElementById('adminDate').value;
  PORTAL_DATA.lastUpdate.time = document.getElementById('adminTime').value;

  localStorage.setItem('portalData', JSON.stringify(PORTAL_DATA));

  renderPortal(PORTAL_DATA);

  closeAdmin();
  alert('Atualizado!');
}

function closeAdmin() {
  document.getElementById('adminModal').style.display = 'none';
}

/* ================= API ================= */

function loadPortal() {
  const saved = localStorage.getItem('portalData');

  if (saved) {
    renderPortal(JSON.parse(saved));
    return;
  }

  fetch(CONFIG.API_URL)
    .then(res => res.text())
    .then(text => {
      const data = JSON.parse(text);
      renderPortal(data);
    })
    .catch(() => alert('Erro API'));
}

document.addEventListener('DOMContentLoaded', () => {
  initializeLoginScreen();
  loadPortal();

  document.getElementById('motorolaTitle')
    .addEventListener('click', secretClick);
});
