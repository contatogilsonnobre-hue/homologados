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

function openReport(){
  if(!DATA.report.url){
    alert('Sem link configurado');
    return;
  }
  window.open(DATA.report.url);
}

function load(){
  fetch(CONFIG.API_URL)
    .then(res => {
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      return res.text();
    })
    .then(text => {
      try {
        const d = JSON.parse(text);
        DATA = d;

        document.getElementById('date').innerText =
          d.lastUpdate.date + ' ' + d.lastUpdate.time;

        const list = document.getElementById('products');
        list.innerHTML = '';

        d.recentProducts.forEach(p => {
          const li = document.createElement('li');
          li.innerText = p.modelo + ' - ' + p.categoria;
          list.appendChild(li);
        });
      } catch (e) {
        console.error('Resposta recebida:', text);
        alert('A API não retornou JSON válido.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao conectar com API');
    });
}

    })
    .catch(() => {
      alert('Erro ao conectar com API');
    });
}

window.onload = load;
