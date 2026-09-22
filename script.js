const serviceCatalog = {
  "Frenos": [
    ["Ajuste de frenos",80],
    ["Cambio de balatas",120],
    ["Cambio de cable de freno",100],
    ["Purga de frenos hidráulicos",180]
  ],
  "Transmisión": [
    ["Ajuste de cambios",100],
    ["Limpieza de transmisión",120],
    ["Lubricación",60],
    ["Cambio de cadena",100],
    ["Cambio de cassette",140],
    ["Cambio de desviador",150]
  ],
  "Ruedas": [
    ["Inflado y revisión",30],
    ["Reparación de ponchadura",80],
    ["Centrado de rueda",150],
    ["Cambio de cámara",80],
    ["Cambio de llanta",100]
  ],
  "General": [
    ["Lavado básico",100],
    ["Revisión general",150],
    ["Ajuste de dirección",100],
    ["Ajuste de asiento",50],
    ["Mantenimiento de suspensión",250]
  ]
};

let orders = JSON.parse(localStorage.getItem("bikeOrders") || "null") || [
  {
    id:"ORD-0001", date:"04/09/2026", status:"open",
    client:{name:"Carlos Ramírez",phone:"312 555 1080",email:"carlos@email.com"},
    bikes:[{brand:"Trek",model:"Marlin 5",color:"Negro",type:"Montaña",serial:"TRK-M5-001"}],
    services:[{name:"Ajuste de cambios",price:100},{name:"Lubricación",price:60}],
    notes:"Revisar que la cadena no haga ruido.",
    total:160
  },
  {
    id:"ORD-0002", date:"02/09/2026", status:"done",
    client:{name:"Mariana Torres",phone:"312 555 2201",email:"mariana@email.com"},
    bikes:[
      {brand:"Giant",model:"Escape 3",color:"Azul",type:"Urbana",serial:"GNT-E3-020"},
      {brand:"Specialized",model:"Rockhopper",color:"Rojo",type:"Montaña",serial:"SP-RH-021"}
    ],
    services:[{name:"Revisión general",price:150},{name:"Reparación de ponchadura",price:80},{name:"Lavado básico",price:100}],
    notes:"Entregada sin observaciones.",
    total:330
  }
];

let customServices = [];
let bikeCounter = 0;

const money = n => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(n);
const todayStr = () => new Date().toLocaleDateString("es-MX");
function nextId(){
  const nums = orders.map(o => parseInt(String(o.id).replace(/\D/g,""),10) || 0);
  return "ORD-" + String(Math.max(0,...nums)+1).padStart(4,"0");
}
function saveStorage(){ localStorage.setItem("bikeOrders", JSON.stringify(orders)); }

function showNotice(text, good=false){
  const el=document.getElementById("notice");
  el.textContent=text;
  el.style.borderColor=good ? "#bfe0c9" : "#d7dce0";
  el.style.background=good ? "#f2fbf5" : "#fff";
  el.style.color=good ? "#28663f" : "#202326";
  el.classList.add("show");
  clearTimeout(window.noticeTimer);
  window.noticeTimer=setTimeout(()=>el.classList.remove("show"),2600);
}

function renderServices(){
  const root=document.getElementById("services");
  root.innerHTML="";
  for(const [cat,items] of Object.entries(serviceCatalog)){
    const box=document.createElement("div"); box.className="service-category";
    box.innerHTML="<h3>"+cat+"</h3>";
    items.forEach(([name,price])=>{
      const row=document.createElement("label"); row.className="service";
      row.innerHTML=`<input type="checkbox" data-service="${escapeHtml(name)}" data-price="${price}">
        <span class="service-name">${escapeHtml(name)}</span><span class="service-price">${money(price)}</span>`;
      box.appendChild(row);
    });
    root.appendChild(box);
  }
  customServices.forEach((s,i)=>{
    const box=document.createElement("div"); box.className="service-category";
    box.innerHTML="<h3>Personalizados</h3>";
    const row=document.createElement("div"); row.className="service";
    row.innerHTML=`<input type="checkbox" data-custom="${i}">
      <span class="service-name">${escapeHtml(s.name)} <button class="btn danger" style="padding:3px 6px;font-size:10px;margin-left:5px" onclick="removeCustom(${i})">Eliminar</button></span>
      <span class="service-price">${money(s.price)}</span>`;
    box.appendChild(row); root.appendChild(box);
  });
  root.querySelectorAll("input[type=checkbox]").forEach(cb=>cb.addEventListener("change",renderSummary));
}
function removeCustom(i){ customServices.splice(i,1); renderServices(); renderSummary(); }

function renderSummary(){
  const list=document.getElementById("selectedList");
  const selected=[...document.querySelectorAll("#services input[type=checkbox]:checked")].map(cb=>{
    if(cb.dataset.custom!==undefined) return customServices[Number(cb.dataset.custom)];
    return {name:cb.dataset.service,price:Number(cb.dataset.price)};
  });
  list.innerHTML=selected.length ? selected.map(s=>`<div class="summary-line"><span>${escapeHtml(s.name)}</span><strong>${money(s.price)}</strong></div>`).join("") : '<div class="empty">No hay servicios seleccionados.</div>';
  document.getElementById("total").textContent=money(selected.reduce((a,s)=>a+s.price,0));
}

function addBike(data={}){
  bikeCounter++;
  const id=bikeCounter;
  const box=document.createElement("div"); box.className="bike-card"; box.dataset.bikeId=id;
  box.innerHTML=`<div class="right"><button class="btn danger remove-bike" type="button">Quitar</button></div>
    <div class="fields three">
      <div><label>Marca</label><input class="bike-brand" value="${escapeAttr(data.brand||"")}" placeholder="Ej. Trek"></div>
      <div><label>Modelo</label><input class="bike-model" value="${escapeAttr(data.model||"")}" placeholder="Ej. Marlin 5"></div>
      <div><label>Color</label><input class="bike-color" value="${escapeAttr(data.color||"")}" placeholder="Ej. Negro"></div>
      <div><label>Tipo</label><input class="bike-type" value="${escapeAttr(data.type||"")}" placeholder="Ej. Montaña"></div>
      <div><label>Número de serie</label><input class="bike-serial" value="${escapeAttr(data.serial||"")}" placeholder="Ej. ABC123456"></div>
    </div>`;
  box.querySelector(".remove-bike").addEventListener("click",()=>{box.remove();});
  document.getElementById("bikes").appendChild(box);
}
function getBikes(){
  return [...document.querySelectorAll(".bike-card")].map(box=>({
    brand:box.querySelector(".bike-brand").value.trim(),
    model:box.querySelector(".bike-model").value.trim(),
    color:box.querySelector(".bike-color").value.trim(),
    type:box.querySelector(".bike-type").value.trim(),
    serial:box.querySelector(".bike-serial").value.trim()
  })).filter(b=>Object.values(b).some(Boolean));
}
function getSelectedServices(){
  return [...document.querySelectorAll("#services input[type=checkbox]:checked")].map(cb=>{
    if(cb.dataset.custom!==undefined) return customServices[Number(cb.dataset.custom)];
    return {name:cb.dataset.service,price:Number(cb.dataset.price)};
  });
}

function clearForm(){
  document.getElementById("clientName").value="";
  document.getElementById("clientPhone").value="";
  document.getElementById("clientEmail").value="";
  document.getElementById("notes").value="";
  document.querySelectorAll("#services input[type=checkbox]").forEach(cb=>cb.checked=false);
  document.getElementById("bikes").innerHTML="";
  bikeCounter=0;
  customServices=[];
  renderServices(); renderSummary();
  document.getElementById("newOrderId").textContent=nextId();
}

function collectForm(){
  return {
    id:nextId(), date:todayStr(), status:"open",
    client:{
      name:document.getElementById("clientName").value.trim(),
      phone:document.getElementById("clientPhone").value.trim(),
      email:document.getElementById("clientEmail").value.trim()
    },
    bikes:getBikes(), services:getSelectedServices(),
    notes:document.getElementById("notes").value.trim(),
    total:getSelectedServices().reduce((a,s)=>a+s.price,0)
  };
}
function validateOrder(o){
  if(!o.client.name) return "Captura el nombre del cliente.";
  if(!o.client.phone) return "Captura el teléfono del cliente.";
  if(!o.bikes.length) return "Agrega al menos una bicicleta.";
  if(!o.services.length) return "Selecciona al menos un servicio.";
  return "";
}
function saveOrder(){
  const order=collectForm(), error=validateOrder(order);
  if(error){showNotice(error);return;}
  orders.unshift(order); saveStorage(); renderHistory();
  clearForm(); showNotice("Orden "+order.id+" guardada correctamente.",true);
  switchTab("history");
}

function renderHistory(){
  const q=document.getElementById("search").value.trim().toLowerCase();
  const status=document.getElementById("statusFilter").value;
  const list=orders.filter(o=>{
    const hay=[o.id,o.client.name,o.client.phone,o.client.email,...o.bikes.flatMap(b=>Object.values(b))].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (status==="all" || o.status===status);
  });
  const root=document.getElementById("orders");
  if(!list.length){root.innerHTML='<div class="empty">No se encontraron órdenes.</div>';return;}
  root.innerHTML=list.map(o=>{
    const bikes=o.bikes.map(b=>[b.brand,b.model,b.color,b.type,b.serial].filter(Boolean).join(" · ")).join(" | ");
    const sv=o.services.map(s=>`${escapeHtml(s.name)} (${money(s.price)})`).join(", ");
    return `<article class="order">
      <div class="order-top">
        <div><div class="order-title">${escapeHtml(o.id)} · ${escapeHtml(o.client.name)}</div>
          <div class="order-meta"><span>${escapeHtml(o.date)}</span><span>${escapeHtml(o.client.phone)}</span><span>${escapeHtml(o.client.email||"Sin correo")}</span></div>
        </div>
        <span class="status ${o.status==="done"?"done":"open"}">${o.status==="done"?"Completada":"Pendiente"}</span>
      </div>
      <div class="order-services"><strong>Bicicleta${o.bikes.length>1?"s":""}:</strong> ${escapeHtml(bikes)}</div>
      <div class="order-services"><strong>Servicios:</strong> ${sv}</div>
      ${o.notes?`<div class="order-services"><strong>Observaciones:</strong> ${escapeHtml(o.notes)}</div>`:""}
      <div class="order-services" style="margin-top:5px"><strong>Total:</strong> ${money(o.total)}</div>
      <div class="order-buttons no-print">
        ${o.status==="open"?`<button class="btn success" onclick="completeOrder('${o.id}')">Marcar completada</button>`:""}
        <button class="btn" onclick="printOrder('${o.id}')">Descargar / imprimir PDF</button>
        <button class="btn" onclick="shareOrder('${o.id}')">Compartir</button>
        <button class="btn danger" onclick="deleteOrder('${o.id}')">Eliminar</button>
      </div>
    </article>`;
  }).join("");
}
function completeOrder(id){
  const o=orders.find(x=>x.id===id); if(!o)return;
  o.status="done"; saveStorage(); renderHistory(); showNotice(id+" marcada como completada.",true);
}
function deleteOrder(id){
  if(!confirm("¿Eliminar la orden "+id+"?")) return;
  orders=orders.filter(x=>x.id!==id); saveStorage(); renderHistory(); showNotice("Orden eliminada.");
}

function printOrder(id){
  const o=orders.find(x=>x.id===id); if(!o)return;
  const bikes=o.bikes.map((b,i)=>`<div style="margin:8px 0;padding:8px;border:1px solid #ddd;border-radius:6px"><strong>Bicicleta ${i+1}</strong><br>${escapeHtml([b.brand,b.model].filter(Boolean).join(" "))}<br><small>${escapeHtml([b.type,b.color,b.serial].filter(Boolean).join(" · "))}</small></div>`).join("");
  const services=o.services.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td style="text-align:right">${money(s.price)}</td></tr>`).join("");
  const print = `
  <div style="font-family:Arial,sans-serif;max-width:760px;margin:0 auto;color:#222">
    <h1 style="margin-bottom:4px">Orden de servicio ${escapeHtml(o.id)}</h1>
    <div style="color:#666;margin-bottom:18px">Fecha de recepción: ${escapeHtml(o.date)}</div>
    <h3>Cliente</h3>
    <p><strong>${escapeHtml(o.client.name)}</strong><br>Tel: ${escapeHtml(o.client.phone)}<br>${escapeHtml(o.client.email||"Sin correo")}</p>
    <h3>Bicicletas</h3>${bikes}
    <h3>Servicios</h3>
    <table style="width:100%;border-collapse:collapse">${services}</table>
    <div style="margin-top:15px;text-align:right;font-size:18px"><strong>Total: ${money(o.total)}</strong></div>
    <h3>Observaciones</h3><p>${escapeHtml(o.notes||"Sin observaciones.")}</p>
    <hr><p style="font-size:11px;color:#777">Estado: ${o.status==="done"?"Completada":"Pendiente"}</p>
  </div>`;
  const area=document.getElementById("printArea");
  area.innerHTML=print; area.classList.remove("hidden");
  const old=document.title; document.title=o.id;
  window.print();
  document.title=old; area.classList.add("hidden");
}

async function shareOrder(id){
  const o=orders.find(x=>x.id===id); if(!o)return;
  const text=`Orden ${o.id}\\nCliente: ${o.client.name}\\nBicicletas: ${o.bikes.length}\\nServicios: ${o.services.map(s=>s.name).join(", ")}\\nTotal: ${money(o.total)}\\nEstado: ${o.status==="done"?"Completada":"Pendiente"}`;
  if(navigator.share){
    try{await navigator.share({title:"Orden "+o.id,text});}catch(e){}
  }else{
    await navigator.clipboard?.writeText(text);
    showNotice("El resumen se copió al portapapeles.");
  }
}
function switchTab(name){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===name));
  if(name==="history") renderHistory();
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function escapeAttr(v){return escapeHtml(v);}

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
document.getElementById("addBikeBtn").addEventListener("click",()=>addBike());
document.getElementById("addCustomServiceBtn").addEventListener("click",()=>{
  const name=document.getElementById("customServiceName").value.trim();
  const price=Number(document.getElementById("customServicePrice").value);
  if(!name){showNotice("Escribe el nombre del servicio.");return;}
  if(!Number.isFinite(price)||price<0){showNotice("Captura un precio válido.");return;}
  customServices.push({name,price});
  document.getElementById("customServiceName").value="";
  document.getElementById("customServicePrice").value="";
  renderServices(); renderSummary();
});
document.getElementById("saveBtn").addEventListener("click",saveOrder);
document.getElementById("clearBtn").addEventListener("click",()=>{if(confirm("¿Limpiar la orden actual?"))clearForm();});
document.getElementById("search").addEventListener("input",renderHistory);
document.getElementById("statusFilter").addEventListener("change",renderHistory);

document.getElementById("today").textContent=todayStr();
renderServices(); renderSummary(); renderHistory(); addBike(); document.getElementById("newOrderId").textContent=nextId();
