// Año en footer
const yearEls = document.querySelectorAll('#year');
yearEls.forEach(el => el.textContent = new Date().getFullYear());

// Toast helper (por si lo usas aún)
function showToast(message){
  const toastEl = document.getElementById('liveToast');
  if(!toastEl) return alert(message);
  toastEl.querySelector('.toast-body').textContent = message;
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
}

// Equipo (tarjetas con foto, nombre y bio)
const team = [
  {name:'Dr. Omar Navarro', role:'Medicina de exóticos', photo:'../recursos/omar.jpg', bio:'Aves y pequeños mamíferos. 6+ años de experiencia.'},
  {name:'Dr. Erwin Galeano', role:'Clínica canina y felina', photo:'../recursos/omar.jpg', bio:'Cirugía menor y medicina preventiva.'},
  {name:'Dr. Hernán Cruz', role:'Laboratorio clínico', photo:'../recursos/omar.jpg', bio:'Hematología, bioquímica y control sanitario animal.'},
  {name:'Dra. Heidi Gadea', role:'Laboratorio clínico', photo:'../recursos/omar.jpg', bio:'Hematología, bioquímica y control de calidad.'},
  {name:'Dr. Juan Lopéz', role:'Laboratorio clínico', photo:'../recursos/omar.jpg', bio:'Hematología, bioquímica y control de calidad.'},
  {name:'Dr. Pablo Peréz', role:'Laboratorio clínico', photo:'../recursos/omar.jpg', bio:'Hematología, bioquímica y control de calidad.'}
];
const teamGrid = document.getElementById('teamGrid');
if(teamGrid){
  team.forEach(t => {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${t.photo}" alt="${t.name}" class="card-img-top" style="height:220px;object-fit:cover"/>
        <div class="card-body">
          <h5 class="card-title mb-1">${t.name}</h5>
          <span class="badge bg-secondary mb-2">${t.role}</span>
          <p class="card-text small text-muted">${t.bio}</p>
        </div>
      </div>`;
    teamGrid.appendChild(col);
  });
}

// ===== Overlay Éxito (auto-inyectable, reutilizable)
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
      <p style="margin:0 0 12px;color:#666">Hemos recibido tu mensaje correctamente ¡Gracias por Preferirnos!</p>
      <button class="ok-btn" style="background:#7367F0;color:#fff;border:0;border-radius:8px;padding:10px 22px;font-weight:600;cursor:pointer">OK</button>
    </div>
  </div>
  <style>
    @keyframes pop-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes stroke{to{stroke-dashoffset:0}}
  </style>`;
  document.body.insertAdjacentHTML('beforeend', html);
}
function showSuccess(){ ensureSuccessOverlay(); const ov=document.getElementById('successOverlay'); ov.classList.remove('d-none'); ov.querySelector('.ok-btn').onclick=()=>ov.classList.add('d-none'); }

function buildCitaText(form){
  const get = n => (form.querySelector(`[name="${n}"]`)?.value || '').trim();
  // nombres que ya usas en tu form: nombre, correo, whatsapp, servicio, sucursal, fecha, hora, notas
  const lines = [
    `Servicio: ${get('servicio')}`,
    `Sucursal: ${get('sucursal')}`,
    `Fecha: ${get('fecha')}`,
    `Hora: ${get('hora') || '—'}`,
    `Nombre: ${get('nombre')}`,
    `WhatsApp: ${get('whatsapp')}`,
    `Correo: ${get('correo')}`,
    get('notas') ? `Notas: ${get('notas')}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}


// Reutilizable para cualquier form Netlify
async function netlifySubmit(form){
  const data = new FormData(form);
  const body = new URLSearchParams(data).toString();
  await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  showSuccess();
  form.reset();
}

// ENGANCHAR AMBOS FORMULARIOS
const contactoForm  = document.getElementById('formContacto');
const contactoForm1 = document.getElementById('formContacto1');

if (contactoForm) {
  contactoForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    netlifySubmit(contactoForm);
  });
}
if (contactoForm1) {
  contactoForm1.addEventListener('submit', (e)=>{
    e.preventDefault();
    netlifySubmit(contactoForm1);
  });
}

// ===== Prefijo automático de WhatsApp (+505) =====
function normalizeWhatsapp(input){
  if(!input) return;
  let v = (input.value || '').trim();
  if(v && !v.startsWith('+505')) {
    // elimina posibles repeticiones o espacios
    v = v.replace(/^\+?505\s*/,'');
    input.value = `+505 ${v}`.trim();
  }
}

// Aplica a ambos formularios de contacto
['formContacto','formContacto1'].forEach(id=>{
  const f = document.getElementById(id);
  if(!f) return;
  f.addEventListener('submit', ()=>{
    const w = f.querySelector('[name="whatsapp"]');
    normalizeWhatsapp(w);
  });
});


const citaForm = document.getElementById('formCita');
if(citaForm){
  citaForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    // Rellenar resumen legible
    const resumen = document.getElementById('citaResumen');
    if(resumen) resumen.value = buildCitaText(citaForm);

    // Envío estático (reutilizando netlifySubmit si ya lo tienes)
    const data = new FormData(citaForm);
    const body = new URLSearchParams(data).toString();
    await fetch("/", {
      method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body
    });
    showSuccess();
    citaForm.reset();
  });
}

// ===== Educación continua: Click para ampliar imagen (una sola vez)
document.addEventListener('click', e => {
  const img = e.target.closest('.educacion-item img');
  if(!img) return;
  const modalImg = document.getElementById('eduImgPreview');
  if(modalImg){
    modalImg.src = img.src;
    const modal = new bootstrap.Modal(document.getElementById('eduImgModal'));
    modal.show();
  }
});
