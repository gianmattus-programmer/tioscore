const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={analysis:null,editing:false,clientMode:false,history:JSON.parse(localStorage.getItem('ts-admin-history')||'[]')};

const demo={
 sourceReport:{provider:'Sentinel',type:'Reporte crediticio integral',reportDate:'11/09/2026',periodCovered:'2023–2026',sectionsDetected:9,sectionsExpected:10},
 client:{name:'Andres',document:'••••••78',age:'43 años',reportDate:'11/09/2026',entities:'BCP · Claro · Entel'},
 score:543,risk:'REGULAR',confidence:92,debtChange:-48.23,
 scoreDescription:'Comportamiento bancario estable, con una señal pendiente fuera del sistema financiero que debe regularizarse.',
 summary:'El reporte muestra un crédito bancario vigente con comportamiento normal y sin días de atraso. La principal observación es una deuda comercial pendiente por S/ 184.96. Antes de buscar nuevo financiamiento conviene regularizar esa obligación, obtener constancia de no adeudo y verificar que la actualización aparezca en el siguiente reporte.',
 tags:['Crédito bancario normal','0 días de atraso','Deuda comercial activa'],
 alerts:[
  {level:'red',title:'Deuda comercial pendiente',text:'Se detectan obligaciones comerciales por S/ 184.96.'},
  {level:'yellow',title:'Verificar actualización',text:'Después del pago debe confirmarse la actualización en el siguiente reporte.'},
  {level:'green',title:'Crédito bancario al día',text:'El crédito financiero observado registra comportamiento normal.'}
 ],
 metrics:[
  {value:'100%',label:'Meses en normal'},{value:'0',label:'Máx. días de atraso'},
  {value:'S/ 184.96',label:'Deuda comercial',danger:true},{value:'S/ 311',label:'Saldo bancario'},
  {value:'1',label:'Entidad financiera'},{value:'3',label:'Entidades detectadas'}
 ],
 debtSeries:[{label:'2024',value:610},{label:'Ene 25',value:610},{label:'Mar 25',value:435},{label:'Jun 25',value:690},{label:'Ago 25',value:350},{label:'Nov 25',value:600},{label:'2026',value:311}],
 debtComposition:[{label:'Crédito bancario',value:311},{label:'Deuda comercial',value:184.96}],
 monthlyBehavior:[
  {period:'Ene 26',status:'NORMAL',daysPastDue:0,balance:311},{period:'Feb 26',status:'NORMAL',daysPastDue:0,balance:311},
  {period:'Mar 26',status:'NORMAL',daysPastDue:0,balance:311},{period:'Abr 26',status:'NORMAL',daysPastDue:0,balance:311},
  {period:'May 26',status:'NORMAL',daysPastDue:0,balance:311},{period:'Jun 26',status:'NORMAL',daysPastDue:0,balance:311}
 ],
 entities:[
  {name:'BCP',type:'Financiera',balance:'S/ 311',status:'Normal',daysPastDue:'0 días',classification:'Normal',product:'Crédito'},
  {name:'Claro',type:'Comercial',balance:'S/ 129.82',status:'Pendiente',daysPastDue:'No informado',classification:'Comercial',product:'Servicio'},
  {name:'Entel',type:'Comercial',balance:'S/ 55.14',status:'Pendiente',daysPastDue:'No informado',classification:'Comercial',product:'Servicio'}
 ],
 obligations:[
  {entity:'BCP',product:'Crédito bancario',balance:'S/ 311',status:'Al día',detail:'Clasificación normal · 0 días de atraso'},
  {entity:'Claro',product:'Servicio',balance:'S/ 129.82',status:'Pendiente',detail:'Deuda comercial reportada'},
  {entity:'Entel',product:'Servicio',balance:'S/ 55.14',status:'Pendiente',detail:'Deuda comercial reportada'}
 ],
 inquiries:[{date:'No informado',entity:'No informado',type:'El reporte de muestra no detalla consultas recientes'}],
 recommendations:[
  {title:'Regularizar las obligaciones comerciales',text:'Cancelar las obligaciones pendientes identificadas y solicitar una constancia o carta de no adeudo por cada una.',impact:'Prioridad 1'},
  {title:'Verificar la actualización',text:'Revisar un nuevo reporte después del plazo de actualización para confirmar que las obligaciones ya no aparezcan pendientes.',impact:'Prioridad 2'},
  {title:'Mantener el crédito vigente sin atrasos',text:'Conservar el comportamiento normal del crédito bancario y evitar nuevas obligaciones innecesarias durante el proceso.',impact:'Prioridad 3'}
 ],
 closing:{headline:'Conclusión de la lectura',text:'El punto crítico no está en el crédito bancario actual, sino en la deuda comercial pendiente. La lectura debe repetirse cuando esa información haya sido regularizada y actualizada.'},
 checklist:['Deuda comercial pagada','Constancias de no adeudo obtenidas','Actualización verificada en un nuevo reporte','Nueva lectura realizada'],
 raw:{'Nombre':'Andres','Documento':'••••••78','Edad':'43 años','Fecha del reporte':'11/09/2026','Tipo de reporte':'Sentinel integral','Entidades':'BCP · Claro · Entel','Crédito bancario':'S/ 311','Deuda comercial':'S/ 184.96','Máx. días de atraso':'0','Clasificación observada':'Normal'},
 reportSections:[
  {title:'Datos generales',items:[{label:'Titular',value:'Andres'},{label:'Edad',value:'43 años'},{label:'Fecha',value:'11/09/2026'}]},
  {title:'Sistema financiero',items:[{label:'Entidad',value:'BCP'},{label:'Saldo',value:'S/ 311'},{label:'Clasificación',value:'Normal'}]},
  {title:'Deuda comercial',items:[{label:'Total',value:'S/ 184.96'},{label:'Entidades',value:'Claro · Entel'}]}
 ]
};

async function bootstrap(){
 try{
  const r=await fetch('/api/admin-session',{credentials:'include'}),data=await r.json().catch(()=>({}));
  if(r.status===503&&data.error==='config_missing'){show('#configGate');return}
  if(!r.ok||!data.authenticated){show('#loginGate');return}
  showApp();
 }catch{show('#configGate')}
}
function show(sel){['#configGate','#loginGate','#app'].forEach(x=>$(x)?.classList.add('hidden'));$(sel)?.classList.remove('hidden')}
function showApp(){show('#app');renderHistory();checkAIStatus()}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function dateNow(){return new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short'}).format(new Date())}
function money(n){const v=Number(n);return Number.isFinite(v)?'S/ '+v.toLocaleString('es-PE',{minimumFractionDigits:v%1?2:0,maximumFractionDigits:2}):String(n??'—')}

$('#loginForm')?.addEventListener('submit',async e=>{
 e.preventDefault();$('#loginError').textContent='';
 const r=await fetch('/api/admin-login',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({password:$('#passwordInput').value})});
 const d=await r.json().catch(()=>({}));if(r.ok)showApp();else $('#loginError').textContent=d.error==='invalid_credentials'?'Contraseña incorrecta.':'No se pudo iniciar sesión.';
});
$('#logoutBtn')?.addEventListener('click',async()=>{await fetch('/api/admin-logout',{method:'POST',credentials:'include'});location.reload()});
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
function switchView(v){$$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$$('.view').forEach(x=>x.classList.add('hidden'));$('#'+v+'View')?.classList.remove('hidden');if(v==='history')renderHistory()}
$('#newAnalysisBtn')?.addEventListener('click',resetAnalysis);$('#historyNewBtn')?.addEventListener('click',()=>{switchView('analysis');resetAnalysis()});
function resetAnalysis(){setClientMode(false);switchView('analysis');state.analysis=null;$('#resultPanel').classList.add('hidden');$('#uploadPanel').classList.remove('hidden');$('#pdfInput').value='';$('#uploadState').classList.add('hidden')}
$('#demoBtn')?.addEventListener('click',()=>loadAnalysis(structuredClone(demo),true));

$('#clientModeBtn')?.addEventListener('click',()=>setClientMode(!state.clientMode));
function setClientMode(on){state.clientMode=on;document.body.classList.toggle('client-mode',on);$('#clientModeBtn').textContent=on?'Salir de vista cliente':'Vista cliente'}

$('#pdfInput')?.addEventListener('change',e=>e.target.files[0]&&processPdf(e.target.files[0]));
const dz=$('#dropZone');
['dragenter','dragover'].forEach(ev=>dz?.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));
['dragleave','drop'].forEach(ev=>dz?.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));
dz?.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f?.type==='application/pdf')processPdf(f)});

async function processPdf(file){
 $('#uploadState').classList.remove('hidden');
 $('#uploadTitle').textContent='Leyendo '+file.name;
 $('#uploadDetail').textContent='Revisando texto digital y páginas escaneadas…';
 try{
  const extracted=await extractPdfHybrid(file);
  if(extracted.text.length<100)throw new Error('No se logró obtener suficiente contenido legible del reporte.');
  const mode=extracted.visualPages>0
    ? 'Lectura híbrida completada: '+extracted.digitalPages+' páginas digitales y '+extracted.visualPages+' páginas visuales.'
    : 'Lectura digital completada.';
  $('#uploadDetail').textContent=mode+' Interpretando créditos, morosidad, entidades y comportamiento…';
  const r=await fetch('/api/analyze',{
    method:'POST',
    headers:{'content-type':'application/json'},
    credentials:'include',
    body:JSON.stringify({
      filename:file.name,
      text:extracted.text,
      extractionMeta:{
        totalPages:extracted.totalPages,
        digitalPages:extracted.digitalPages,
        visualPages:extracted.visualPages,
        mode:extracted.visualPages>0?'hybrid':'digital'
      }
    })
  });
  const d=await r.json();
  if(!r.ok)throw new Error(d.message||d.error||'No se pudo analizar el reporte');
  if(!d.analysis.sourceReport)d.analysis.sourceReport={};
  d.analysis.sourceReport.extractionMode=extracted.visualPages>0?'Híbrida (texto + visión)':'Texto digital';
  d.analysis.sourceReport.totalPages=extracted.totalPages;
  d.analysis.sourceReport.visualPages=extracted.visualPages;
  loadAnalysis(d.analysis,false,file.name);
 }catch(err){
  $('#uploadTitle').textContent='No se pudo completar la lectura';
  $('#uploadDetail').textContent=err.message;
 }
}

async function extractPdfHybrid(file){
 const pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
 const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
 const totalPages=Math.min(pdf.numPages,60);
 const pages=[];
 let digitalPages=0,visualPages=0;

 for(let i=1;i<=totalPages;i++){
  $('#uploadDetail').textContent='Página '+i+' de '+totalPages+' · detectando método de lectura…';
  const page=await pdf.getPage(i);
  const content=await page.getTextContent();
  const digitalText=content.items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();

  if(isDigitalTextUseful(digitalText,content.items)){
    digitalPages++;
    pages.push('--- PÁGINA '+i+' · TEXTO DIGITAL ---\n'+digitalText);
    continue;
  }

  visualPages++;
  $('#uploadDetail').textContent='Página '+i+' de '+totalPages+' · lectura visual con IA…';
  const image=await renderPageForVision(page);
  const visualText=await readPageVisually(image,i,file.name);
  pages.push('--- PÁGINA '+i+' · LECTURA VISUAL ---\n'+visualText);
 }

 return {
  text:pages.join('\n\n').slice(0,300000),
  totalPages,
  digitalPages,
  visualPages
 };
}

function isDigitalTextUseful(text,items){
 if(text.length>=220)return true;
 if(text.length>=90&&items.length>=18)return true;
 const financialSignals=(text.match(/(?:S\/|soles|deuda|saldo|banco|entidad|normal|mora|cr[eé]dito|clasificaci[oó]n|sentinel)/gi)||[]).length;
 return text.length>=70&&financialSignals>=3;
}

async function renderPageForVision(page){
 const base=page.getViewport({scale:1});
 const targetWidth=base.width>0?Math.min(1350,Math.max(980,base.width*1.45)):1200;
 const scale=targetWidth/base.width;
 const viewport=page.getViewport({scale});
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d',{alpha:false});
 canvas.width=Math.ceil(viewport.width);
 canvas.height=Math.ceil(viewport.height);
 ctx.fillStyle='#ffffff';
 ctx.fillRect(0,0,canvas.width,canvas.height);
 await page.render({canvasContext:ctx,viewport}).promise;

 let quality=.76;
 let image=canvas.toDataURL('image/jpeg',quality);
 while(image.length>2_700_000&&quality>.42){
  quality-=.08;
  image=canvas.toDataURL('image/jpeg',quality);
 }
 if(image.length>3_100_000){
  const shrink=document.createElement('canvas');
  const ratio=Math.sqrt(2_500_000/image.length);
  shrink.width=Math.max(700,Math.floor(canvas.width*ratio));
  shrink.height=Math.max(900,Math.floor(canvas.height*ratio));
  const sctx=shrink.getContext('2d',{alpha:false});
  sctx.fillStyle='#fff';sctx.fillRect(0,0,shrink.width,shrink.height);
  sctx.drawImage(canvas,0,0,shrink.width,shrink.height);
  image=shrink.toDataURL('image/jpeg',.68);
 }
 return image;
}

async function readPageVisually(image,page,filename){
 const r=await fetch('/api/vision-page',{
  method:'POST',
  headers:{'content-type':'application/json'},
  credentials:'include',
  body:JSON.stringify({image,page,filename})
 });
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.message||('No se pudo leer visualmente la página '+page));
 return String(d.text||'').trim()||'[Página sin contenido legible]';
}

function loadAnalysis(a,isDemo=false,filename=''){
 state.analysis=normalize(a);const x=state.analysis;
 $('#uploadPanel').classList.add('hidden');$('#resultPanel').classList.remove('hidden');
 $('#reportTypeBadge').textContent=[x.sourceReport.provider||'Sentinel',x.sourceReport.type||'Reporte detectado'].filter(Boolean).join(' · ');
 $('#analysisMeta').textContent=(isDemo?'Demo':'Procesado')+' · '+dateNow();
 $('#confidenceValue').textContent='Confianza '+(x.confidence||0)+'%';
 $('#clientName').textContent=x.client.name||'Cliente';
 $('#initials').textContent=(x.client.name||'TS').split(/\s+/).filter(Boolean).map(v=>v[0]).slice(0,2).join('').toUpperCase();
 $('#clientSubline').textContent=[x.client.document||'Documento no informado',x.client.age,x.client.reportDate].filter(Boolean).join(' · ');
 $('#riskBadge').textContent=x.risk||'POR REVISAR';
 $('#scoreValue').textContent=x.score||'—';$('#scoreMeterFill').style.left=Math.max(0,Math.min(100,(x.score||0)/9.99))+'%';
 $('#scoreDescription').textContent=x.scoreDescription||'Sin interpretación suficiente.';
 const dc=Number(x.debtChange);$('#debtDelta').textContent=Number.isFinite(dc)&&dc!==0?(dc<0?'↓ Deuda -':'↑ Deuda +')+Math.abs(dc).toFixed(2)+'%':'Variación de deuda no determinada';
 $('#executiveSummary').textContent=x.summary||'No se generó resumen.';
 $('#summaryTags').innerHTML=x.tags.map(t=>'<span>'+esc(t)+'</span>').join('');
 $('#alertsGrid').innerHTML=x.alerts.map(v=>'<div class="alert '+esc(v.level)+'"><div class="alert-top"><i class="alert-dot"></i><b>'+esc(v.title)+'</b></div><p>'+esc(v.text)+'</p></div>').join('')||'<div class="empty-line">Sin alertas identificadas.</div>';
 renderRecommendations(x.recommendations);$('#closingHeadline').textContent=x.closing.headline||'Conclusión';$('#closingText').textContent=x.closing.text||'Sin cierre disponible.';
 renderChecklist(x.checklist);renderData(x.raw);renderEntities(x.entities);renderObligations(x.obligations);renderInquiries(x.inquiries);renderSections(x.reportSections);
 renderMetrics(x.metrics);renderChart(x.debtSeries);renderComposition(x.debtComposition);renderMonthly(x.monthlyBehavior);renderCoverage(x);
 $('#advisorNotes').value=x.notes||'';
 if(!isDemo)saveToHistory(filename);
}
function normalize(a){
 const x=a||{};x.sourceReport=x.sourceReport||{};x.client=x.client||{};x.alerts=Array.isArray(x.alerts)?x.alerts:[];x.tags=Array.isArray(x.tags)?x.tags:[];
 x.metrics=Array.isArray(x.metrics)?x.metrics:[];x.debtSeries=Array.isArray(x.debtSeries)?x.debtSeries:[];x.debtComposition=Array.isArray(x.debtComposition)?x.debtComposition:[];
 x.monthlyBehavior=Array.isArray(x.monthlyBehavior)?x.monthlyBehavior:[];x.entities=Array.isArray(x.entities)?x.entities:[];x.obligations=Array.isArray(x.obligations)?x.obligations:[];
 x.inquiries=Array.isArray(x.inquiries)?x.inquiries:[];x.recommendations=Array.isArray(x.recommendations)?x.recommendations:[];x.checklist=Array.isArray(x.checklist)?x.checklist:[];
 x.raw=x.raw&&typeof x.raw==='object'?x.raw:{};x.reportSections=Array.isArray(x.reportSections)?x.reportSections:[];x.closing=x.closing||{};return x
}
function renderRecommendations(items){$('#recommendations').innerHTML=items.map((r,i)=>'<div class="rec"><div class="rec-num">'+(i+1)+'</div><div><h4>'+esc(r.title)+'</h4><p>'+esc(r.text)+'</p><span class="impact">'+esc(r.impact||'')+'</span></div></div>').join('')||'<div class="empty-line">Sin recomendaciones suficientes.</div>'}
function renderChecklist(items){$('#checklist').innerHTML=items.map((t,i)=>'<label class="check"><input type="checkbox" data-i="'+i+'"><span>'+esc(t)+'</span></label>').join('');$$('#checklist input').forEach(v=>v.addEventListener('change',()=>{v.closest('.check').classList.toggle('done',v.checked);updateCheck()}));updateCheck()}
function updateCheck(){const all=$$('#checklist input'),done=all.filter(x=>x.checked).length;$('#checkProgress').textContent=done+' / '+all.length}
function renderData(data){$('#detectedData').innerHTML=Object.entries(data).map(([k,v])=>'<div class="data-item" data-key="'+esc(k)+'"><span>'+esc(k)+'</span><b>'+esc(v||'No informado')+'</b></div>').join('')||'<div class="empty-line">No se detectaron campos.</div>'}
$('#editDataBtn')?.addEventListener('click',()=>{if(!state.analysis)return;state.editing=!state.editing;$('#editDataBtn').textContent=state.editing?'Guardar':'Editar datos';$$('#detectedData .data-item').forEach(el=>{const key=el.dataset.key,b=el.querySelector('b');if(state.editing)b.outerHTML='<input value="'+esc(state.analysis.raw[key])+'">';else{const i=el.querySelector('input');state.analysis.raw[key]=i.value;i.outerHTML='<b>'+esc(i.value)+' *</b>'}})});
function clsStatus(s=''){s=s.toLowerCase();return /normal|al día|vigente|cancelad/.test(s)?'status-good':/mora|vencid|impag|castig|pérdida|pendiente/.test(s)?'status-bad':'status-warn'}
function renderEntities(items){$('#entityCount').textContent=items.length+' registros';$('#entitiesTable').innerHTML=items.length?'<div class="table-row head"><span>Entidad / producto</span><span>Saldo</span><span>Estado</span></div>'+items.map(v=>'<div class="table-row"><b>'+esc(v.name)+(v.product?' · '+esc(v.product):'')+'</b><span>'+esc(v.balance||'No informado')+'</span><span class="'+clsStatus(v.status)+'">'+esc(v.status||v.classification||'No informado')+'</span></div>').join(''):'<div class="empty-line" style="padding:10px">No informado en el reporte.</div>'}
function renderObligations(items){$('#obligationsTable').innerHTML=items.length?'<div class="table-row head"><span>Obligación</span><span>Saldo</span><span>Estado</span></div>'+items.map(v=>'<div class="table-row"><b>'+esc(v.entity)+(v.product?' · '+esc(v.product):'')+'<small style="display:block;color:#667085;font-weight:400">'+esc(v.detail||'')+'</small></b><span>'+esc(v.balance||'—')+'</span><span class="'+clsStatus(v.status)+'">'+esc(v.status||'—')+'</span></div>').join(''):'<div class="empty-line" style="padding:10px">No se detectaron obligaciones detalladas.</div>'}
function renderInquiries(items){$('#inquiriesList').innerHTML=items.length?items.map(v=>'<div class="timeline-item"><time>'+esc(v.date||'—')+'</time><div><b>'+esc(v.entity||'No informado')+'</b><small>'+esc(v.type||'Consulta')+'</small></div></div>').join(''):'<div class="empty-line">El reporte no informa consultas.</div>'}
function renderSections(sections){$('#reportSections').innerHTML=sections.length?sections.map(s=>'<div class="report-section"><h4>'+esc(s.title||'Sección')+'</h4><dl>'+(Array.isArray(s.items)?s.items:[]).map(i=>'<div class="kv"><dt>'+esc(i.label)+'</dt><dd>'+esc(i.value||'No informado')+'</dd></div>').join('')+'</dl></div>').join(''):'<div class="empty-line">No hay bloques adicionales.</div>'}
function renderMetrics(items){$('#metricsGrid').innerHTML=items.map(m=>'<div class="metric '+(m.danger?'danger':'')+'"><b>'+esc(m.value)+'</b><span>'+esc(m.label)+'</span></div>').join('')||'<div class="empty-line">Sin métricas.</div>'}
function renderChart(series){
 const svg=$('#debtChart');if(!series.length){svg.innerHTML='<text x="450" y="140" text-anchor="middle" class="chart-label">Sin serie histórica</text>';$('#chartLegend').innerHTML='';return}
 const w=900,h=280,p=38,vals=series.map(v=>Number(v.value)||0),max=Math.max(...vals,1),min=Math.min(...vals,0),span=Math.max(max-min,1),pts=series.map((v,i)=>({x:p+i*((w-p*2)/(series.length-1||1)),y:h-p-((Number(v.value)-min)/span)*(h-p*2),...v}));
 let grid='';for(let i=0;i<4;i++){const y=p+i*((h-p*2)/3);grid+='<line class="chart-grid" x1="'+p+'" x2="'+(w-p)+'" y1="'+y+'" y2="'+y+'"/>'}
 const line=pts.map((q,i)=>(i?'L':'M')+q.x+' '+q.y).join(' '),area=line+' L '+pts.at(-1).x+' '+(h-p)+' L '+pts[0].x+' '+(h-p)+' Z';
 svg.innerHTML=grid+'<path class="chart-area" d="'+area+'"/><path class="chart-line" d="'+line+'"/>'+pts.map(q=>'<circle class="chart-point" cx="'+q.x+'" cy="'+q.y+'" r="5"/><text class="chart-label" x="'+q.x+'" y="'+(h-8)+'" text-anchor="middle">'+esc(q.label)+'</text>').join('');
 $('#chartLegend').innerHTML=series.map(v=>'<span>'+esc(v.label)+': '+money(v.value)+'</span>').join('')
}
function renderComposition(items){const vals=items.map(v=>Number(v.value)||0),total=vals.reduce((a,b)=>a+b,0)||1;$('#debtComposition').innerHTML=items.map((v,i)=>{const pct=Math.max(0,Math.min(100,vals[i]/total*100));return '<div class="composition-item"><div class="composition-top"><b>'+esc(v.label)+'</b><span>'+money(v.value)+' · '+pct.toFixed(0)+'%</span></div><div class="bar"><i style="width:'+pct+'%"></i></div></div>'}).join('')||'<div class="empty-line">Sin composición disponible.</div>'}
function renderMonthly(items){$('#monthlyBehavior').innerHTML=items.map(v=>{const s=String(v.status||'').toLowerCase(),c=/normal|al día/.test(s)?'good':/mora|vencid|impag|pérdida/.test(s)?'bad':'warn',width=/normal|al día/.test(s)?100:/mora|vencid|impag|pérdida/.test(s)?35:65;return '<div class="month-row"><span>'+esc(v.period)+'</span><div class="month-track"><i class="'+c+'" style="width:'+width+'%"></i></div><b>'+esc(v.status||'—')+'</b></div>'}).join('')||'<div class="empty-line">Sin historial mensual estructurado.</div>'}
function renderCoverage(x){const s=x.sourceReport||{},det=Number(s.sectionsDetected)||x.reportSections.length,exp=Number(s.sectionsExpected)||det;$('#coverageBox').innerHTML='<div class="coverage-item"><span>Fuente detectada</span><b>'+esc(s.provider||'No identificada')+'</b></div><div class="coverage-item"><span>Tipo de reporte</span><b>'+esc(s.type||'No identificado')+'</b></div><div class="coverage-item"><span>Método de lectura</span><b>'+esc(s.extractionMode||'Texto digital')+'</b></div><div class="coverage-item"><span>Páginas del reporte</span><b>'+esc(s.totalPages||'No informado')+'</b></div><div class="coverage-item"><span>Páginas leídas visualmente</span><b>'+esc(s.visualPages||0)+'</b></div><div class="coverage-item"><span>Periodo cubierto</span><b>'+esc(s.periodCovered||'No informado')+'</b></div><div class="coverage-item"><span>Secciones estructuradas</span><b>'+det+(exp?' / '+exp:'')+'</b></div><div class="coverage-item"><span>Confianza de extracción</span><b>'+esc(x.confidence||0)+'%</b></div>'}

$('#copyActionsBtn')?.addEventListener('click',async()=>{if(!state.analysis)return;const t=state.analysis.recommendations.map((r,i)=>(i+1)+'. '+r.title+'\n'+r.text).join('\n\n');await navigator.clipboard.writeText(t);$('#copyActionsBtn').textContent='Copiado';setTimeout(()=>$('#copyActionsBtn').textContent='Copiar',1200)});
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{await navigator.clipboard.writeText($(b.dataset.copy)?.innerText||'');b.textContent='Copiado';setTimeout(()=>b.textContent='Copiar',1000)}));
$('#printBtn')?.addEventListener('click',()=>window.print());
$('#saveNotesBtn')?.addEventListener('click',saveNotes);let noteTimer;$('#advisorNotes')?.addEventListener('input',()=>{clearTimeout(noteTimer);$('#notesStatus').textContent='Guardando…';noteTimer=setTimeout(saveNotes,600)});
function saveNotes(){if(state.analysis)state.analysis.notes=$('#advisorNotes').value;$('#notesStatus').textContent='Guardado local'}
function saveToHistory(filename){const item={id:crypto.randomUUID(),name:state.analysis.client?.name||filename||'Cliente',score:state.analysis.score,risk:state.analysis.risk,date:new Date().toISOString(),summary:state.analysis.summary,analysis:state.analysis};state.history.unshift(item);state.history=state.history.slice(0,30);localStorage.setItem('ts-admin-history',JSON.stringify(state.history));renderHistory()}
function renderHistory(){const box=$('#historyList');if(!box)return;if(!state.history.length){box.innerHTML='<div class="empty-line">Aún no hay reportes guardados.</div>';return}box.innerHTML=state.history.map(x=>'<div class="history-item"><div><b>'+esc(x.name)+'</b><small>'+new Date(x.date).toLocaleString('es-PE')+'</small></div><div><small>Score</small><span class="score-mini">'+esc(x.score)+'</span></div><div><small>Estado</small><b>'+esc(x.risk)+'</b></div><div><small>'+esc((x.summary||'').slice(0,90))+'…</small></div><button class="mini-btn open-history" data-id="'+x.id+'">Abrir</button></div>').join('');$$('.open-history').forEach(b=>b.addEventListener('click',()=>{const x=state.history.find(h=>h.id===b.dataset.id);if(x){switchView('analysis');loadAnalysis(structuredClone(x.analysis),true)}}))}
async function checkAIStatus(){try{const r=await fetch('/api/analyze',{method:'GET',credentials:'include'}),d=await r.json();$('#aiStatus').textContent=d.configured?'Conectada':'Falta OPENAI_API_KEY';$('#aiStatus').className=d.configured?'ok':''}catch{$('#aiStatus').textContent='No disponible'}}

bootstrap();