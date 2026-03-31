const CONFIG = {
  API_URL: 'COLE_AQUI_SEU_LINK_DO_APPS_SCRIPT'
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

function openReport(){
  if(!DATA.report.url){
    alert('Sem link configurado');
    return;
  }
  window.open(DATA.report.url);
}

function load(){
  fetch(CONFIG.API_URL)
    .then(res => res.json())
    .then(d => {
      DATA = d;

      document.getElementById('date').innerText =
        d.lastUpdate.date + ' ' + d.lastUpdate.time;

      const list = document.getElementById('products');

      d.recentProducts.forEach(p=>{
        const li = document.createElement('li');
        li.innerText = p.modelo + ' - ' + p.categoria;
        list.appendChild(li);
      });

    })
    .catch(() => {
      alert('Erro ao conectar com API');
    });
}

window.onload = load;
