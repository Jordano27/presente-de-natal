const retrospect = {
    year: new Date().getFullYear(),
    stats: [
        { id: 'dias', label: 'Dias juntos', value: diasJuntos() },
        { id: 'mensagens', label: 'Mensagens trocadas', value: quantidadeIncontavel() },
        { id: 'te amo', label: 'Te amo ditos', value: calcularValorAtualizado() },
        { id: 'beijos', label: 'Beijos', value: quantidadeIncontavel() }
    ],
    memories: [
        { title: 'Praia em Julho', emoji: '🏖️', desc: 'Sol, mar e risadas até o pôr do sol.' },
        { title: 'Série maratona', emoji: '🍿', desc: 'Noites geladas e muitas pipocas.' },
        { title: 'Viagem surpresa', emoji: '✈️', desc: 'A melhor aventura improvisada.' },
        { title: 'Aniversário', emoji: '🎂', desc: 'Um dia só pra comemorar você.' }
    ]
}

function quantidadeIncontavel() {
   return 'Incontável';
}

function calcularValorAtualizado() {
    const VALOR_BASE = 29878;
    const INCREMENTO_DIARIO = 37;
    
    // Data de início (hoje) - 22/12/2025
    // Nota: No JS, o mês começa em 0 (Janeiro = 0, Dezembro = 11)
    const dataInicio = new Date(2025, 11, 22); 
    const dataAtual = new Date();

    // Zera as horas para calcular apenas a diferença de dias inteiros
    dataInicio.setHours(0, 0, 0, 0);
    dataAtual.setHours(0, 0, 0, 0);

    // Calcula a diferença em milissegundos e converte para dias
    const diferencaMs = dataAtual - dataInicio;
    const diasPassados = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

    // Se a data atual for anterior à data de início, não subtrai (opcional)
    const diasEfetivos = diasPassados > 0 ? diasPassados : 0;

    // Valor final
    const valorTotal = VALOR_BASE + (diasEfetivos * INCREMENTO_DIARIO);

    return valorTotal;
}

function diasJuntos() { 
  const dataInicial = new Date('2025-01-01T00:00:00');
    const dataAtual = new Date(); // Pega a data e hora exata do momento

    // Calcula a diferença em milissegundos
    const diferencaEmMs = dataAtual - dataInicial;

    // Converte milissegundos para dias
    // (1000ms * 60s * 60m * 24h)
    const diasPassados = Math.floor(diferencaEmMs / (1000 * 60 * 60 * 24));

    return diasPassados; 
}

function $(sel) { return document.querySelector(sel) }

// anima contadores de forma suave
function animateCount(el, end, duration = 1400) {
    const start = 0;
    const range = end - start;
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(start + range * easeOutCubic(progress));
        el.textContent = numberWithCommas(current);
        if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
}
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }
function numberWithCommas(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") }

function renderStats() {
    const container = $('#stats');
    container.innerHTML = '';
    retrospect.stats.forEach(s => {
        const el = document.createElement('div'); el.className = 'stat';
        // Sempre renderiza o container de valor. Se o valor for numérico animamos, caso
        // contrário mostramos o texto tal como está (por exemplo: "Incontável").
        el.innerHTML = `<div class="label">${s.label}</div><div id="${s.id}" class="value">0</div>`;
        container.appendChild(el);
        const valueEl = document.getElementById(s.id);
        // Se o valor não for um número válido, escreve direto e evita animar (que gera NaN)
        if (typeof s.value !== 'number' || isNaN(s.value)) {
            valueEl.textContent = String(s.value);
        } else {
            // depois do append animar
            setTimeout(() => animateCount(valueEl, s.value, 1400), 200);
        }
    })
}

function renderMemories() {
    const container = $('#memories');
    container.innerHTML = '';
    retrospect.memories.forEach(m => {
        const card = document.createElement('div'); card.className = 'card memory';
        card.innerHTML = `
      <div class="mem-emoji">${m.emoji}</div>
      <div class="mem-content">
        <div class="mem-title">${m.title}</div>
        <div class="mem-desc">${m.desc}</div>
      </div>`;
        container.appendChild(card);
    })
}

/* ---------------- Stories / modal carousel ---------------- */
// Gera stories a partir de `retrospect.memories`. Cada story tem duração em ms.
const stories = retrospect.memories.map(m => ({
    title: m.title,
    content: m.emoji,
    desc: m.desc,
    duration: 4000
}));

const storyState = {
    current: 0,
    timeoutId: null,
    isPaused: false,
    startTimestamp: null,
    remaining: 0
};

function buildStoriesUI(){
    const slidesRoot = document.getElementById('storySlides');
    const progressesRoot = document.getElementById('storyProgresses');
    slidesRoot.innerHTML = '';
    progressesRoot.innerHTML = '';
    stories.forEach((s, i) =>{
        const slide = document.createElement('div');
        slide.className = 'story-slide';
        slide.setAttribute('data-index', i);
        // Conteúdo simples: emoji grande + título/desc
        slide.innerHTML = `<div>
            <div style="font-size:64px;margin-bottom:12px">${s.content}</div>
            <div style="font-weight:700;font-size:18px">${s.title}</div>
            <div style="color:rgba(230,240,234,0.85);margin-top:6px;font-size:14px">${s.desc}</div>
        </div>`;
        slidesRoot.appendChild(slide);

        const p = document.createElement('div'); p.className = 'story-modal__progress';
        const inner = document.createElement('i');
        inner.style.width = '0%';
        p.appendChild(inner);
        progressesRoot.appendChild(p);
    })
}

function openStoriesModal(){
    buildStoriesUI();
    const modal = document.getElementById('storyModal');
    modal.setAttribute('aria-hidden','false');
    // reset state
    storyState.current = 0; storyState.isPaused = false; storyState.remaining = 0;
    showSlide(0);
    // attach pause on hover
    const content = modal.querySelector('.story-modal__content');
    content.addEventListener('mouseenter', pauseCarousel);
    content.addEventListener('mouseleave', resumeCarousel);
    // close handlers (backdrop and close button)
    modal.querySelectorAll('[data-close]').forEach(el=> el.addEventListener('click', closeStoriesModal));
    // esc key
    document.addEventListener('keydown', escHandler);
}

function escHandler(e){ if (e.key === 'Escape') closeStoriesModal(); }

function closeStoriesModal(){
    const modal = document.getElementById('storyModal');
    modal.setAttribute('aria-hidden','true');
    // clear timers
    clearCurrentTimeout();
    // remove event listeners (best-effort)
    const content = modal.querySelector('.story-modal__content');
    if (content){
        content.removeEventListener('mouseenter', pauseCarousel);
        content.removeEventListener('mouseleave', resumeCarousel);
    }
    modal.querySelectorAll('[data-close]').forEach(el=> el.removeEventListener('click', closeStoriesModal));
    document.removeEventListener('keydown', escHandler);
}

function clearCurrentTimeout(){ if (storyState.timeoutId) { clearTimeout(storyState.timeoutId); storyState.timeoutId = null; } }

function showSlide(index){
    const slides = document.querySelectorAll('.story-slide');
    const progresses = document.querySelectorAll('.story-modal__progress > i');
    if (!slides.length) return;
    // bounds
    if (index < 0) index = slides.length -1;
    if (index >= slides.length) index = 0;
    // reset previous active
    slides.forEach(s=> s.classList.remove('active'));
    slides[index].classList.add('active');
    // reset progress bars: completed ones set to 100, later ones 0
    progresses.forEach((p,i)=>{
        p.style.transition = 'none';
        if (i < index) { p.style.width = '100%'; }
        else if (i === index) { p.style.width = '0%'; }
        else { p.style.width = '0%'; }
    });
    // force reflow then animate current progress
    const currentFill = progresses[index];
    const duration = stories[index].duration;
    void currentFill.offsetWidth;
    currentFill.style.transition = `width ${duration}ms linear`;
    currentFill.style.width = '100%';
    clearCurrentTimeout();
    storyState.startTimestamp = Date.now();
    storyState.remaining = duration;
    storyState.timeoutId = setTimeout(()=>{
        // advance
        storyState.current = index + 1;
        showSlide(storyState.current);
    }, duration);
}

function pauseCarousel(){
    if (storyState.isPaused) return;
    storyState.isPaused = true;
    // compute elapsed for current progress
    const idx = storyState.current;
    const fills = document.querySelectorAll('.story-modal__progress > i');
    if (!fills[idx]) return;
    // computed width percent
    const computedWidth = parseFloat(getComputedStyle(fills[idx]).width) || 0;
    const parentWidth = fills[idx].parentElement.getBoundingClientRect().width || 1;
    const progress = Math.min(1, computedWidth / parentWidth);
    const elapsed = progress * stories[idx].duration;
    const remaining = Math.max(0, stories[idx].duration - elapsed);
    storyState.remaining = remaining;
    // stop transitions and freeze width
    fills[idx].style.transition = 'none';
    fills[idx].style.width = (progress*100) + '%';
    clearCurrentTimeout();
}

function resumeCarousel(){
    if (!storyState.isPaused) return;
    storyState.isPaused = false;
    const idx = storyState.current;
    const fills = document.querySelectorAll('.story-modal__progress > i');
    if (!fills[idx]) return;
    const remaining = storyState.remaining || stories[idx].duration;
    // continue transition to 100%
    // ensure transition property is set to remaining duration
    void fills[idx].offsetWidth;
    fills[idx].style.transition = `width ${remaining}ms linear`;
    fills[idx].style.width = '100%';
    storyState.startTimestamp = Date.now();
    clearCurrentTimeout();
    storyState.timeoutId = setTimeout(()=>{
        storyState.current = idx + 1;
        showSlide(storyState.current);
    }, remaining);
}

function nextStory(){
    clearCurrentTimeout();
    storyState.current = storyState.current + 1;
    showSlide(storyState.current);
}

function prevStory(){
    clearCurrentTimeout();
    storyState.current = storyState.current - 1;
    showSlide(storyState.current);
}

/* ---------------- end stories ---------------- */

// Confetti simples com elementos DOM
function burstConfetti(count = 30) {
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B388EB'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        document.body.appendChild(el);
        const w = 8 + Math.random() * 8;
        const h = 10 + Math.random() * 10;
        el.style.width = w + 'px'; el.style.height = h + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.left = (50 + (Math.random() - 0.5) * 60) + '%';
        el.style.top = (10 + Math.random() * 20) + '%';
        const rot = Math.random() * 360;
        el.style.transform = `rotate(${rot}deg)`;
        const dur = 2000 + Math.random() * 1400;
        // animar para cair
        el.animate([
            { transform: `translateY(0) rotate(${rot}deg)`, opacity: 1 },
            { transform: `translateY(${400 + Math.random() * 200}px) rotate(${rot + 360}deg)`, opacity: 0 }
        ], { duration: dur, easing: 'cubic-bezier(.2,.6,.2,1)' }).onfinish = () => el.remove();
    }
}

function setup() {
    $('#year').textContent = retrospect.year;
    renderStats();
    renderMemories();
    // Ao clicar em Celebrar: abre o modal de stories e dá um burst de confete
    $('#celebrate').addEventListener('click', () => { burstConfetti(30); openStoriesModal(); });

    // botão de compartilhar (se suportado)
    $('#share').addEventListener('click', async () => {
        const text = `Nossa Retrospectiva ${retrospect.year}: ${retrospect.stats[0].value} dias juntos — veja as nossas memórias!`;
        if (navigator.share) {
            try { await navigator.share({ title: `Retrospectiva ${retrospect.year}`, text }); }
            catch (e) { console.log('Compartilhar cancelado') }
        } else {
            // fallback: copia para clipboard
            try { await navigator.clipboard.writeText(text); alert('Texto copiado para a área de transferência!'); }
            catch (e) { alert('Não foi possível compartilhar — copie manualmente:\n' + text); }
        }
    });

    // pequena animação inicial
    setTimeout(() => document.querySelectorAll('.card').forEach((c, i) => c.style.transform = 'translateY(0)'), 150);
}

window.addEventListener('DOMContentLoaded', setup);
