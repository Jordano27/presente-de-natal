// Dados de exemplo para a retrospectiva
const retrospect = {
  year: new Date().getFullYear(),
  stats: [
    { id: 'dias', label: 'Dias juntos', value: 214 },
    { id: 'mensagens', label: 'Mensagens trocadas', value: 13245 },
    { id: 'viagens', label: 'Viagens', value: 6 },
    { id: 'beijos', label: 'Beijos', value: 834 }
  ],
  memories: [
    { title: 'Praia em Julho', emoji: '🏖️', desc: 'Sol, mar e risadas até o pôr do sol.' },
    { title: 'Série maratona', emoji: '🍿', desc: 'Noites geladas e muitas pipocas.' },
    { title: 'Viagem surpresa', emoji: '✈️', desc: 'A melhor aventura improvisada.' },
    { title: 'Aniversário', emoji: '🎂', desc: 'Um dia só pra comemorar você.' }
  ]
}

function $(sel){return document.querySelector(sel)}

// anima contadores de forma suave
function animateCount(el, end, duration=1400){
  const start = 0;
  const range = end - start;
  let startTime = null;
  function step(timestamp){
    if(!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = Math.floor(start + range * easeOutCubic(progress));
    el.textContent = numberWithCommas(current);
    if(progress < 1) window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
}
function easeOutCubic(t){return 1 - Math.pow(1 - t, 3)}
function numberWithCommas(x){return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}

function renderStats(){
  const container = $('#stats');
  container.innerHTML = '';
  retrospect.stats.forEach(s =>{
    const el = document.createElement('div'); el.className='stat';
    el.innerHTML = `<div class="label">${s.label}</div><div id="${s.id}" class="value">0</div>`;
    container.appendChild(el);
    // depois do append animar
    setTimeout(()=> animateCount(document.getElementById(s.id), s.value, 1400), 200);
  })
}

function renderMemories(){
  const container = $('#memories');
  container.innerHTML = '';
  retrospect.memories.forEach(m =>{
    const card = document.createElement('div'); card.className='card memory';
    card.innerHTML = `
      <div class="mem-emoji">${m.emoji}</div>
      <div class="mem-content">
        <div class="mem-title">${m.title}</div>
        <div class="mem-desc">${m.desc}</div>
      </div>`;
    container.appendChild(card);
  })
}

// Confetti simples com elementos DOM
function burstConfetti(count = 30){
  const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#B388EB'];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    document.body.appendChild(el);
    const w = 8 + Math.random()*8;
    const h = 10 + Math.random()*10;
    el.style.width = w + 'px'; el.style.height = h + 'px';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.left = (50 + (Math.random()-0.5)*60) + '%';
    el.style.top = (10 + Math.random()*20) + '%';
    const rot = Math.random()*360;
    el.style.transform = `rotate(${rot}deg)`;
    const dur = 2000 + Math.random()*1400;
    // animar para cair
    el.animate([
      { transform: `translateY(0) rotate(${rot}deg)`, opacity:1 },
      { transform: `translateY(${400 + Math.random()*200}px) rotate(${rot+360}deg)`, opacity:0 }
    ],{duration:dur,easing:'cubic-bezier(.2,.6,.2,1)'}).onfinish = ()=> el.remove();
  }
}

function setup(){
  $('#year').textContent = retrospect.year;
  renderStats();
  renderMemories();
  // confete no botão principal
  $('#celebrate').addEventListener('click', ()=> burstConfetti(40));

  // botão de compartilhar (se suportado)
  $('#share').addEventListener('click', async ()=>{
    const text = `Nossa Retrospectiva ${retrospect.year}: ${retrospect.stats[0].value} dias juntos — veja as nossas memórias!`;
    if(navigator.share){
      try{ await navigator.share({title:`Retrospectiva ${retrospect.year}`, text}); }
      catch(e){ console.log('Compartilhar cancelado')}
    } else {
      // fallback: copia para clipboard
      try{ await navigator.clipboard.writeText(text); alert('Texto copiado para a área de transferência!'); }
      catch(e){ alert('Não foi possível compartilhar — copie manualmente:\n' + text); }
    }
  });

  // pequena animação inicial
  setTimeout(()=> document.querySelectorAll('.card').forEach((c,i)=> c.style.transform='translateY(0)'), 150);
}

window.addEventListener('DOMContentLoaded', setup);
