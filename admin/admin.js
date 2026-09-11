const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={analysis:null,editing:false,history:JSON.parse(localStorage.getItem('ts-admin-history')||'[]')};

const demo={
  client:{name:'Andres',document:'••••••78',age:'43 años',reportDate:'11/09/2026',entities:'BCP, Claro, Entel'},
  score:543,risk:'REGULAR',confidence:92,debtChange:-48.23,
  summary:'Perfil con comportamiento bancario estable y pagos financieros al día, pero con deuda comercial activa que sigue generando señal de alerta. La prioridad es cancelar esas obligaciones, solicitar constancias de no adeudo y verificar la actualización antes de buscar nuevos productos.',
  tags:['Banco: estable','Deuda comercial activa','Sin atraso bancario'],
  alerts:[
    {level:'red',title:'Deuda comercial impaga',text:'Se detectan obligaciones pendientes fuera del sistema financiero por S/ 184.96.'},
    {level:'yellow',title:'Solicitudes nuevas',text:'Conviene evitar nuevas solicitudes hasta verificar la limpieza de las obligaciones reportadas.'},
    {level:'green',title:'Crédito bancario al día',text:'El crédito bancario detectado mantiene comportamiento normal sin días de atraso.'}
  ],
  metrics:[
    {value:'100%',label:'Meses en normal'},
    {value:'0',label:'Máx. días de atraso'},
    {value:'S/ 184.96',label:'Otras deudas impagas',danger:true},
    {value:'S/ 311',label:'Crédito bancario'},
    {value:'1',label:'Entidad financiera'},
    {value:'2',label:'Alertas activas',danger:true}
  ],
  debtSeries:[
    {label:'2024',value:610},{label:'Ene 25',value:610},{label:'Mar 25',value:435},{label:'Jun 25',value:690},{label:'Ago 25',value:350},{label:'Nov 25',value:600},{label:'2026',value:311}
  ],
  recommendations:[
    {title:'Regulariza primero las deudas comerciales',text:'Cancela las obligaciones pendientes identificadas y solicita una constancia o carta de no adeudo por cada una. Verifica después que la central de riesgo refleje la actualización.',impact:'ALTO IMPACTO'},
    {title:'Conserva el buen comportamiento bancario',text:'Mantén el crédito vigente al día y evita atrasos mientras se actualizan las obligaciones comerciales. No aumentes deuda innecesariamente.',impact:'ALTO IMPACTO'},
    {title:'Evalúa un nuevo producto recién después',text:'Cuando la limpieza esté confirmada, evalúa un producto sencillo y de bajo riesgo. No solicites varias líneas a la vez.',impact:'IMPACTO MEDIO'},
    {title:'Evita decisiones por una promesa de score',text:'Ninguna acción garantiza una aprobación o un aumento exacto del score. Prioriza evidencia actualizada y capacidad real de pago.',impact:'CONTROL DE RIESGO'}
  ],
  checklist:['Deuda comercial pagada','Carta de no adeudo obtenida','Actualización en central de riesgo verificada','Nuevo reporte revisado'],
  raw:{'Nombre':'Andres','Documento':'••••••78','Edad':'43 años','Fecha del reporte':'11/09/2026','Entidades':'BCP · Claro · Entel','Crédito bancario':'S/ 311','Deuda comercial':'S/ 184.96','Máx. días de atraso':'0'}
};

async function bootstrap(){
  try{
    const r=await fetch('/api/admin-session',{credentials:'include'});
    const data=await r.json().catch(()=>({}));
    if(r.status===503&&data.error==='config_missing'){show('#configGate');return}
    if(!r.ok||!data.authenticated){show('#loginGate');return}
    showApp();
  }catch{ show('#configGate') }
}
function show(sel){['#configGate','#loginGate','#app'].forEach(x=>$(x)?.classList.add('hidden'));$(sel)?.classList.remove('hidden')}
function showApp(){show('#app');renderHistory();checkAIStatus()}
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function formatDate(){return new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short'}).format(new Date())}

$('#loginForm')?.addEventListener('submit',async e=>{
  e.preventDefault(); $('#loginError').textContent='';
  const password=$('#passwordInput').value;
  const r=await fetch('/api/admin-login',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({password})});
  const data=await r.json().catch(()=>({}));
  if(r.ok){showApp()} else $('#loginError').textContent=data.error==='invalid_credentials'?'Contraseña incorrecta.':'No se pudo iniciar sesión.';
});
$('#logoutBtn')?.addEventListener('click',async()=>{await fetch('/api/admin-logout',{method:'POST',credentials:'include'});location.reload()});
$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
function switchView(v){
  $$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v));
  $$('.view').forEach(x=>x.classList.add('hidden'));
  $('#'+v+'View')?.classList.remove('hidden');
  if(v==='history')renderHistory();
}
$('#newAnalysisBtn')?.addEventListener('click',resetAnalysis);
$('#newReportBtn')?.addEventListener('click',resetAnalysis);
$('#historyNewBtn')?.addEventListener('click',()=>{switchView('analysis');resetAnalysis()});
function resetAnalysis(){
  switchView('analysis');state.analysis=null;$('#resultPanel').classList.add('hidden');$('#uploadPanel').classList.remove('hidden');$('#pdfInput').value='';$('#uploadState').classList.add('hidden');window.scrollTo({top:0,behavior:'smooth'})
}
$('#demoBtn')?.addEventListener('click',()=>{loadAnalysis(structuredClone(demo),true)});
$('#pdfInput')?.addEventListener('change',e=>e.target.files[0]&&processPdf(e.target.files[0]));
const dz=$('#dropZone');
['dragenter','dragover'].forEach(ev=>dz?.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));
['dragleave','drop'].forEach(ev=>dz?.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));
dz?.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f?.type==='application/pdf')processPdf(f)});

async function processPdf(file){
  $('#uploadState').classList.remove('hidden');$('#uploadTitle').textContent='Leyendo '+file.name;$('#uploadDetail').textContent='Extrayendo texto del PDF…';
  try{
    const text=await extractPdfText(file);
    $('#uploadDetail').textContent='Analizando datos, riesgos y recomendaciones con IA…';
    const r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({filename:file.name,text})});
    const data=await r.json();
    if(!r.ok)throw new Error(data.message||data.error||'No se pudo analizar');
    loadAnalysis(data.analysis,false,file.name);
  }catch(err){
    $('#uploadTitle').textContent='No se pudo completar el análisis';
    $('#uploadDetail').textContent=err.message+' · Puedes usar “Ver demo visual” para revisar la interfaz.';
  }
}
async function extractPdfText(file){
  const pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  const bytes=new Uint8Array(await file.arrayBuffer()),pdf=await pdfjs.getDocument({data:bytes}).promise;
  const pages=[];for(let i=1;i<=Math.min(pdf.numPages,40);i++){const p=await pdf.getPage(i),c=await p.getTextContent();pages.push(c.items.map(x=>x.str).join(' '))}
  return pages.join('\n\n').slice(0,180000);
}

function loadAnalysis(a,isDemo=false,filename=''){
  state.analysis=a;
  $('#uploadPanel').classList.add('hidden');$('#resultPanel').classList.remove('hidden');
  $('#clientName').textContent=a.client?.name||'Persona';$('#initials').textContent=(a.client?.name||'TS').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  $('#analysisMeta').textContent=(isDemo?'Demo visual':'Reporte procesado')+' · '+formatDate();
  $('#confidenceValue').textContent=(a.confidence>=85?'Alta':a.confidence>=65?'Media':'Revisión manual')+' · '+(a.confidence||0)+'%';
  $('#confidenceNote').textContent=a.confidence>=85?'Datos suficientes para interpretar el reporte.':'Conviene verificar algunos datos antes de usar las conclusiones.';
  $('#scoreValue').textContent=a.score??'—';$('#scoreText').textContent=a.score??'—';$('#scoreGauge').style.setProperty('--score',Math.max(1,Math.min(100,(a.score||0)/9.99)));
  $('#riskBadge').textContent=a.risk||'POR REVISAR';$('#scoreDescription').textContent=a.scoreDescription||scoreDescription(a.score);
  const d=Number(a.debtChange||0);$('#debtDelta').textContent=(d<=0?'↓ La deuda bajó ':'↑ La deuda subió ')+Math.abs(d).toFixed(2)+'%';$('#debtDelta').classList.toggle('positive',d<=0);
  $('#executiveSummary').textContent=a.summary||'';$('#summaryTags').innerHTML=(a.tags||[]).map(x=>'<span>'+escapeHtml(x)+'</span>').join('');
  $('#alertsGrid').innerHTML=(a.alerts||[]).map(x=>'<div class="alert '+escapeHtml(x.level)+'"><div class="alert-top"><i class="alert-dot"></i><b>'+escapeHtml(x.title)+'</b></div><p>'+escapeHtml(x.text)+'</p></div>').join('');
  renderData(a.raw||{});renderMetrics(a.metrics||[]);renderChart(a.debtSeries||[]);renderRecommendations(a.recommendations||[]);renderChecklist(a.checklist||demo.checklist);
  $('#advisorNotes').value=a.notes||'';
  if(!isDemo)saveToHistory(filename);
  setTimeout(()=>$('#resultPanel').scrollIntoView({behavior:'smooth',block:'start'}),80);
}
function scoreDescription(s){if(s>=800)return'Perfil sólido según los datos observados.';if(s>=650)return'Perfil favorable, con algunos puntos por optimizar.';if(s>=500)return'Hay señales de alerta que conviene resolver antes de solicitar nuevo financiamiento.';return'Perfil de riesgo elevado; prioriza regularización y estabilidad antes de asumir nueva deuda.'}
function renderData(data){
  $('#detectedData').innerHTML=Object.entries(data).map(([k,v])=>'<div class="data-item" data-key="'+escapeHtml(k)+'"><span>'+escapeHtml(k)+'</span><b>'+escapeHtml(v)+'</b></div>').join('');
}
$('#editDataBtn')?.addEventListener('click',()=>{
  if(!state.analysis)return;state.editing=!state.editing;$('#editDataBtn').textContent=state.editing?'Guardar':'Editar';
  $$('#detectedData .data-item').forEach(el=>{const b=el.querySelector('b'),key=el.dataset.key;if(state.editing){b.outerHTML='<input value="'+escapeHtml(state.analysis.raw[key])+'">'}else{const i=el.querySelector('input');state.analysis.raw[key]=i.value;i.outerHTML='<b>'+escapeHtml(i.value)+' *</b>'}});
});
function renderMetrics(items){$('#metricsGrid').innerHTML=items.map(m=>'<div class="metric '+(m.danger?'danger':'')+'"><b>'+escapeHtml(m.value)+'</b><span>'+escapeHtml(m.label)+'</span></div>').join('')}
function renderChart(series){
  const svg=$('#debtChart');if(!series.length){svg.innerHTML='';return}const w=900,h=280,p=34,max=Math.max(...series.map(x=>+x.value),1),min=Math.min(...series.map(x=>+x.value),0),span=Math.max(max-min,1);
  const pts=series.map((x,i)=>({x:p+i*((w-p*2)/(series.length-1||1)),y:h-p-((+x.value-min)/span)*(h-p*2),...x}));
  let g='';for(let i=0;i<5;i++){const y=p+i*((h-p*2)/4);g+='<line class="chart-grid" x1="'+p+'" x2="'+(w-p)+'" y1="'+y+'" y2="'+y+'"/>'}
  const line=pts.map((q,i)=>(i?'L':'M')+q.x+' '+q.y).join(' '),area=line+' L '+pts.at(-1).x+' '+(h-p)+' L '+pts[0].x+' '+(h-p)+' Z';
  svg.innerHTML=g+'<path class="chart-area" d="'+area+'"/><path class="chart-line" d="'+line+'"/>'+pts.map(q=>'<circle class="chart-point" cx="'+q.x+'" cy="'+q.y+'" r="6"/><text class="chart-label" x="'+q.x+'" y="'+(h-5)+'" text-anchor="middle">'+escapeHtml(q.label)+'</text>').join('');
  $('#chartLegend').innerHTML=series.map(x=>'<span>'+escapeHtml(x.label)+': S/ '+Number(x.value).toLocaleString('es-PE')+'</span>').join('');
}
function renderRecommendations(items){$('#recommendations').innerHTML=items.map((r,i)=>'<div class="rec"><div class="rec-num">'+(i+1)+'</div><div><h4>'+escapeHtml(r.title)+'</h4><p>'+escapeHtml(r.text)+'</p></div><span class="impact">'+escapeHtml(r.impact||'PRIORIDAD')+'</span></div>').join('')}
function renderChecklist(items){
  $('#checklist').innerHTML=items.map((t,i)=>'<label class="check"><input type="checkbox" data-i="'+i+'"><span>'+escapeHtml(t)+'</span></label>').join('');
  $$('#checklist input').forEach(x=>x.addEventListener('change',()=>{x.closest('.check').classList.toggle('done',x.checked);updateCheckProgress()}));updateCheckProgress()
}
function updateCheckProgress(){const all=$$('#checklist input'),done=all.filter(x=>x.checked).length;$('#checkProgress').textContent=done+' / '+all.length}
$('#copyActionsBtn')?.addEventListener('click',async()=>{if(!state.analysis)return;const t=(state.analysis.recommendations||[]).map((r,i)=>(i+1)+'. '+r.title+'\n'+r.text).join('\n\n');await navigator.clipboard.writeText(t);$('#copyActionsBtn').textContent='✓ ¡Copiado!';setTimeout(()=>$('#copyActionsBtn').textContent='Copiar recomendaciones',1600)});
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{await navigator.clipboard.writeText($(b.dataset.copy)?.innerText||'');b.textContent='✓ Copiado';setTimeout(()=>b.textContent='Copiar',1200)}));
$('#printBtn')?.addEventListener('click',()=>window.print());
$('#saveNotesBtn')?.addEventListener('click',saveNotes);let noteTimer;
$('#advisorNotes')?.addEventListener('input',()=>{clearTimeout(noteTimer);$('#notesStatus').textContent='Guardando…';noteTimer=setTimeout(saveNotes,700)});
function saveNotes(){if(state.analysis)state.analysis.notes=$('#advisorNotes').value;$('#notesStatus').textContent='Guardado automático'}
function saveToHistory(filename){
  const item={id:crypto.randomUUID(),name:state.analysis.client?.name||filename||'Persona',score:state.analysis.score,risk:state.analysis.risk,date:new Date().toISOString(),summary:state.analysis.summary,analysis:state.analysis};
  state.history.unshift(item);state.history=state.history.slice(0,30);localStorage.setItem('ts-admin-history',JSON.stringify(state.history));renderHistory()
}
function renderHistory(){
  const box=$('#historyList');if(!box)return;if(!state.history.length){box.innerHTML='<div class="empty">Aún no hay análisis guardados en este navegador.</div>';return}
  box.innerHTML=state.history.map(x=>'<div class="history-item"><div><b>'+escapeHtml(x.name)+'</b><small>'+new Date(x.date).toLocaleString('es-PE')+'</small></div><div><small>Score</small><span class="score-mini">'+escapeHtml(x.score)+'</span></div><div><small>Estado</small><b>'+escapeHtml(x.risk)+'</b></div><div><small>Resumen</small><small>'+escapeHtml((x.summary||'').slice(0,70))+'…</small></div><button class="mini-btn open-history" data-id="'+x.id+'">Abrir</button></div>').join('');
  $$('.open-history').forEach(b=>b.addEventListener('click',()=>{const x=state.history.find(h=>h.id===b.dataset.id);if(x){switchView('analysis');loadAnalysis(x.analysis,true)}}))
}
async function checkAIStatus(){try{const r=await fetch('/api/analyze',{method:'GET',credentials:'include'}),d=await r.json();$('#aiStatus').textContent=d.configured?'Conectada':'Falta OPENAI_API_KEY';$('#aiStatus').className=d.configured?'ok':''}catch{$('#aiStatus').textContent='No disponible'}}

bootstrap();