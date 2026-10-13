/* ---------- Matrix rain (red) ---------- */
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
const chars = '01{}[]<>/;=+*#$%&ABCDEF'.split('');
const size = 16;
let drops = [];

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  drops = Array(Math.floor(canvas.width / size)).fill(0).map(() => Math.random() * -50);
}
resize();
addEventListener('resize', resize);

function rain() {
  ctx.fillStyle = 'rgba(7, 7, 10, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = size + 'px monospace';
  drops.forEach((y, i) => {
    ctx.fillStyle = Math.random() > 0.97 ? '#ffffff' : '#ff1e2d';
    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
    if (y * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 1 + boost;
  });
}
let boost = 0;
setInterval(() => { boost *= 0.9; rain(); }, 50);

/* ---------- Typing effect ---------- */
const lines = ['බුද්දිමතා', 'හෙනම කැරියා', 'GAMER CREATOR', 'DEV'];
const typing = document.getElementById('typing');
let li = 0, ci = 0, deleting = false;

function type() {
  const word = lines[li];
  typing.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) { ci++; setTimeout(type, 110); }
  else if (!deleting) { deleting = true; setTimeout(type, 1400); }
  else if (ci > 0) { ci--; setTimeout(type, 55); }
  else { deleting = false; li = (li + 1) % lines.length; setTimeout(type, 300); }
}
type();

/* ---------- Scroll reveal + skill bars ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      e.target.querySelectorAll('.fill').forEach(f => f.style.width = f.dataset.w + '%');
      e.target.querySelectorAll('b[data-n]').forEach(countUp);
    }
  });
}, { threshold: 0.35 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Active side dot ---------- */
const dots = document.querySelectorAll('.dots a');
const sections = document.querySelectorAll('section');
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.dots a, .menu a').forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.55 });
sections.forEach(s => spy.observe(s));

/* ---------- Scroll effects ---------- */
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards = [...document.querySelectorAll('.terminal, .panel')];
const bar = document.querySelector('.progress');
let lastY = scrollY;

function onScroll() {
  const vh = innerHeight;
  // progress bar
  bar.style.width = (scrollY / (document.documentElement.scrollHeight - vh) * 100) + '%';
  // matrix speeds up while scrolling
  boost = Math.min(boost + Math.abs(scrollY - lastY) / 40, 4);
  lastY = scrollY;
  if (calm) return;
  // 3D fade / blur / scale as each card leaves or enters the screen
  cards.forEach(el => {
    const r = el.getBoundingClientRect();
    const c = (r.top + r.height / 2 - vh / 2) / vh;      // -1 .. 1
    const a = Math.min(Math.abs(c) * 1.3, 1);
    el.style.opacity = 1 - a;
    el.style.filter = `blur(${a * 8}px)`;
    el.style.transform = `perspective(900px) translateY(${c * 70}px) rotateX(${c * -14}deg) scale(${1 - a * 0.15})`;
  });
}
addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- Eased scroll for menu / dots ---------- */
const root = document.documentElement;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (calm) { target.scrollIntoView(); return; }
    const from = scrollY, to = target.offsetTop, dur = 1100, t0 = performance.now();
    root.style.scrollSnapType = 'none';
    root.style.scrollBehavior = 'auto';
    (function step(now) {
      const t = Math.min((now - t0) / dur, 1);
      scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(step);
      else { root.style.scrollSnapType = ''; root.style.scrollBehavior = ''; }
    })(t0);
  });
});

/* ---------- Live clock (Sri Lanka, UTC+5:30) ---------- */
const clock = document.getElementById('clock');
const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});
function tick() { clock.textContent = fmt.format(new Date()) + ' UTC+5:30'; }
tick();
setInterval(tick, 1000);

/* ---------- Skill % count-up ---------- */
function countUp(b) {
  if (b.dataset.done) return;
  b.dataset.done = 1;
  const end = +b.dataset.n, t0 = performance.now();
  (function step(now) {
    const t = Math.min((now - t0) / 1400, 1);
    b.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + '%';
    if (t < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- Click to copy (Discord username, mail) ---------- */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  fallbackCopy(text);
  return Promise.resolve();
}
function fallbackCopy(text) {
  const t = document.createElement('textarea');
  t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select();
  try { document.execCommand('copy'); } catch (e) {}
  t.remove();
}
document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', () => {
    copyText(el.dataset.copy);
    showToast(el.dataset.msg || 'Copied');
  });
});

/* ---------- ASCII codes row: BANDARA -> 66 65 78 68 65 82 65 ---------- */
const word = 'BANDARA';
const asciiBox = document.getElementById('ascii');
const chips = [...word].map(ch => {
  const s = document.createElement('span');
  s.className = 'chip';
  s.textContent = ch.charCodeAt(0);
  s.title = ch;
  asciiBox.appendChild(s);
  return { el: s, code: ch.charCodeAt(0), ch };
});
function swap(c, toLetter) {
  c.el.classList.remove('flip'); void c.el.offsetWidth; c.el.classList.add('flip');
  setTimeout(() => {
    c.el.textContent = toLetter ? c.ch : c.code;
    c.el.classList.toggle('letter', toLetter);
  }, 250);
}
function decodeCycle() {
  chips.forEach((c, i) => setTimeout(() => swap(c, true), i * 220));
  setTimeout(() => chips.forEach((c, i) => setTimeout(() => swap(c, false), i * 220)), 3200);
}
setTimeout(decodeCycle, 1800);
setInterval(decodeCycle, 7000);

/* ---------- Live Discord server stats (public invite API) ---------- */
function animNum(el, to) {
  const from = parseInt(el.textContent.replace(/\D/g, '')) || 0, t0 = performance.now();
  (function step(now) {
    const t = Math.min((now - t0) / 1000, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  })(t0);
}
async function loadServer(card) {
  const code = card.dataset.invite;
  const note = card.querySelector('.s-note');
  try {
    const res = await fetch('https://discord.com/api/v10/invites/' + code + '?with_counts=true');
    if (!res.ok) throw new Error('bad response');
    const d = await res.json();
    card.querySelector('.s-name').textContent = d.guild.name;
    animNum(card.querySelector('.s-online'), d.approximate_presence_count);
    animNum(card.querySelector('.s-members'), d.approximate_member_count);
    const joinText = document.querySelector('[data-join="' + code + '"] span');
    if (joinText) joinText.textContent = 'Join ' + d.guild.name;
    if (d.guild.icon) {
      const img = new Image();
      img.alt = d.guild.name;
      img.onload = () => { const box = card.querySelector('.s-icon'); box.textContent = ''; box.appendChild(img); };
      img.src = 'https://cdn.discordapp.com/icons/' + d.guild.id + '/' + d.guild.icon + '.png?size=128';
    }
    note.textContent = 'Live. Updates every minute';
  } catch (err) {
    note.textContent = 'Live stats unavailable right now';
  }
}
const serverCards = document.querySelectorAll('.server-card');
const refreshServers = () => serverCards.forEach(loadServer);
refreshServers();
setInterval(refreshServers, 60000);
