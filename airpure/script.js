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

// ---------- settings ----------
const WA_NUMBER = '15550102030';   // your WhatsApp number, country code first, no + or spaces

// ---------- section reveal ----------
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .12 });
document.querySelectorAll('.panel,.head,.grid,.fine,.rate,.faq,.bookwrap,.addons').forEach(el => { el.classList.add('reveal'); io.observe(el); });

// ---------- packages ----------
const PLANS = {
  home: [
    { id: 'Essential', sub: 'A light refresh for apartments and small homes', price: '$149', note: 'up to 6 vents', items: ['Supply line cleaning', 'Vent covers wiped', 'Filter check', 'Before and after photos'] },
    { id: 'Complete', badge: 'Most popular', sub: 'Whole-home deep clean for better air', price: '$299', note: 'whole home', items: ['All supply and return ducts', 'Furnace blower cleaning', 'AC coil cleaning', 'Sanitizing treatment', '7-day re-clean guarantee'] },
    { id: 'Premium', sub: 'Everything, plus extras for allergy households', price: '$449', note: 'whole home', items: ['Everything in Complete', 'Dryer vent cleaning', 'Mold treatment', 'Camera inspection report', 'Free filter replacement'] }
  ],
  biz: [
    { id: 'Small office', sub: 'Offices up to 150 m²', price: '$349', note: 'per visit', items: ['Ducts and vents cleaned', 'After-hours scheduling', 'Filter check', 'Service report'] },
    { id: 'Retail / clinic', badge: 'Best for shops', sub: 'Shops, clinics and restaurants up to 400 m²', price: '$699', note: 'per visit', items: ['Full duct and coil cleaning', 'Sanitizing treatment', 'Weekend or night service', 'Written compliance report'] },
    { id: 'Enterprise', sub: 'Multi-floor buildings and chains', price: 'Custom', note: 'after site visit', items: ['On-site assessment', 'Yearly service contract', 'Dedicated technician', 'Priority support'] }
  ]
};
const plansEl = document.getElementById('plans'), form = document.getElementById('form');
function renderPlans(type) {
  plansEl.innerHTML = PLANS[type].map(p => `
    <article class="glass card plan${p.badge ? ' feat' : ''}">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <h3>${p.id}</h3><p class="sub">${p.sub}</p>
      <div class="price">${p.price}<small>${p.note}</small></div>
      <ul>${p.items.map(i => `<li><svg class="ic"><use href="#i-check"/></svg>${i}</li>`).join('')}</ul>
      <a href="#book" class="btn${p.badge ? '' : ' ghost'}" data-pkg="${p.id}" data-type="${type}">Choose ${p.id}</a>
    </article>`).join('');
}
renderPlans('home');
document.querySelectorAll('input[name=ptype]').forEach(r => r.addEventListener('change', () => renderPlans(r.value)));
plansEl.addEventListener('click', e => {
  const b = e.target.closest('[data-pkg]'); if (!b) return;
  form.pkg.value = b.dataset.pkg;
  const prop = b.dataset.type === 'biz' ? 'Office' : 'Home';
  form.querySelector(`input[name=prop][value="${prop}"]`).checked = true;
  if (b.dataset.type === 'biz') form.service.value = 'Commercial HVAC';
});

// ---------- booking form ----------
const dateEl = form.date, today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
dateEl.min = today; dateEl.value = today;
form.querySelectorAll('.step button').forEach(b => b.addEventListener('click', () => {
  const v = form.vents; v.value = Math.min(60, Math.max(1, (+v.value || 1) + +b.dataset.d));
}));
const setErr = (el, msg) => { const e = el.closest('label').querySelector('.err'); e.textContent = msg; el.classList.toggle('bad', !!msg); return !msg; };
function validate() {
  let ok = true;
  ok &= setErr(form.name, form.name.value.trim().length < 2 ? 'Enter your full name.' : '');
  ok &= setErr(form.phone, form.phone.value.replace(/\D/g, '').length < 7 ? 'Enter a valid phone number.' : '');
  ok &= setErr(form.email, form.email.value && !form.email.checkValidity() ? 'Enter a valid email address.' : '');
  ok &= setErr(form.date, !form.date.value || form.date.value < today ? 'Pick today or a later date.' : '');
  ok &= setErr(form.address, form.address.value.trim().length < 4 ? 'Enter your address or area.' : '');
  ok &= setErr(form.ok, form.ok.checked ? '' : 'Please tick this box to continue.');
  return !!ok;
}
form.addEventListener('input', e => { if (e.target.classList.contains('bad')) validate(); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const st = form.querySelector('.status');
  if (!validate()) { st.textContent = 'Please fix the highlighted fields.'; form.querySelector('.bad')?.focus(); return; }
  st.textContent = '';
  const d = Object.fromEntries(new FormData(form));
  const rows = [['Name', d.name], ['Phone', d.phone], ['Property', d.prop], ['Service', `${d.service} (${d.pkg})`], ['Vents', d.vents], ['When', `${d.date}, ${d.slot}`], ['Address', d.address], ['Contact by', d.via]];
  const msg = `Hello AirPure, I'd like to book:\n` + rows.map(r => `${r[0]}: ${r[1]}`).join('\n') + (d.notes ? `\nNotes: ${d.notes}` : '');
  const done = document.getElementById('done');
  done.innerHTML = `<span class="tick"><svg class="ic"><use href="#i-check"/></svg></span><h3>Request received</h3>
    <p class="lead">Thanks ${d.name.split(' ')[0]}, we’ll confirm your slot by ${d.via.toLowerCase()} shortly.</p>
    <dl>${rows.map(r => `<dt>${r[0]}</dt><dd>${r[1].replace(/</g, '&lt;')}</dd>`).join('')}</dl>
    <div class="actions"><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}">Send details on WhatsApp</a><button class="btn ghost" type="button" id="again">Book another</button></div>`;
  form.closest('.bookwrap').hidden = true; done.hidden = false;
  done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('again').onclick = () => { form.reset(); dateEl.value = today; done.hidden = true; form.closest('.bookwrap').hidden = false; };
});
document.getElementById('yr').textContent = new Date().getFullYear();
