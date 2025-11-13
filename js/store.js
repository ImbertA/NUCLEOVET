// Catálogo demo
const CATALOG = [
  {id:1, name:'Bravecto >2 - 4,5Kg', price:1100.00, img:'/recursos/productos/brave.png'},
  {id:2, name:'Bravecto >4,5 - 10Kg', price:1500.00, img:'/recursos/productos/bravecto2.png'},
  {id:3, name:'Bravecto >10 - 20Kg', price:1800.00, img:'/recursos/productos/bravecto3.jpg'},
  {id:4, name:'Bravecto >20 - 40Kg', price:2100.90, img:'/recursos/productos/bravecto4.jpg'},
  {id:4, name:'Bravecto >40 - 56Kg', price:2500.00, img:'/recursos/productos/bravecto5.jpeg'}
];

let CART = JSON.parse(localStorage.getItem('nv_cart')||'[]');

const grid = document.getElementById('productGrid');
const search = document.getElementById('search');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

function buildProductsText(cart){
  let total = 0;
  const lines = cart.map(it => {
    const sub = it.price * it.qty;
    total += sub;
    return `• ${it.name} × ${it.qty} — ${money(sub)} (${money(it.price)} c/u)`;
  });
  lines.push(`Total: ${money(total)}`);
  return lines.join('\n');
}


// ===== Moneda: córdobas (NIO)
function money(n){
  return new Intl.NumberFormat('es-NI', {
    style:'currency', currency:'NIO', maximumFractionDigits:2
  }).format(n);
}

// Texto plano para correo: nombres + cantidades + total (sin JSON)
function formatPedidoProductos(cart){
  let total = 0;
  const items = cart.map(p => {
    total += p.price * p.qty;
    return `${p.name} × ${p.qty}`;
  });
  return `${items.join(', ')}\nTotal: ${money(total)}`;
}


function renderGrid(items){
  if(!grid) return;
  grid.innerHTML = '';
  items.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-3';
    col.innerHTML = `
      <div class="card h-100 product-card">
        <img src="${p.img}" class="card-img-top" alt="${p.name}" />
        <div class="card-body">
          <h6 class="card-title">${p.name}</h6>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-semibold">${money(p.price)}</span>
            <button class="btn btn-outline-brand" data-id="${p.id}"><i class="bi bi-cart-plus"></i></button>
          </div>
        </div>
      </div>`;
    grid.appendChild(col);
  });
}

function renderCart(){
  if(!cartItems) return;
  cartItems.innerHTML = '';
  let total = 0; let count = 0;
  CART.forEach((item, idx) => {
    total += item.price * item.qty; count += item.qty;
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `<div><strong>${item.name}</strong><br><small class="text-muted">${money(item.price)} × ${item.qty}</small></div>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx},-1)">-</button>
                      <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${idx},1)">+</button>
                      <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${idx})"><i class="bi bi-trash"></i></button>
                    </div>`;
    cartItems.appendChild(li);
  });
  if(cartCount) cartCount.textContent = count;
  if(cartTotal) cartTotal.textContent = money(total);
  localStorage.setItem('nv_cart', JSON.stringify(CART));
}

function addToCart(id){
  const p = CATALOG.find(x=>x.id===id);
  if(!p) return;
  const ex = CART.find(x=>x.id===id);
  if(ex) ex.qty++; else CART.push({...p, qty:1});
  renderCart();
}

window.changeQty = (idx, delta) => {
  CART[idx].qty += delta;
  if (CART[idx].qty <= 0) CART.splice(idx,1);
  renderCart();
}
window.removeItem = (idx) => { CART.splice(idx,1); renderCart(); }

// Eventos
if(grid){
  renderGrid(CATALOG);
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-id]');
    if(!btn) return; addToCart(parseInt(btn.dataset.id));
  });
}

if(search && grid){
  search.addEventListener('input', ()=>{
    const q = search.value.toLowerCase();
    renderGrid(CATALOG.filter(p=>p.name.toLowerCase().includes(q)));
  });
}

renderCart();

// Checkout -> abrir modal compra y cargar SOLO nombres + total (no JSON)
const checkoutBtn = document.getElementById('checkoutBtn');
if(checkoutBtn){
  checkoutBtn.addEventListener('click', ()=>{
    const pedidoInput = document.getElementById('pedidoJSON'); // <input type="hidden" id="pedidoJSON" name="pedido">
    if(pedidoInput){
      pedidoInput.value = formatPedidoProductos(CART);
    }
    const modal = new bootstrap.Modal(document.getElementById('compraModal'));
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
      <p style="margin:0 0 12px;color:#666">El pedido se ha registrado correctamente. Nos pondremos en Contacto vía Correo o WhatsApp para confirmar ¡Gracias por Preferirnos!</p>
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


// Envío de compra (Netlify Forms + animación) — SOLO nombres + total
const formCompra = document.getElementById('formCompra');
if(formCompra){
  formCompra.addEventListener('submit', async (e)=>{
    e.preventDefault();

    // fuerza el hidden con texto plano
    const pedidoInput = document.getElementById('pedidoJSON');
    if(pedidoInput){
      pedidoInput.value = formatPedidoProductos(CART);
    }

    // submit estático
    const data = new FormData(formCompra);
    const body = new URLSearchParams(data).toString();
    await fetch("/", {
      method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body
    });

    // Mostrar overlay y, al tocar OK, limpiar y cerrar modal
    showSuccess(() => {
      // limpiar formulario
      formCompra.reset();
      // vaciar carrito de productos
      CART = []; 
      renderCart();
      // cerrar modal
      try {
        const modalEl = document.getElementById('compraModal');
        const inst = (window.bootstrap && window.bootstrap.Modal)
          ? window.bootstrap.Modal.getInstance(modalEl)
          : null;
        if (inst) inst.hide();
      } catch(_) {}
    });
  });
}

// Año footer
const yearEls = document.querySelectorAll('#year');
yearEls.forEach(el => el.textContent = new Date().getFullYear());
