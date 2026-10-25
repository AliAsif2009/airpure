// Scroll-controlled video: the clip is stored as frames (assets/frames/f001.webp ...).
// Scrolling moves the playhead forward/back; stop scrolling and the video stops.
const FRAMES = 192, PATH = i => `assets/frames/f${String(i + 1).padStart(3, '0')}.webp`;
const cv = document.getElementById('stage'), ctx = cv.getContext('2d');
const imgs = new Array(FRAMES), loaderEl = document.getElementById('loader'), pct = document.getElementById('pct');
let W, H, target = 0, cur = 0, shown = -1, loaded = 0;

function size() { const d = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; shown = -1; }
addEventListener('resize', size); size();

function paint(i) {
  const im = imgs[i] || imgs.slice(0, i).reverse().find(Boolean);   // nearest loaded frame
  if (!im || !im.naturalWidth) return;
  const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
  ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
  shown = i;
}

function load(i) {
  return new Promise(res => {
    const im = new Image(); im.decoding = 'async';
    im.onload = im.onerror = () => { loaded++; pct.textContent = Math.round(loaded / FRAMES * 100) + '%'; if (i === 0) paint(0); res(); };
    im.src = PATH(i); imgs[i] = im;
  });
}
// first frame first, then the rest in parallel batches; page opens when ~all frames are ready
(async () => {
  await load(0);
  const rest = Array.from({ length: FRAMES - 1 }, (_, k) => k + 1);
  const workers = Array.from({ length: 6 }, async () => { while (rest.length) await load(rest.shift()); });
  await Promise.all(workers);
  loaderEl.classList.add('done');
})();

function tick() {
  const max = document.documentElement.scrollHeight - innerHeight;
  target = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  cur += (target - cur) * .12;
  if (Math.abs(target - cur) < .00005) cur = target;       // settle exactly, so video truly stops
  const i = Math.round(cur * (FRAMES - 1));
  if (i !== shown) paint(i);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// section reveal
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .15 });
document.querySelectorAll('.panel,.head,.grid,.fine').forEach(el => { el.classList.add('reveal'); io.observe(el); });

// form (front-end demo; connect to your backend, Formspree or email service)
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, st = f.querySelector('.status');
  if (!f.name.value.trim() || !f.phone.value.trim()) { st.textContent = 'Please enter your name and phone number.'; return; }
  st.textContent = `Thanks ${f.name.value.trim()}, we’ll call you shortly to confirm.`; f.reset();
});
document.getElementById('yr').textContent = new Date().getFullYear();
