const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbyJQmzNu7OGYgXiZLVpAPi3lxoDOQvsVIoSGyfsTZalC14xR36V4p4w_eO1rLfwRTdobA/exec'
};

let DATA = null;

function login(){
  const u = document.getElementById('user').value;
  const p = document.getElementById('pass').value;

  if(u === DATA.loginUsername && p === DATA.loginPassword){
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }else{
    document.getElementById('error').innerText = 'Login inválido';
  }
}

let PORTAL_DATA = null;

const CONFIG = {
  API_URL: 'COLE_AQUI_SUA_API_DO_APPS_SCRIPT'
};

function initializeLoginScreen() {
  document.body.classList.add('login-locked');
  const overlay = document.getElementById('loginOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function validateLogin() {
  const username = (document.getElementById('loginUser')?.value || '').trim();
  const password = document.getElementById('loginPassword')?.value || '';

  if (!PORTAL_DATA) {
    alert('Dados não carregados ainda');
    return;
  }

  if (username === PORTAL_DATA.loginUsername && password === PORTAL_DATA.loginPassword) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.body.classList.remove('login-locked');
  } else {
    alert('Usuário ou senha incorretos');
  }
}

function renderPortal(data) {
  PORTAL_DATA = data;

  document.getElementById('reportName').textContent = data.report?.name || '';
  document.getElementById('updateDate').textContent = data.lastUpdate?.date || '';
  document.getElementById('updateTime').textContent = data.lastUpdate?.time || '';

  renderRecentProducts(data.recentProducts || []);
}

function renderRecentProducts(items) {
  const list = document.getElementById('recentProductsList');

  if (!items.length) {
    list.innerHTML = 'Nenhum produto';
    return;
  }

  list.innerHTML = items.map(item => `
    <div>
      ${item.modelo} • ${item.categoria} • ${item.data}
    </div>
  `).join('');
}

function openReport() {
  if (!PORTAL_DATA?.report?.url) {
    alert('Sem link configurado');
    return;
  }
  window.open(PORTAL_DATA.report.url, '_blank');
}

function loadPortal() {
  fetch(CONFIG.API_URL)
    .then(res => res.json())
    .then(data => {
      renderPortal(data);
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao conectar com API');
    });
}

document.addEventListener('DOMContentLoaded', function () {
  initializeLoginScreen();
  loadPortal();
});
