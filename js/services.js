// ===== NUCLEOVET - Servicios (carrito/solicitud) =====

// DOM
const gridS = document.getElementById('servicesGrid');
const searchS = document.getElementById('searchServices');
const countS = document.getElementById('svc-count');
const listS = document.getElementById('svc-items');
const totalS = document.getElementById('svc-total');
const btnOpen = document.getElementById('openRequest');
const reqModalEl = document.getElementById('solicitudModal');
const pedidoInput = document.getElementById('pedidoServiciosJSON');

// Datos (inyectados por cada página)
const SERVICES = (window.SERVICES || []);
let CART_S = JSON.parse(sessionStorage.getItem('nv_svc_cart_'+(window.CAT_TITLE||'')) || '[]');

function buildServicesText(cart){
  let total = 0;
  const lines = cart.map(it => {
    const sub = it.price * it.qty;
    total += sub;
    return `• ${it.name} × ${it.qty} — ${money(sub)} (${money(it.price)} c/u)`;
  });
  lines.push(`Total: ${money(total)}`);
  return lines.join('\n');
}

// Texto plano solo con nombres + cantidades + total (sin JSON)
function formatPedidoServicios(cart){
  let total = 0;
  const items = cart.map(it => {
    total += it.price * it.qty;
    return `${it.name} × ${it.qty}`;
  });
  return `${items.join(', ')}\nTotal: ${money(total)}`;
}


// ===== Moneda: córdobas (NIO)
function money(n){
  return new Intl.NumberFormat('es-NI', {
    style:'currency', currency:'NIO', maximumFractionDigits:2
  }).format(n);
}

function buildServicesText(cart){
  let total = 0;
  const lines = cart.map(it => {
    const sub = it.price * it.qty;
    total += sub;
    return `• ${it.name} × ${it.qty} — ${money(sub)} (${money(it.price)} c/u)`;
  });
  lines.push(`Total: ${money(total)}`);
  return lines.join('\n');
}


function renderGridServices(items){
  if(!gridS) return;
  gridS.innerHTML = '';
  items.forEach((s, idx)=>{
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h6 class="mb-1">${s.name}</h6>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-semibold">${money(s.price)}</span>
            <button class="btn btn-outline-brand btn-sm" data-idx="${idx}">
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>`;
    gridS.appendChild(col);
  });
}

function renderCartServices(){
  if(!listS) return;
  listS.innerHTML = '';
  let total = 0, count = 0;
  CART_S.forEach((it, i)=>{
    total += it.price * it.qty; count += it.qty;
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div><strong>${it.name}</strong><br><small class="text-muted">${money(it.price)} × ${it.qty}</small></div>
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-secondary" onclick="svcQty(${i},-1)">-</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="svcQty(${i},1)">+</button>
        <button class="btn btn-sm btn-outline-danger" onclick="svcDel(${i})"><i class="bi bi-trash"></i></button>
      </div>`;
    listS.appendChild(li);
  });
  if(countS) countS.textContent = count;
  if(totalS) totalS.textContent = money(total);
  sessionStorage.setItem('nv_svc_cart_'+(window.CAT_TITLE||''), JSON.stringify(CART_S));
}

window.svcQty = (i,d) => {
  CART_S[i].qty += d;
  if(CART_S[i].qty<=0) CART_S.splice(i,1);
  renderCartServices();
};
window.svcDel = (i) => { CART_S.splice(i,1); renderCartServices(); };

if(gridS){
  renderGridServices(SERVICES);
  gridS.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-idx]');
    if(!btn) return;
    const s = SERVICES[parseInt(btn.dataset.idx)];
    const ex = CART_S.find(x=>x.id===s.id);
    if(ex) ex.qty++; else CART_S.push({...s, qty:1});
    renderCartServices();
  });
}

if(searchS && gridS){
  searchS.addEventListener('input', ()=>{
    const q = searchS.value.toLowerCase();
    renderGridServices(SERVICES.filter(s=>s.name.toLowerCase().includes(q)));
  });
}

// Abrir modal "Solicitar servicio"
if(btnOpen){
  btnOpen.addEventListener('click', ()=>{
    if(pedidoInput){
      pedidoInput.value = formatPedidoServicios(CART_S); // <— aquí ya NO va JSON
    }
    const modal = new bootstrap.Modal(reqModalEl);
    modal.show();
  });
}


// ===== Overlay Éxito (auto-inyectable)
function ensureSuccessOverlay(){
  if(document.getElementById('successOverlay')) return;
  const html = `
  <div id="successOverlay" class="d-none" style="position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.35);z-index:2000">
    <div class="success-card" style="width:320px;background:#fff;border-radius:14px;padding:28px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:pop-in .18s ease-out forwards">
      <svg class="checkmark" viewBox="0 0 52 52" style="width:84px;height:84px;display:block;margin:2px auto 14px">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"
          style="stroke:#9BE7AF;stroke-width:3;stroke-miterlimit:10;stroke-dasharray:166;stroke-dashoffset:166;animation:stroke .6s cubic-bezier(.65,0,.45,1) forwards"></circle>
        <path class="checkmark__check" fill="none" d="M14 27 l7 7 l17 -17"
          style="stroke:#30C266;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48;animation:stroke .35s .35s cubic-bezier(.65,0,.45,1) forwards"></path>
      </svg>
      <h3 style="margin:8px 0 6px;font-weight:700">Éxito</h3>
      <p style="margin:0 0 12px;color:#666">La solicitud se ha registrado correctamente. Nos pondremos en Contacto vía Correo o WhatsApp para confirmar ¡Gracias por Preferirnos!</p>
      <button class="ok-btn" style="background:#7367F0;color:#fff;border:0;border-radius:8px;padding:10px 22px;font-weight:600;cursor:pointer">OK</button>
    </div>
  </div>
  <style>
    @keyframes pop-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes stroke{to{stroke-dashoffset:0}}
  </style>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function showSuccess(onOk){
  ensureSuccessOverlay();
  const ov = document.getElementById('successOverlay');
  ov.classList.remove('d-none');
  ov.querySelector('.ok-btn').onclick = () => {
    ov.classList.add('d-none');
    if (typeof onOk === 'function') onOk();
  };
}

// Submit Netlify form (con animación de éxito)
const formReq = document.getElementById('formSolicitudServicio');
if(formReq){
  formReq.addEventListener('submit', async (e)=>{
    e.preventDefault();

    // asegurar pedido "nombres + total"
    const hidden = document.getElementById('pedidoServiciosJSON');
    if(hidden) hidden.value = formatPedidoServicios(CART_S || []);

    // envío estático
    const data = new FormData(formReq);
    const body = new URLSearchParams(data).toString();
    await fetch("/", {
      method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body
    });

    // Mostrar overlay y, al tocar OK, limpiar y cerrar modal
    showSuccess(() => {
      // limpiar formulario
      formReq.reset();
      // vaciar carrito de servicios
      CART_S = []; 
      renderCartServices();
      // cerrar modal
      try {
        const inst = (window.bootstrap && window.bootstrap.Modal)
          ? window.bootstrap.Modal.getInstance(reqModalEl)
          : null;
        if (inst) inst.hide();
      } catch(_) {}
    });
  });
}


// Año footer (por si la página no lo tenía ya)
document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
