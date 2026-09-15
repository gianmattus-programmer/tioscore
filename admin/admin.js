const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={analysis:null,editing:false,clientMode:false,drawerProcessing:false,processUi:'initial',history:[],historyReady:false,currentHistoryId:null,historyFilter:'',analysisMode:localStorage.getItem('ts-analysis-mode')||'deep'};

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
 ],
 reportCharts:{
  noteEvolution:[
   {label:'Oct 24',value:4},{label:'Nov',value:4},{label:'Dic',value:4},{label:'Ene 25',value:0},
   {label:'Feb',value:0},{label:'Mar',value:0},{label:'Abr',value:0},{label:'May',value:0},
   {label:'Jun',value:0},{label:'Jul',value:0},{label:'Ago',value:0},{label:'Sep',value:3},
   {label:'Oct',value:3},{label:'Nov',value:.3},{label:'Dic',value:.4},{label:'Ene 26',value:.6},
   {label:'Feb',value:.3},{label:'Mar',value:.5},{label:'Abr',value:0},{label:'May',value:0},
   {label:'Jun',value:0},{label:'Jul',value:.3},{label:'Ago',value:.45},{label:'Sep',value:.45}
  ],
  classificationHistory:[
   {label:'Nov 25',NOR:100,CPP:0,DEF:0,DUD:0,PER:0},{label:'Dic',NOR:100,CPP:0,DEF:0,DUD:0,PER:0},
   {label:'Ene 26',NOR:65,CPP:35,DEF:0,DUD:0,PER:0},{label:'Feb',NOR:100,CPP:0,DEF:0,DUD:0,PER:0},
   {label:'Mar',NOR:85,CPP:0,DEF:15,DUD:0,PER:0},{label:'Abr',NOR:100,CPP:0,DEF:0,DUD:0,PER:0},
   {label:'May',NOR:100,CPP:0,DEF:0,DUD:0,PER:0},{label:'Jun',NOR:100,CPP:0,DEF:0,DUD:0,PER:0},
   {label:'Jul',NOR:100,CPP:0,DEF:0,DUD:0,PER:0},{label:'Ago',NOR:100,CPP:0,DEF:0,DUD:0,PER:0}
  ],
  overdueByType:[
   {label:'Oct 24',sbs:0,other:210},{label:'Nov',sbs:0,other:210},{label:'Dic',sbs:0,other:210},
   {label:'Sep 25',sbs:0,other:95},{label:'Oct',sbs:0,other:110},{label:'Nov',sbs:0,other:110},
   {label:'Ene 26',sbs:340,other:120},{label:'Feb',sbs:260,other:100},{label:'Mar',sbs:520,other:0},
   {label:'Ago',sbs:0,other:480},{label:'Sep',sbs:0,other:480}
  ],
  overdueShare:[{label:'Vencidos + SBS',value:36},{label:'Otros + Doc. impagos',value:64}],
  currentVsOverdue:[
   {label:'Dic 25',current:720,overdue:0},{label:'Ene 26',current:980,overdue:280},{label:'Feb',current:760,overdue:350},
   {label:'Mar',current:3100,overdue:520},{label:'Abr',current:3300,overdue:0},{label:'May',current:190,overdue:0},
   {label:'Jun',current:160,overdue:0},{label:'Ago',current:600,overdue:0},{label:'Sep',current:600,overdue:0}
  ],
  institutionShare:[{label:'Banco A',value:46},{label:'Financiera B',value:28},{label:'Banco C',value:16},{label:'Financiera D',value:10}]
 }
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
async function showApp(){show('#app');syncAnalysisModeUI();checkAIStatus();warmLocalAI();await initHistoryStore();renderHistory()}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function dateNow(){return new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short'}).format(new Date())}
function money(n){const v=Number(n);return Number.isFinite(v)?'S/ '+v.toLocaleString('es-PE',{minimumFractionDigits:v%1?2:0,maximumFractionDigits:2}):String(n??'—')}
function firstName(value){
 const s=String(value||'').trim().replace(/\s+/g,' ');
 if(!s||/no informado/i.test(s))return s||'Cliente';
 return s.split(' ')[0];
}
function setAnalysisMode(mode){
 state.analysisMode=mode==='fast'?'fast':'deep';
 localStorage.setItem('ts-analysis-mode',state.analysisMode);
 syncAnalysisModeUI();
}
function syncAnalysisModeUI(){
 $$('.analysis-mode-btn').forEach(btn=>{
  const active=btn.dataset.analysisMode===state.analysisMode;
  btn.classList.toggle('active',active);
  btn.setAttribute('aria-pressed',active?'true':'false');
 });
}
$$('.analysis-mode-btn').forEach(btn=>btn.addEventListener('click',()=>setAnalysisMode(btn.dataset.analysisMode)));
function isSurnameLabel(label=''){
 return /(^|\b)(apellido|apellidos)(\b|$)/i.test(String(label));
}
function isPersonalNameLabel(label=''){
 return /(^|\b)(nombre|nombres|titular|persona)(\b|$)/i.test(String(label));
}
function clientSafeValue(label,value){
 if(isSurnameLabel(label))return null;
 if(isPersonalNameLabel(label))return firstName(value);
 return value;
}

const LABELS_ES={
 documentType:'Tipo de documento',
 documentNumber:'Número de documento',
 documentId:'Documento',
 idNumber:'Número de documento',
 firstName:'Nombre',
 middleName:'Segundo nombre',
 lastName:'Apellido',
 fullName:'Nombre completo',
 birthDate:'Fecha de nacimiento',
 dateOfBirth:'Fecha de nacimiento',
 maritalStatus:'Estado civil',
 reportType:'Tipo de reporte',
 reportDate:'Fecha del reporte',
 periodCovered:'Periodo cubierto',
 sectionsDetected:'Secciones detectadas',
 sectionsExpected:'Secciones esperadas',
 sourceReport:'Fuente del reporte',
 provider:'Fuente',
 client:'Cliente',
 entities:'Entidades',
 entity:'Entidad',
 score:'Puntaje',
 risk:'Riesgo',
 confidence:'Confianza',
 debtChange:'Variación de deuda',
 scoreDescription:'Descripción del puntaje',
 summary:'Resumen',
 tags:'Etiquetas',
 alerts:'Alertas',
 metrics:'Métricas',
 debtSeries:'Evolución de la deuda',
 debtComposition:'Composición de la deuda',
 monthlyBehavior:'Comportamiento mensual',
 daysPastDue:'Días de atraso',
 balance:'Saldo',
 product:'Producto',
 status:'Estado',
 classification:'Clasificación',
 creditLimit:'Límite de crédito',
 limit:'Límite',
 monthlyPayment:'Cuota mensual',
 paymentAmount:'Monto de pago',
 dueDate:'Fecha de vencimiento',
 inquiries:'Consultas',
 recommendations:'Recomendaciones',
 closing:'Cierre',
 headline:'Conclusión',
 checklist:'Seguimiento',
 reportSections:'Secciones del reporte',
 reportCharts:'Gráficos del reporte',
 noteEvolution:'Evolución de nota',
 classificationHistory:'Historial de calificación',
 overdueByType:'Deuda vencida por tipo',
 overdueShare:'Distribución de deuda vencida',
 currentVsOverdue:'Deuda vigente y vencida',
 institutionShare:'Participación por institución',
 current:'Vigente',
 overdue:'Vencido',
 other:'Otros',
 amount:'Monto',
 totalAmount:'Monto total',
 currency:'Moneda',
 address:'Dirección',
 phone:'Teléfono',
 phoneNumber:'Teléfono',
 email:'Correo electrónico',
 occupation:'Ocupación',
 employer:'Empleador',
 income:'Ingresos',
 monthlyIncome:'Ingreso mensual',
 credit:'Crédito',
 loan:'Préstamo',
 card:'Tarjeta',
 creditCard:'Tarjeta de crédito',
 creditLine:'Línea de crédito',
 installment:'Cuota',
 installments:'Cuotas',
 term:'Plazo',
 startDate:'Fecha de inicio',
 endDate:'Fecha de fin',
 lastUpdate:'Última actualización',
 updatedAt:'Última actualización',
 createdAt:'Fecha de creación',
 requestDate:'Fecha de consulta',
 inquiryDate:'Fecha de consulta',
 institution:'Institución',
 accountNumber:'Número de cuenta',
 contractNumber:'Número de contrato',
 documentStatus:'Estado del documento',
 reportTitle:'Título del reporte',
 creationDateTime:'Fecha y hora de creación',
 informationUpdated:'Información actualizada al',
 documentLastDigits:'Últimos dígitos del documento',
 rucLastDigits:'Últimos dígitos del RUC',
 scoreExperian:'Score Experian',
 scoreLabel:'Nivel del score',
 bancarizado:'Bancarizado',
 statisticalDefaultReference:'Referencia estadística de incumplimiento',
 capacityOfMonthlyPayment:'Capacidad de pago mensual',
 currentDebtQuickQuery:'Deuda vigente · Consulta rápida',
 currentDebtSBSMicrofinance:'Deuda vigente SBS / Microfinanzas',
 overdueDebtSBSMicrofinance:'Deuda vencida SBS / Microfinanzas',
 overdueDocumentAmount:'Monto de documentos vencidos',
 overdueDocumentDays:'Días de vencimiento del documento',
 visibleBCPOverdueDays:'Días de atraso visibles en BCP',
 protestedDocumentsUnregularized:'Documentos protestados no regularizados',
 protestedDocumentsRegularized:'Documentos protestados regularizados',
 exchangeRate:'Tipo de cambio',
 taxDebt:'Deuda tributaria',
 laborDebt:'Deuda laboral',
 dam:'DAM',
 mainEconomicActivity:'Actividad económica principal',
 taxpayerCondition:'Condición del contribuyente',
 taxpayerStatus:'Estado del contribuyente',
 taxpayerType:'Tipo de contribuyente',
 sunatLastUpdate:'Última actualización SUNAT',
 foreignTrade:'Comercio exterior',
 reportPages:'Páginas del reporte',
};
const LABEL_WORDS_ES={
 document:'documento',type:'tipo',number:'número',id:'ID',first:'primer',middle:'segundo',last:'último',
 name:'nombre',full:'completo',birth:'nacimiento',date:'fecha',marital:'civil',report:'reporte',period:'periodo',
 covered:'cubierto',sections:'secciones',detected:'detectadas',expected:'esperadas',source:'fuente',provider:'fuente',
 client:'cliente',entities:'entidades',entity:'entidad',score:'puntaje',risk:'riesgo',confidence:'confianza',
 debt:'deuda',change:'variación',description:'descripción',summary:'resumen',tags:'etiquetas',alerts:'alertas',
 metrics:'métricas',series:'evolución',composition:'composición',monthly:'mensual',behavior:'comportamiento',
 days:'días',past:'atraso',due:'vencimiento',balance:'saldo',product:'producto',status:'estado',
 classification:'clasificación',credit:'crédito',limit:'límite',payment:'pago',amount:'monto',inquiries:'consultas',
 recommendations:'recomendaciones',closing:'cierre',headline:'conclusión',checklist:'seguimiento',charts:'gráficos',
 note:'nota',evolution:'evolución',history:'historial',overdue:'vencido',share:'participación',current:'vigente',
 other:'otros',institution:'institución',currency:'moneda',address:'dirección',phone:'teléfono',email:'correo',
 occupation:'ocupación',employer:'empleador',income:'ingresos',loan:'préstamo',card:'tarjeta',line:'línea',
 installment:'cuota',installments:'cuotas',term:'plazo',start:'inicio',end:'fin',update:'actualización',
 updated:'actualización',created:'creación',request:'consulta',inquiry:'consulta',account:'cuenta',contract:'contrato'
};
function labelEs(label=''){
 const raw=String(label??'').trim();
 if(!raw)return 'Campo';
 if(LABELS_ES[raw])return LABELS_ES[raw];
 const compact=raw.replace(/[\s_-]+/g,'').toLowerCase();
 const mappedKey=Object.keys(LABELS_ES).find(k=>k.replace(/[\s_-]+/g,'').toLowerCase()===compact);
 if(mappedKey)return LABELS_ES[mappedKey];
 const looksTechnical=/[_-]/.test(raw)||/[a-z0-9][A-Z]/.test(raw)||/^[a-z]+(?:[A-Z][a-z0-9]*)+$/.test(raw);
 if(!looksTechnical)return raw.charAt(0).toUpperCase()+raw.slice(1);
 const spaced=raw.replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').trim();
 const words=spaced.split(/\s+/).map(w=>{
  const lower=w.toLowerCase();
  return LABEL_WORDS_ES[lower]||w;
 });
 const out=words.join(' ');
 return out.charAt(0).toUpperCase()+out.slice(1);
}

$('#loginForm')?.addEventListener('submit',async e=>{
 e.preventDefault();$('#loginError').textContent='';
 const r=await fetch('/api/admin-login',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({password:$('#passwordInput').value})});
 const d=await r.json().catch(()=>({}));if(r.ok)showApp();else $('#loginError').textContent=d.error==='invalid_credentials'?'Contraseña incorrecta.':'No se pudo iniciar sesión.';
});
$('#logoutBtn')?.addEventListener('click',async()=>{await fetch('/api/admin-logout',{method:'POST',credentials:'include'});location.reload()});
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
function switchView(v){$$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$$('.view').forEach(x=>x.classList.add('hidden'));$('#'+v+'View')?.classList.remove('hidden');if(v==='history')renderHistory()}
$('#newAnalysisBtn')?.addEventListener('click',()=>{
 switchView('analysis');
 if(state.analysis&&!$('#resultPanel').classList.contains('hidden'))openNewAnalysisDrawer();
 else resetAnalysis();
});
$('#historyNewBtn')?.addEventListener('click',()=>{switchView('analysis');resetAnalysis()});
function resetAnalysis(){
 closeNewAnalysisDrawer(true);
 switchView('analysis');
 state.analysis=null;
 state.currentHistoryId=null;
 $('#resultPanel').classList.add('hidden');
 $('#uploadPanel').classList.remove('hidden');
 $('#pdfInput').value='';
 $('#uploadState').classList.add('hidden');
 setWorkspaceReadProgress(0);
 const up=$('#uploadReadPct'),ub=$('#uploadReadBar');if(up)up.textContent='0%';if(ub)ub.style.width='0%';
 setAiWorkStatus('waiting','IA en espera',true);
}
$('#demoBtn')?.addEventListener('click',()=>loadAnalysis(structuredClone(demo),true));

const sidebarCollapsed=localStorage.getItem('ts-sidebar-collapsed')==='1';
document.body.classList.toggle('sidebar-collapsed',sidebarCollapsed);
updateSidebarToggle();
$('#sidebarToggle')?.addEventListener('click',()=>{
 const next=!document.body.classList.contains('sidebar-collapsed');
 document.body.classList.toggle('sidebar-collapsed',next);
 localStorage.setItem('ts-sidebar-collapsed',next?'1':'0');
 updateSidebarToggle();
});
function updateSidebarToggle(){
 const b=$('#sidebarToggle');if(!b)return;
 b.textContent=document.body.classList.contains('sidebar-collapsed')?'Mostrar menú':'Ocultar menú';
}

function openNewAnalysisDrawer(){
 const drawer=$('#newAnalysisDrawer');
 const rightScroll=$('.pane-insights .pane-scroll');
 if(!drawer)return;
 if(rightScroll&&drawer.parentElement!==rightScroll){
  rightScroll.prepend(drawer);
 }
 drawer.classList.add('drawer-in-right-pane');
 drawer.classList.remove('hidden');
 drawer.setAttribute('aria-hidden','false');
 showDrawerReady();
 $('#newPdfInput').value='';
 if(rightScroll){
  rightScroll.scrollTo({top:0,behavior:'smooth'});
 }
 setTimeout(()=>$('#newDropZone')?.focus?.(),20);
}
function closeNewAnalysisDrawer(force=false){
 if(state.drawerProcessing&&!force)return;
 const drawer=$('#newAnalysisDrawer');
 if(!drawer)return;
 drawer.classList.add('hidden');
 drawer.setAttribute('aria-hidden','true');
 if(force)state.drawerProcessing=false;
}
function showDrawerReady(){
 state.drawerProcessing=false;
 $('#newUploadReady')?.classList.remove('hidden');
 $('#newUploadProcessing')?.classList.add('hidden');
 $('#newUploadError')?.classList.add('hidden');
 $('#closeNewAnalysisDrawer').disabled=false;
}
function showDrawerProcessing(file){
 state.drawerProcessing=true;
 const dp=$('#drawerReadPct'),db=$('#drawerReadBar');if(dp)dp.textContent='0%';if(db)db.style.width='0%';
 $('#newUploadReady')?.classList.add('hidden');
 $('#newUploadProcessing')?.classList.remove('hidden');
 $('#newUploadError')?.classList.add('hidden');
 $('#closeNewAnalysisDrawer').disabled=true;
 $('#drawerUploadTitle').textContent='Leyendo '+file.name;
 $('#drawerUploadDetail').textContent='Revisando el reporte sin interrumpir la vista del cliente actual…';
}
function friendlyAnalysisError(message=''){
 const s=String(message||'');
 if(/webgpu|webllm|modelo local|ia local/i.test(s))
  return 'La IA local no pudo completar esta interpretación. Se usará el plan basado en reglas.';
 if(/ocr/i.test(s))return 'No se pudo leer una de las páginas escaneadas. Intenta con un PDF más nítido.';
 return s||'No se pudo completar la lectura del documento.';
}
function showDrawerError(message){
 state.drawerProcessing=false;
 $('#newUploadReady')?.classList.add('hidden');
 $('#newUploadProcessing')?.classList.add('hidden');
 $('#newUploadError')?.classList.remove('hidden');
 $('#drawerErrorText').textContent=friendlyAnalysisError(message);
 $('#closeNewAnalysisDrawer').disabled=false;
}
function updateProcessTitle(text){
 if(state.processUi==='drawer')$('#drawerUploadTitle').textContent=text;
 else $('#uploadTitle').textContent=text;
}
function updateProcessDetail(text){
 if(state.processUi==='drawer')$('#drawerUploadDetail').textContent=text;
 else $('#uploadDetail').textContent=text;
}
function clampProgress(value){return Math.max(0,Math.min(100,Math.round(Number(value)||0)))}
function setWorkspaceReadProgress(value){
 const pct=clampProgress(value);
 const t=$('#reportReadPct'),bar=$('#reportReadBar');
 if(t)t.textContent=pct+'%';
 if(bar)bar.style.width=pct+'%';
}
function setReportReadProgress(value){
 const pct=clampProgress(value);
 if(state.processUi==='drawer'){
  const t=$('#drawerReadPct'),bar=$('#drawerReadBar');
  if(t)t.textContent=pct+'%';
  if(bar)bar.style.width=pct+'%';
  return;
 }
 const t=$('#uploadReadPct'),bar=$('#uploadReadBar');
 if(t)t.textContent=pct+'%';
 if(bar)bar.style.width=pct+'%';
 setWorkspaceReadProgress(pct);
}
function setAiWorkStatus(kind='waiting',label='IA en espera',force=false){
 if(state.processUi==='drawer'&&!force)return;
 const el=$('#aiWorkBadge');if(!el)return;
 el.className='ai-work-badge '+kind;
 el.textContent=label;
}
function syncAnalysisProgress(x){
 const read=Number(x?.sourceReport?.readProgress);
 setWorkspaceReadProgress(Number.isFinite(read)?read:100);
 const engine=String(x?.sourceReport?.interpretationEngine||'');
 if(/IA local/i.test(engine))setAiWorkStatus('done','IA lista',true);
 else if(/respuesta inmediata/i.test(engine))setAiWorkStatus('processing','IA mejorando',true);
 else if(/Reglas locales/i.test(engine))setAiWorkStatus('fallback','Reglas locales',true);
 else setAiWorkStatus('waiting','IA en espera',true);
}
$('#closeNewAnalysisDrawer')?.addEventListener('click',()=>closeNewAnalysisDrawer());
$('#drawerRetryBtn')?.addEventListener('click',showDrawerReady);
$('#newPdfInput')?.addEventListener('change',e=>{
 const file=e.target.files[0];
 if(file)processPdf(file,{background:true});
});
const newDz=$('#newDropZone');
newDz?.setAttribute('tabindex','0');
newDz?.addEventListener('click',()=>$('#newPdfInput')?.click());
['dragenter','dragover'].forEach(ev=>newDz?.addEventListener(ev,e=>{
 e.preventDefault();
 if(!state.drawerProcessing)newDz.classList.add('drag');
}));
['dragleave','drop'].forEach(ev=>newDz?.addEventListener(ev,e=>{
 e.preventDefault();
 newDz.classList.remove('drag');
}));
newDz?.addEventListener('drop',e=>{
 if(state.drawerProcessing)return;
 const file=e.dataTransfer.files[0];
 if(file?.type==='application/pdf')processPdf(file,{background:true});
});

$('#pdfInput')?.addEventListener('change',e=>e.target.files[0]&&processPdf(e.target.files[0]));
const dz=$('#dropZone');
['dragenter','dragover'].forEach(ev=>dz?.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));
['dragleave','drop'].forEach(ev=>dz?.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));
dz?.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f?.type==='application/pdf')processPdf(f)});

function reportCapture(text,patterns){
 for(const re of patterns){
  const m=text.match(re);
  if(m&&m[1]!=null)return String(m[1]).trim();
 }
 return '';
}
function detectReportProfile(source=''){
 const text=String(source||'');
 const lower=text.toLowerCase();
 const has=re=>re.test(text);
 let family='generic',provider='Reporte crediticio',template='Estructura adaptable',confidence=25;
 if(has(/\bsentinel\b/i)||has(/posici[oó]n hist[oó]rica/i)||has(/consulta r[aá]pida/i)){
  family='sentinel';provider=has(/\bexperian\b/i)?'Sentinel · Experian':'Sentinel';template='Sentinel / central de riesgo';confidence=95;
 }else if(has(/\bequifax\b/i)||has(/\binfocorp\b/i)){
  family='equifax';provider=has(/\binfocorp\b/i)?'Equifax · Infocorp':'Equifax';template='Equifax / Infocorp';confidence=90;
 }else if(has(/\bexperian\b/i)){
  family='experian';provider='Experian';template='Experian';confidence=85;
 }else if(has(/\bsuperintendencia de banca\b/i)||has(/\bSBS\b/i)&&has(/clasificaci[oó]n|deudor|cr[eé]dito/i)){
  family='sbs';provider='SBS';template='Reporte SBS';confidence=80;
 }
 return {
  family,provider,template,confidence,
  features:{
   score:/(?:score|puntaje|rating|calificaci[oó]n crediticia)/i.test(text),
   history:/(?:hist[oó]ric|evoluci[oó]n|últimos?\s+\d+\s+meses|ultimos?\s+\d+\s+meses)/i.test(text),
   overdue:/(?:vencid|mora|atras|impag|protest)/i.test(text),
   tax:/(?:sunat|tributari|laboral)/i.test(text)
  }
 };
}
function extractGenericPairs(source=''){
 const lines=String(source||'').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
 const stop=/^(?:p[aá]gina|reporte|resumen|detalle|informaci[oó]n|consulta|score|historial|evoluci[oó]n)$/i;
 const pairs=[];
 const seen=new Set();
 for(const line of lines){
  const m=line.match(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 /()._-]{2,42})\s*[:\-]\s*(.{1,100})$/);
  if(!m)continue;
  const label=m[1].trim(),value=m[2].trim();
  const key=label.toLowerCase();
  if(stop.test(label)||seen.has(key)||!value)continue;
  seen.add(key);pairs.push({label,value});
  if(pairs.length>=24)break;
 }
 return pairs;
}
function buildUniversalDeepAnalysis({current=null,overdue=null,docs=null,days=null,institutions=[],profile=null}={}){
 const signals=[];
 if(overdue!=null&&overdue>0)signals.push({level:'bad',title:'Deuda vencida detectada',text:'El reporte registra '+reportMoney(overdue)+' como deuda vencida.'});
 if(docs!=null&&docs>0)signals.push({level:'bad',title:'Documentos impagos o vencidos',text:'Se identifican '+reportMoney(docs)+' en documentos pendientes.'});
 if(days!=null&&days>0)signals.push({level:'warn',title:'Atraso identificado',text:'El mayor atraso extraído es de '+days+' días.'});
 if(current!=null&&current===0)signals.push({level:'good',title:'Sin deuda vigente registrada',text:'El campo de deuda actual del reporte figura en cero.'});
 else if(current!=null&&current>0&&overdue===0&&docs===0)signals.push({level:'good',title:'Sin vencidos explícitos en los campos detectados',text:'Se identificó deuda vigente, pero los campos vencidos detectados figuran en cero.'});
 return {
  mode:'deep',generic:true,observations:0,
  currentFinancialDebt:current,currentOverdueSbs:overdue,currentUnpaidDocs:docs,
  creditor:'',creditorDays:days,peakDebt:null,peakDebtDate:'',peakOverdue:null,peakOverdueDate:'',
  debtReductionFromPeak:null,redPeriods:null,yellowPeriods:null,greenPeriods:null,
  signals,recent:[],history:[],profile:profile?.template||'Estructura adaptable',
  institutions:(institutions||[]).slice(0,12)
 };
}
function sanitizePersonName(value=''){
 const raw=String(value||'').replace(/[|;,_]+/g,' ').replace(/\s+/g,' ').trim();
 if(!raw||raw.length<2||raw.length>70||/\d/.test(raw))return '';
 const stop=new Set(['comercial','financiera','financiero','reporte','consulta','score','puntaje','deuda','cliente','titular','persona','natural','juridica','jurídica','documento','sentinel','sistema','riesgo','credito','crédito','banco','entidad','empresa','informacion','información','actualizada','capacidad','pago','bancarizado','resumen','general']);
 const words=raw.split(' ').filter(Boolean);
 if(words.length<1||words.length>5)return '';
 const generic=words.filter(w=>stop.has(w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''))).length;
 if(generic>0)return '';
 if(words.some(w=>w.length<2||!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.-]+$/.test(w)))return '';
 return words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
}
function sentinelFirstGivenName(value=''){
 const clean=sanitizePersonName(value);
 if(!clean)return '';
 const words=clean.split(' ').filter(Boolean);
 if(words.length>=3)return words[2];
 return words[0]||'';
}
function extractPersonName(text='',profile=null){
 const source=String(text||'');

 // Esta inversión de apellidos/nombres solo se aplica a estructuras Sentinel.
 const sentinelPatterns=[
  /\bDNI\s+\d{8}\s*-\s*([A-ZÁÉÍÓÚÜÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÜÑ]{2,}){2,4})\b/,
  /\bDNI\s+\d{8}\s+([A-ZÁÉÍÓÚÜÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÜÑ]{2,}){2,4})\s+[\d.,]+\s+[\d.,]+/
 ];
 if(profile?.family==='sentinel'){
  for(const re of sentinelPatterns){
   const m=source.match(re);
   const given=sentinelFirstGivenName(m?.[1]||'');
   if(given)return given;
  }
 }

 const patterns=[
  /(?:nombres?\s+y\s+apellidos?|nombre\s+completo|nombre\s+del\s+titular)\s*[:\-]?\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ'.-]+(?:\s+[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ'.-]+){0,4})/i,
  /(?:titular|nombre|asegurado|solicitante)\s*[:\-]\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ'.-]+(?:\s+[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ'.-]+){0,4})/i,
  /(?:cliente|persona)\s*[:\-]\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ'.-]+(?:\s+[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑa-záéíóúüñ'.-]+){0,4})/i
 ];
 for(const re of patterns){
  const m=source.match(re);
  const clean=sanitizePersonName(m?.[1]||'');
  if(clean)return firstName(clean);
 }
 return '';
}
function reportMoneyNumber(value){
 const s=String(value||'').replace(/[^\d,.-]/g,'').trim();
 if(!s)return null;
 let normalized=s;
 if(s.includes(',')&&s.includes('.'))normalized=s.lastIndexOf('.')>s.lastIndexOf(',')?s.replace(/,/g,''):s.replace(/\./g,'').replace(',','.');
 else if(s.includes(','))normalized=s.replace(',','.');
 const n=Number(normalized);
 return Number.isFinite(n)?n:null;
}
function reportMoney(value){
 const n=reportMoneyNumber(value);
 return n==null?'':'S/ '+n.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function protectedDocument(value){
 const digits=String(value||'').replace(/\D/g,'');
 return digits.length>=2?'••••••'+digits.slice(-2):'';
}
function parserRisk(score){
 const s=Number(score)||0;
 if(s>=877)return 'EXCELENTE';
 if(s>=722)return 'BUENO';
 if(s>=598)return 'REGULAR';
 if(s>=477)return 'ALERTA';
 if(s>=1)return 'ALERTA';
 return 'POR REVISAR';
}
function detectInstitutions(text){
 const defs=[
  ['BCP',/\b(?:BCP|BANCO DE CR[EÉ]DITO DEL PER[UÚ])\b/i],
  ['BBVA',/\bBBVA\b/i],['Interbank',/\bINTERBANK\b/i],['Scotiabank',/\bSCOTIABANK\b/i],
  ['Mibanco',/\b(?:MIBANCO|MIBCO)\b/i],['Doctor Sol',/\bDOCTOR\s+SOL\b/i],['BanBif',/\bBANBIF\b/i],['Banco Pichincha',/\b(?:BANCO )?PICHINCHA\b/i],
  ['Banco de la Nación',/\bBANCO DE LA NACI[OÓ]N\b/i],['Caja Arequipa',/\bCAJA AREQUIPA\b/i],
  ['Caja Huancayo',/\bCAJA HUANCAYO\b/i],['Caja Piura',/\bCAJA PIURA\b/i],['Caja Cusco',/\bCAJA CUSCO\b/i],
  ['Claro',/\bCLARO\b/i],['Entel',/\bENTEL\b/i],['Movistar',/\bMOVISTAR\b/i]
 ];
 return defs.filter(([,re])=>re.test(text)).map(([name])=>name);
}
function buildRuleInterpretation(a){
 const score=Number(a.score)||0;
 const raw=a.raw||{};
 const overdue=reportMoneyNumber(raw['Deuda vencida SBS / Microfinanzas'])||0;
 const overdueDocs=reportMoneyNumber(raw['Monto de documentos vencidos'])||0;
 const current=reportMoneyNumber(raw['Deuda vigente SBS / Microfinanzas']||raw['Deuda vigente · Consulta rápida'])||0;
 const tax=reportMoneyNumber(raw['Deuda tributaria'])||0;
 const labor=reportMoneyNumber(raw['Deuda laboral'])||0;
 const days=Math.max(Number(raw['Días de vencimiento del documento'])||0,Number(raw['Días de atraso visibles en BCP'])||0);
 const unreg=reportMoneyNumber(raw['Documentos protestados no regularizados'])||0;
 const capacity=String(raw['Capacidad de pago mensual']||'').trim();
 const banked=String(raw['Bancarizado']||'').trim();
 const entities=String(raw['Entidades detectadas']||a.client?.entities||'').trim();
 const confidence=Number(a.confidence)||0;
 const alerts=[],recs=[],tags=[],summaryParts=[];
 const band=score?getScoreBand(score).category:'Puntaje por revisar';

 if(score>0){
  tags.push(band);
  summaryParts.push('El score identificado es '+score+' y se ubica en "'+band+'".');
  if(score<598){
   alerts.push({level:'red',title:'Score en rango bajo',text:'El puntaje actual requiere especial atención antes de buscar nuevo financiamiento.'});
   recs.push({title:'Priorizar la recuperación del perfil',text:'Evita sumar nuevas obligaciones mientras revisas atrasos, saldos pendientes y datos que deban actualizarse.',impact:'Prioridad 1'});
  }else if(score<722){
   alerts.push({level:'yellow',title:'Score en rango medio',text:'El puntaje es intermedio: no es una alerta crítica por sí solo, pero todavía hay margen importante de mejora.'});
   recs.push({title:'Fortalecer el perfil antes de solicitar más crédito',text:'Mantén pagos puntuales, controla el nivel de deuda y evita nuevas consultas innecesarias mientras consolidas un mejor historial.',impact:'Prioridad 2'});
  }else if(score<877){
   alerts.push({level:'green',title:'Score en buen rango',text:'El puntaje se encuentra en un nivel favorable, sujeto a la revisión de obligaciones y atrasos del reporte.'});
  }else{
   alerts.push({level:'green',title:'Score en rango excelente',text:'El puntaje se encuentra en el rango más alto de la escala utilizada por Tío Score.'});
  }
 }

 if(current>0)summaryParts.push('La deuda vigente identificada es '+reportMoney(current)+'.');
 if(overdue>0||overdueDocs>0){
  const totalOverdue=Math.max(overdue,overdueDocs);
  summaryParts.push('Se detecta deuda vencida por '+reportMoney(totalOverdue)+', que debe ser priorizada.');
  alerts.push({level:'red',title:'Obligaciones vencidas detectadas',text:'El reporte registra montos vencidos que requieren revisión y regularización.'});
  recs.unshift({title:'Regularizar obligaciones vencidas',text:'Prioriza los saldos vencidos identificados y conserva constancias de pago o no adeudo.',impact:'Prioridad 1'});
  tags.push('Deuda vencida');
 }else if(score>0){
  summaryParts.push('En los campos leídos no se identificó una deuda vencida explícita.');
 }
 if(days>0){
  summaryParts.push('El mayor atraso identificado es de '+days+' días.');
  alerts.push({level:'red',title:'Atraso registrado',text:'Se observan '+days+' días de atraso en la información extraída.'});
  if(!recs.some(r=>/vencid|atras/i.test(r.title)))recs.unshift({title:'Corregir el atraso',text:'Regulariza la obligación atrasada y verifica posteriormente su actualización.',impact:'Prioridad 1'});
 }
 if(unreg>0){
  summaryParts.push('Existen documentos protestados no regularizados por '+reportMoney(unreg)+'.');
  alerts.push({level:'red',title:'Protestos no regularizados',text:'El reporte registra documentos protestados pendientes de regularización.'});
  recs.push({title:'Revisar documentos protestados',text:'Regulariza los documentos protestados y solicita sustento de la actualización.',impact:'Prioridad 2'});
 }
 if(tax>0||labor>0){
  summaryParts.push('También aparecen obligaciones tributarias o laborales que deben verificarse.');
  alerts.push({level:'yellow',title:'Obligaciones adicionales',text:'Se detectan obligaciones tributarias o laborales que conviene revisar.'});
  recs.push({title:'Revisar obligaciones adicionales',text:'Verifica el estado y exigibilidad de las obligaciones tributarias o laborales detectadas.',impact:'Prioridad 2'});
 }
 if(capacity)summaryParts.push('La capacidad de pago reportada figura como '+capacity+'.');
 if(banked)summaryParts.push('El reporte indica condición de bancarización: '+banked+'.');
 if(entities)summaryParts.push('Se identificaron entidades como '+entities+'.');

 if(!score&&confidence<70){
  alerts.push({level:'yellow',title:'Lectura parcial del documento',text:'No se extrajo suficiente información para emitir una interpretación completa de forma automática.'});
  summaryParts.push('La extracción fue parcial, por lo que conviene revisar manualmente los campos no identificados.');
 }
 if(!alerts.length)alerts.push({level:'green',title:'Sin observaciones críticas en los datos extraídos',text:'Los campos identificados no muestran atrasos, vencidos o protestos explícitos.'});
 if(!recs.length)recs.push({title:'Mantener pagos puntuales',text:'Conserva el cumplimiento de las obligaciones vigentes y evita atrasos.',impact:'Prioridad 1'});
 if(!recs.some(r=>/actualizaci[oó]n/i.test(r.title)))recs.push({title:'Verificar la actualización del reporte',text:'Revisa un reporte posterior para confirmar cualquier cambio, pago o regularización.',impact:'Seguimiento'});

 const issue=overdue>0||overdueDocs>0||days>0||unreg>0||tax>0||labor>0||score>0&&score<598;
 const medium=score>=598&&score<722;
 return {
  scoreDescription:score
   ?'Tu score es '+score+' ('+band+'). '+(score<598?'Se encuentra en un rango de atención.':score<722?'Es un rango intermedio y aún puede fortalecerse.':score<877?'Se encuentra en un rango favorable.':'Se encuentra en un rango excelente.')
   :'No se identificó un score explícito con suficiente certeza.',
  summary:summaryParts.join(' ')||'La lectura no obtuvo suficientes datos estructurados para construir un resumen completo.',
  tags:[...new Set(tags)].slice(0,5),
  alerts:alerts.slice(0,5),
  recommendations:recs.slice(0,5),
  closing:{
   headline:'Conclusión de la lectura',
   text:issue
    ?'Antes de una nueva solicitud de crédito, prioriza las observaciones detectadas y confirma su actualización en un reporte posterior.'
    :medium
      ?'El perfil se encuentra en una zona intermedia. El objetivo es mantener puntualidad, controlar la deuda y comprobar su evolución en una siguiente revisión.'
      :'Mantén el comportamiento actual y vuelve a comparar el reporte para confirmar la evolución del perfil.'
  },
  checklist:[
   'Revisar los datos y obligaciones identificadas',
   ...(issue?['Regularizar pendientes detectados']:[]),
   'Conservar constancias de pago o regularización',
   'Comparar con un reporte actualizado'
  ],
  followUp:{
   timeframe:issue?'7–30 días':medium?'30–45 días':'30–60 días',
   objective:issue?'Confirmar regularizaciones y medir cambios del perfil.':medium?'Medir si el score y el nivel de deuda evolucionan hacia un rango favorable.':'Confirmar estabilidad del perfil y ausencia de nuevas observaciones.',
   nextReview:'Comparar score, deuda vigente, vencidos, días de atraso y nuevas consultas contra esta lectura.',
   verificationPoints:['Score actualizado','Estado de obligaciones pendientes','Cambios en deuda vigente y vencida','Días de atraso y nuevas consultas'],
   questions:['¿Hubo pagos o regularizaciones desde esta lectura?','¿Se adquirió alguna nueva obligación?','¿Cambió el score o el estado de alguna deuda?']
  }
 };
}
function sentinelDateLabel(date=''){
 const p=String(date).split('/');
 return p.length===3?p[0]+'/'+p[1]+'/'+p[2].slice(-2):String(date);
}
function sampleHistoricalRows(rows,max=24){
 const chronological=[...(rows||[])].reverse();
 if(chronological.length<=max)return chronological;
 const out=[];
 for(let i=0;i<max;i++){
  const idx=Math.round(i*(chronological.length-1)/(max-1));
  const row=chronological[idx];
  if(!out.includes(row))out.push(row);
 }
 return out;
}
function collapseHistoryMonthly(rows=[]){
 const seen=new Set(),monthly=[];
 for(const row of rows){
  const p=String(row.date||'').split('/');
  const key=p.length===3?p[1]+'/'+p[2]:row.date;
  if(!key||seen.has(key))continue;
  seen.add(key);monthly.push(row);
 }
 return monthly;
}
function parseSentinelHistory(text=''){
 const rows=[];
 const re=/\b(\d{2}\/\d{2}\/\d{4})\s+(\d+(?:\.\d+)?)\s+(\d+)\s+([\d,]+\.\d{2})\s+([\d.]+)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+(\d+)\s+(\d+)\s+(\d+)\b/g;
 const seen=new Set();
 let m;
 while((m=re.exec(String(text)))){
  if(seen.has(m[1]))continue;
  seen.add(m[1]);
  const num=v=>Number(String(v).replace(/,/g,''))||0;
  rows.push({
   date:m[1],signal:Number(m[2])||0,entities:Number(m[3])||0,totalDebt:num(m[4]),normalPct:Number(m[5])||0,
   overdueSbs:num(m[6]),otherOverdue:num(m[7]),unpaidDocs:num(m[8]),taxDebt:num(m[9]),laborDebt:num(m[10]),
   countA:Number(m[11])||0,countB:Number(m[12])||0,countC:Number(m[13])||0
  });
 }
 return rows;
}
function parseSentinelUnpaidDocuments(text=''){
 const source=String(text);
 const totalRaw=reportCapture(source,[/Documentos Impagos\s+([\d,]+\.\d{2})/i]);
 const total=reportMoneyNumber(totalRaw)||0;
 const start=source.search(/Documentos Impagos/i);
 if(start<0)return {total:0,items:[]};
 const chunk=source.slice(start,start+900);
 const items=[];
 const re=/(?:^|\s)\d+\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 .&'\-]{2,70}?)\s+([\d,]+\.\d{2})\s+(\d{1,4})\b/g;
 let m;
 while((m=re.exec(chunk))){
  const creditor=String(m[1]||'').replace(/\s+/g,' ').trim();
  if(/^(?:otros documentos|sem[aá]foro|montos expresados|detalle|total)$/i.test(creditor))continue;
  items.push({creditor,amount:reportMoneyNumber(m[2])||0,days:Number(m[3])||0});
  if(items.length>=12)break;
 }
 if(!items.length){
  const alt=/([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 .&'–\-]{2,70}?)\s+1\s+([\d,]+\.\d{2})\s+(\d{1,4})\b/g;
  while((m=alt.exec(chunk))){
   const creditor=String(m[1]||'').replace(/\s+/g,' ').trim();
   if(/(?:documentos impagos|detalle de vencidos|utilizaci[oó]n de l[ií]neas)/i.test(creditor))continue;
   items.push({creditor,amount:reportMoneyNumber(m[2])||0,days:Number(m[3])||0});
   if(items.length>=12)break;
  }
 }
 return {total:total||items.reduce((s,x)=>s+x.amount,0),items};
}
function parseSentinelUnpaidDocument(text=''){
 const group=parseSentinelUnpaidDocuments(text);
 const first=group.items[0];
 return first?{total:group.total,creditor:first.creditor,amount:first.amount,days:first.days}:group.total?{total:group.total,creditor:'',amount:group.total,days:0}:null;
}
function parseCreditLines(text=''){
 const source=String(text);
 const start=source.search(/Utilizaci[oó]n de L[ií]neas de Cr[eé]dito/i);
 if(start<0)return [];
 const chunk=source.slice(start,start+1200);
 const rows=[];
 const re=/\b([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 .&'\-]{1,35})\s+(TCO|LDC|TC|CR[EÉ]D(?:ITO)?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+(\d{1,3})%/g;
 let m;
 while((m=re.exec(chunk))){
  rows.push({entity:String(m[1]).trim(),type:m[2],approved:reportMoneyNumber(m[3])||0,unused:reportMoneyNumber(m[4])||0,used:reportMoneyNumber(m[5])||0,utilization:Number(m[6])||0});
  if(rows.length>=10)break;
 }
 if(!rows.length){
  const alt=/\b([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 .&'\-]{1,35})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+(\d{1,3})%\s+(TCO|LDC|TC|CR[EÉ]D(?:ITO)?)\s+([\d,]+\.\d{2})/g;
  while((m=alt.exec(chunk))){
   rows.push({entity:String(m[1]).trim(),type:m[5],approved:reportMoneyNumber(m[2])||0,unused:reportMoneyNumber(m[6])||0,used:reportMoneyNumber(m[3])||0,utilization:Number(m[4])||0});
   if(rows.length>=10)break;
  }
 }
 return rows;
}
function buildSentinelDeepAnalysis(text='',analysisMode='deep'){
 if(analysisMode!=='deep')return null;
 const history=parseSentinelHistory(text);
 const unpaidGroup=parseSentinelUnpaidDocuments(text);
 const unpaid=parseSentinelUnpaidDocument(text);
 if(!history.length&&!unpaid)return {mode:'deep',observations:0,signals:[],recent:[]};
 const latest=history[0]||{};
 const peakDebt=history.reduce((best,r)=>(r.totalDebt||0)>(best.totalDebt||0)?r:best,history[0]||{});
 const peakOverdue=history.reduce((best,r)=>(r.overdueSbs||0)>(best.overdueSbs||0)?r:best,history[0]||{});
 const peakDocs=history.reduce((best,r)=>(r.unpaidDocs||0)>(best.unpaidDocs||0)?r:best,history[0]||{});
 const redPeriods=history.filter(r=>r.signal>2).length;
 const yellowPeriods=history.filter(r=>r.signal>=.001&&r.signal<=2).length;
 const greenPeriods=history.filter(r=>r.signal<.001).length;
 const reduction=peakDebt?.totalDebt>0?Math.max(-999,Math.min(100,(peakDebt.totalDebt-(latest.totalDebt||0))/peakDebt.totalDebt*100)):null;
 const signals=[];
 if(reduction!=null&&reduction>20)signals.push({level:'good',title:'Deuda financiera reducida',text:'La deuda SBS/Micro actual es '+reduction.toFixed(1)+'% menor que el pico histórico identificado ('+reportMoney(peakDebt.totalDebt)+' el '+peakDebt.date+').'});
 if((latest.overdueSbs||0)===0&&(peakOverdue?.overdueSbs||0)>0)signals.push({level:'good',title:'Sin vencido SBS actual',text:'Actualmente no aparece deuda SBS/Micro vencida, aunque el historial llegó a '+reportMoney(peakOverdue.overdueSbs)+' el '+peakOverdue.date+'.'});
 if((latest.unpaidDocs||0)>0||unpaid?.amount>0)signals.push({level:'bad',title:'Documento impago actual',text:(unpaid?.creditor?unpaid.creditor+': ':'')+reportMoney(unpaid?.amount||latest.unpaidDocs)+(unpaid?.days?' · '+unpaid.days+' días vencido':'')+'.'});
 if(redPeriods>0)signals.push({level:'warn',title:'Historial con señales rojas',text:'Se identificaron '+redPeriods+' registros históricos con semáforo superior a 2. El perfil actual debe leerse junto con esa evolución.'});
 if((latest.normalPct||0)>=100)signals.push({level:'good',title:'Calificación financiera actual normal',text:'La última posición histórica identificada registra 100% de calificación normal en SBS/Micro.'});
 return {
  mode:'deep',
  observations:history.length,
  latestDate:latest.date||'',
  latestSignal:latest.signal??null,
  currentFinancialDebt:latest.totalDebt??null,
  currentNormalPct:latest.normalPct??null,
  currentOverdueSbs:latest.overdueSbs??null,
  currentUnpaidDocs:Math.max(latest.unpaidDocs||0,unpaidGroup.total||0),
  creditor:unpaid?.creditor||'',
  creditorDays:unpaid?.days||0,
  unpaidItems:unpaidGroup.items,
  peakDebt:peakDebt?.totalDebt||0,
  peakDebtDate:peakDebt?.date||'',
  peakOverdue:peakOverdue?.overdueSbs||0,
  peakOverdueDate:peakOverdue?.date||'',
  peakUnpaidDocs:peakDocs?.unpaidDocs||0,
  peakUnpaidDocsDate:peakDocs?.date||'',
  debtReductionFromPeak:reduction,
  redPeriods,yellowPeriods,greenPeriods,
  signals,
  recent:history.slice(0,8),
  history
 };
}

function parseCreditReport(source,meta={}){
 const rawSource=String(source||'');
 const profile=meta.profile||detectReportProfile(rawSource);
 const text=rawSource.replace(/--- PÁGINA \d+ · [^-]+ ---/g,' ').replace(/\s+/g,' ').trim();
 const analysisMode=meta.analysisMode==='fast'?'fast':'deep';
 let deepAnalysis=profile.family==='sentinel'?buildSentinelDeepAnalysis(text,analysisMode):null;
 const historySample=deepAnalysis?sampleHistoricalRows(collapseHistoryMonthly(deepAnalysis.history||[]),24):[];
 const genericPairs=extractGenericPairs(rawSource);
 const raw={};
 const add=(label,value)=>{if(value!==''&&value!=null&&!/^(?:no informado|no registrado)$/i.test(String(value).trim()))raw[label]=String(value).trim()};
 const name=extractPersonName(text,profile);
 const dni=reportCapture(text,[
  /\bDNI\s*(?:N[°ºo.]*)?\s*[:\-]?\s*(\d{8})\b/i,
  /(?:documento|doc\.?|n[úu]mero de documento)\s*[:\-]?\s*(\d{8})\b/i,
  /\b(\d{8})\b(?=.{0,25}\bDNI\b)/i
 ]);
 const ruc=reportCapture(text,[/\bRUC\s*(?:N[°ºo.]*)?\s*[:\-]?\s*(\d{11})\b/i]);
 const ce=reportCapture(text,[/\b(?:CE|C\.E\.|CARN[EÉ]\s+DE\s+EXTRANJER[IÍ]A)\s*(?:N[°ºo.]*)?\s*[:\-]?\s*([A-Z0-9]{8,12})\b/i]);
 const scoreRaw=reportCapture(text,[
  /(?:score(?:\s+crediticio|\s+experian)?|puntaje(?:\s+crediticio|\s+experian)?|rating)\s*[:\-]?\s*(\d{1,3})\b/i,
  /\bexperian\b.{0,35}\b(\d{3})\b/i,
  /(?:calificaci[oó]n\s+crediticia).{0,30}?\b(\d{3})\b/i
 ]);
 const score=Math.max(0,Math.min(999,Number(scoreRaw)||0));
 const scoreLabel=reportCapture(text,[/(?:nivel\s+del\s+score|puntaje)\s*[:\-]?\s*(puntaje\s+(?:muy\s+)?(?:bajo|medio|bueno|excelente)|(?:muy\s+)?(?:bajo|medio|bueno|excelente))/i]);
 const creation=reportCapture(text,[/(?:fecha(?: y hora)? de creaci[oó]n|creationDateTime)\s*[:\-]?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)/i]);
 const updated=reportCapture(text,[/(?:informaci[oó]n actualizada(?: al)?|informationUpdated)\s*[:\-]?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i,/(?:informaci[oó]n actualizada(?: al)?)[^\d]{0,10}(\d{1,2}\s+de\s+[A-Za-zÁÉÍÓÚáéíóú]+\s+del?\s+\d{4})/i]);
 const documentType=reportCapture(text,[/(?:tipo de documento|documentType)\s*[:\-]?\s*(DNI|CE|C\.E\.|RUC|PASAPORTE)/i])||(dni?'DNI':ruc?'RUC':ce?'CE':'');
 const banc=reportCapture(text,[/bancarizad[oa]\s*[:\-]?\s*(S[IÍ]|NO)\b/i]);
 const capacity=reportCapture(text,[/(?:capacidad(?: de)? pago(?: mensual)?|capacityOfMonthlyPayment)\s*[:\-]?\s*((?:S\/\s*)?[\d.,]+\s*(?:a|-|hasta)\s*(?:S\/\s*)?[\d.,]+)/i,/(?:capacidad(?: de)? pago(?: mensual)?).{0,240}?((?:S\/\s*)?[\d.,]+\s*(?:a|-|hasta)\s*(?:S\/\s*)?[\d.,]+)/i,/(?:capacidad(?: de)? pago|cuota disponible)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const quickDebt=reportCapture(text,[
  /(?:deuda vigente\s*(?:·|-)?\s*consulta r[aá]pida|currentDebtQuickQuery)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i,
  /(?:deuda actual|deuda total|saldo total|saldo vigente|total deuda)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i,
  /Consulta R[aá]pida.{0,700}?\b([\d]{1,3}(?:,[\d]{3})*\.\d{2})\b/i
 ]);
 const currentDebt=reportCapture(text,[
  /(?:deuda vigente\s*(?:SBS\s*\/?\s*Microfinanzas)?|currentDebtSBSMicrofinance)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i,
  /(?:saldo vigente|deuda directa|deuda financiera|total vigente)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i,
  /Posici[oó]n Hist[oó]rica.{0,900}?\b\d{2}\/\d{2}\/\d{4}\s+\d+(?:\.\d+)?\s+\d+\s+([\d]{1,3}(?:,[\d]{3})*\.\d{2})\b/i
 ]);
 const overdueDebt=reportCapture(text,[
  /(?:deuda vencida\s*(?:SBS\s*\/?\s*Microfinanzas)?|overdueDebtSBSMicrofinance)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i,
  /(?:deuda atrasada|saldo vencido|mora total|total vencido|monto vencido)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i
 ]);
 const overdueDocs=reportCapture(text,[
  /(?:monto(?: de)? documentos vencidos|overdueDocumentAmount)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i,
  /(?:documentos impagos|obligaciones impagas|documentos protestados|cuentas impagas)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i,
  /Documentos Impagos.{0,140}?\b([\d]{1,3}(?:,[\d]{3})*\.\d{2})\b/i
 ]);
 const overdueDays=reportCapture(text,[
  /(?:d[ií]as de vencimiento(?: del documento)?|d[ií]as de atraso|d[ií]as en mora|overdueDocumentDays)\s*[:\-]?\s*(\d{1,4})/i,
  /Documentos Impagos.{0,220}?\b[\d]{1,3}(?:,[\d]{3})*\.\d{2}\s+(?:D[ií]as\s+Venc\.?\s*)?(\d{1,4})\b/i
 ]);
 const bcpDays=reportCapture(text,[/(?:d[ií]as de atraso visibles? en BCP|visibleBCPOverdueDays)\s*[:\-]?\s*(\d{1,4})/i]);
 const protestedUnreg=reportCapture(text,[/(?:documentos protestados no regularizados|protestedDocumentsUnregularized)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const protestedReg=reportCapture(text,[/(?:documentos protestados regularizados|protestedDocumentsRegularized)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const taxDebt=reportCapture(text,[/(?:deuda tributaria|taxDebt)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const laborDebt=reportCapture(text,[/(?:deuda laboral|laborDebt)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const exchangeRate=reportCapture(text,[/(?:tipo de cambio|exchangeRate)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)/i]);
 const activity=reportCapture(text,[/(?:actividad econ[oó]mica principal|mainEconomicActivity)\s*[:\-]?\s*([0-9]{3,6}\s*-\s*[^|]{3,90})/i]);
 const taxpayerCondition=reportCapture(text,[/(?:condici[oó]n del contribuyente|taxpayerCondition)\s*[:\-]?\s*(HABIDO|NO HABIDO|PENDIENTE|NO HALLADO)/i]);
 const taxpayerStatus=reportCapture(text,[/(?:estado del contribuyente|taxpayerStatus)\s*[:\-]?\s*(ACTIVO|BAJA[^|]{0,30}|SUSPENDIDO)/i]);
 const taxpayerType=reportCapture(text,[/(?:tipo de contribuyente|taxpayerType)\s*[:\-]?\s*(PERSONA\s+(?:NATURAL|JUR[IÍ]DICA)[^|]{0,50})/i]);
 const sunatUpdate=reportCapture(text,[/(?:[uú]ltima actualizaci[oó]n SUNAT|sunatLastUpdate)\s*[:\-]?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i]);
 const reportPages=reportCapture(text,[/(?:p[aá]ginas del reporte|reportPages)\s*[:\-]?\s*(\d{1,3})/i])||String(meta.totalPages||'');
 const institutions=detectInstitutions(text);
 const creditLines=parseCreditLines(text);

 add('Nombre',name?firstName(name):'');
 add('Tipo de documento',documentType);
 add('Documento',protectedDocument(dni||ruc||ce));
 add('Últimos dígitos del RUC',ruc?ruc.slice(-2):'');
 add('Fecha y hora de creación',creation);
 add('Información actualizada al',updated);
 add('Score Experian',score||'');
 add('Nivel del score',scoreLabel||(score?getScoreBand(score).category:''));
 add('Bancarizado',banc.toUpperCase());
 add('Capacidad de pago mensual',capacity);
 add('Deuda vigente · Consulta rápida',quickDebt);
 add('Deuda vigente SBS / Microfinanzas',currentDebt);
 add('Deuda vencida SBS / Microfinanzas',overdueDebt);
 add('Monto de documentos vencidos',overdueDocs);
 add('Días de vencimiento del documento',overdueDays);
 add('Días de atraso visibles en BCP',bcpDays);
 add('Documentos protestados no regularizados',protestedUnreg);
 add('Documentos protestados regularizados',protestedReg);
 add('Tipo de cambio',exchangeRate);
 add('Deuda tributaria',taxDebt);
 add('Deuda laboral',laborDebt);
 add('Actividad económica principal',activity);
 add('Condición del contribuyente',taxpayerCondition);
 add('Estado del contribuyente',taxpayerStatus);
 add('Tipo de contribuyente',taxpayerType);
 add('Última actualización SUNAT',sunatUpdate);
 add('Páginas del reporte',reportPages);
 if(institutions.length)add('Entidades detectadas',institutions.join(' · '));
 if(creditLines.length){
  add('Líneas de crédito detectadas',creditLines.length);
  add('Línea de crédito utilizada',reportMoney(creditLines.reduce((s,x)=>s+x.used,0)));
 }
 if(deepAnalysis){
  add('Registros históricos analizados',deepAnalysis.observations||'');
  if(deepAnalysis.peakDebt)add('Pico histórico de deuda',reportMoney(deepAnalysis.peakDebt));
  if(deepAnalysis.peakDebtDate)add('Fecha del pico de deuda',deepAnalysis.peakDebtDate);
  if(deepAnalysis.debtReductionFromPeak!=null)add('Reducción desde el pico',deepAnalysis.debtReductionFromPeak.toFixed(1)+'%');
  if(deepAnalysis.creditor)add('Acreedor del documento impago',deepAnalysis.creditor);
 }

 let points=0;
 if(profile.family!=='generic')points+=Math.min(10,Math.round(profile.confidence/10));
 if(score)points+=25;
 if(dni||ruc)points+=10;
 if(name)points+=7;
 if(creation||updated)points+=5;
 if(currentDebt||quickDebt)points+=10;
 if(overdueDebt||overdueDocs)points+=10;
 if(capacity)points+=8;
 if(banc)points+=4;
 if(taxDebt||laborDebt)points+=4;
 if(taxpayerCondition||taxpayerStatus||taxpayerType)points+=4;
 if(reportPages)points+=3;
 const parserConfidence=Math.min(100,points);

 const current=reportMoneyNumber(currentDebt||quickDebt);
 const overdue=reportMoneyNumber(overdueDebt);
 const docs=reportMoneyNumber(overdueDocs);
 if(analysisMode==='deep'&&!deepAnalysis){
  const genericDays=(overdueDays||bcpDays)?Math.max(Number(overdueDays)||0,Number(bcpDays)||0):null;
  deepAnalysis=buildUniversalDeepAnalysis({
   current,overdue,docs,days:genericDays,institutions,profile
  });
 }
 const debtComposition=[];
 if(current!=null&&current>0)debtComposition.push({label:'Deuda vigente',value:current});
 if(overdue!=null&&overdue>0)debtComposition.push({label:'Deuda vencida SBS / Microfinanzas',value:overdue});
 if(docs!=null&&docs>0)debtComposition.push({label:'Documentos vencidos',value:docs});

 const entities=institutions.map(v=>({name:v,type:'Entidad detectada',product:'',balance:'',status:'Detectada',daysPastDue:'',classification:'',limit:'',monthlyPayment:''}));
 const obligations=[];
 if(current!=null&&current>0)obligations.push({entity:'Sistema financiero',product:'Deuda vigente',balance:reportMoney(current),status:'Vigente',detail:'Monto global identificado en el reporte'});
 if(overdue!=null&&overdue>0)obligations.push({entity:'Sistema financiero',product:'Deuda vencida',balance:reportMoney(overdue),status:'Vencida',detail:(overdueDays||bcpDays)?'Atraso detectado: '+Math.max(Number(overdueDays)||0,Number(bcpDays)||0)+' días':'Monto vencido identificado'});
 if(docs!=null&&docs>0)obligations.push({entity:'Documentos',product:'Documentos vencidos',balance:reportMoney(docs),status:'Vencida',detail:'Documentos impagos identificados'});
 if(Array.isArray(deepAnalysis?.unpaidItems)&&deepAnalysis.unpaidItems.length){
  for(const item of deepAnalysis.unpaidItems){
   obligations.push({entity:item.creditor,product:'Documento impago',balance:reportMoney(item.amount),status:'Vencida',detail:item.days?item.days+' días de vencimiento':'Atraso identificado'});
   entities.push({name:item.creditor,type:'Acreedor comercial',product:'Documento impago',balance:reportMoney(item.amount),status:'Vencida',daysPastDue:item.days?item.days+' días':'',classification:'Comercial',limit:'',monthlyPayment:''});
  }
 }else if(deepAnalysis?.creditor&&deepAnalysis.currentUnpaidDocs>0){
  obligations.push({entity:deepAnalysis.creditor,product:'Documento impago',balance:reportMoney(deepAnalysis.currentUnpaidDocs),status:'Vencida',detail:(deepAnalysis.creditorDays?deepAnalysis.creditorDays+' días de vencimiento':'Atraso identificado')});
 }
 for(const line of creditLines){
  entities.push({name:line.entity,type:'Línea de crédito',product:line.type,balance:reportMoney(line.used),status:'Vigente',daysPastDue:'',classification:'',limit:reportMoney(line.approved),monthlyPayment:''});
  obligations.push({entity:line.entity,product:'Línea '+line.type,balance:reportMoney(line.used),status:'Vigente',detail:'Línea aprobada '+reportMoney(line.approved)+' · utilización '+line.utilization+'%'});
 }

 const financialLabels=new Set(['Score Experian','Nivel del score','Bancarizado','Capacidad de pago mensual','Deuda vigente · Consulta rápida','Deuda vigente SBS / Microfinanzas','Deuda vencida SBS / Microfinanzas','Monto de documentos vencidos','Días de vencimiento del documento','Días de atraso visibles en BCP','Documentos protestados no regularizados','Documentos protestados regularizados']);
 const taxLabels=new Set(['Deuda tributaria','Deuda laboral','Actividad económica principal','Condición del contribuyente','Estado del contribuyente','Tipo de contribuyente','Última actualización SUNAT']);
 const toItems=set=>Object.entries(raw).filter(([k])=>set.has(k)).map(([label,value])=>({label,value}));
 const reportSections=[];
 const financialItems=toItems(financialLabels);if(financialItems.length)reportSections.push({title:'Situación financiera',items:financialItems});
 const taxItems=toItems(taxLabels);if(taxItems.length)reportSections.push({title:'Información tributaria y comercial',items:taxItems});
 const knownValues=new Set(Object.values(raw).map(v=>String(v).trim().toLowerCase()));
 const genericItems=genericPairs
  .filter(p=>!knownValues.has(String(p.value).trim().toLowerCase()))
  .filter(p=>!/apellido/i.test(p.label))
  .slice(0,14);
 if(genericItems.length)reportSections.push({title:'Campos adicionales detectados',items:genericItems});
 if(deepAnalysis&&!deepAnalysis.generic){
  const histItems=[];
  if(deepAnalysis.observations>0)histItems.push({label:'Observaciones históricas',value:String(deepAnalysis.observations)});
  if(deepAnalysis.peakDebt!=null&&deepAnalysis.peakDebt>0)histItems.push({label:'Pico de deuda',value:reportMoney(deepAnalysis.peakDebt)+(deepAnalysis.peakDebtDate?' · '+deepAnalysis.peakDebtDate:'')});
  if(deepAnalysis.peakOverdue!=null)histItems.push({label:'Pico de vencido SBS',value:reportMoney(deepAnalysis.peakOverdue)+(deepAnalysis.peakOverdueDate?' · '+deepAnalysis.peakOverdueDate:'')});
  if(deepAnalysis.debtReductionFromPeak!=null)histItems.push({label:'Reducción desde el pico',value:deepAnalysis.debtReductionFromPeak.toFixed(1)+'%'});
  if(deepAnalysis.redPeriods!=null)histItems.push({label:'Señales rojas históricas',value:String(deepAnalysis.redPeriods)});
  if(histItems.length)reportSections.push({title:'Lectura histórica profunda',items:histItems});
 }

 const metrics=[];
 if(score)metrics.push({value:String(score),label:'Score Experian'});
 if(current!=null)metrics.push({value:reportMoney(current),label:'Deuda vigente'});
 if(overdue!=null)metrics.push({value:reportMoney(overdue),label:'Deuda vencida',danger:overdue>0});
 if(docs!=null)metrics.push({value:reportMoney(docs),label:'Documentos vencidos',danger:docs>0});
 if(overdueDays||bcpDays)metrics.push({value:String(Math.max(Number(overdueDays)||0,Number(bcpDays)||0)),label:'Máx. días de atraso',danger:true});
 if(capacity)metrics.push({value:capacity,label:'Capacidad de pago'});
 if(creditLines.length){
  metrics.push({value:reportMoney(creditLines.reduce((s,x)=>s+x.approved,0)),label:'Línea aprobada'});
  metrics.push({value:reportMoney(creditLines.reduce((s,x)=>s+x.used,0)),label:'Línea utilizada'});
 }
 if(deepAnalysis?.peakDebt)metrics.push({value:reportMoney(deepAnalysis.peakDebt),label:'Pico histórico'});
 if(deepAnalysis?.debtReductionFromPeak!=null)metrics.push({value:deepAnalysis.debtReductionFromPeak.toFixed(1)+'%',label:'Reducción desde pico'});
 if(deepAnalysis?.observations)metrics.push({value:String(deepAnalysis.observations),label:'Registros históricos'});
 if(deepAnalysis?.redPeriods)metrics.push({value:String(deepAnalysis.redPeriods),label:'Señales rojas',danger:true});

 const debtSeries=historySample.map(r=>({label:sentinelDateLabel(r.date),value:r.totalDebt}));
 const monthlyBehavior=historySample.map(r=>({period:sentinelDateLabel(r.date),status:r.signal>2?'ROJO':r.signal>=.001?'AMARILLO':'VERDE',daysPastDue:0,balance:r.totalDebt}));
 const noteEvolution=historySample.map(r=>({label:sentinelDateLabel(r.date),value:r.signal}));
 const overdueByType=historySample.map(r=>({label:sentinelDateLabel(r.date),sbs:r.overdueSbs,other:(r.otherOverdue||0)+(r.unpaidDocs||0)}));
 const currentVsOverdue=historySample.map(r=>({label:sentinelDateLabel(r.date),current:Math.max(0,(r.totalDebt||0)-(r.overdueSbs||0)),overdue:r.overdueSbs||0}));
 const recentForShare=(deepAnalysis?.history||[]).slice(0,24);
 const sumSbs=recentForShare.reduce((s,r)=>s+(r.overdueSbs||0),0);
 const sumOther=recentForShare.reduce((s,r)=>s+(r.otherOverdue||0)+(r.unpaidDocs||0),0);
 const overdueShare=(sumSbs+sumOther)>0?[{label:'Vencidos + SBS',value:sumSbs},{label:'Otros + Doc. impagos',value:sumOther}]:[];
 const periodCovered=deepAnalysis?.history?.length?[deepAnalysis.history.at(-1)?.date,deepAnalysis.latestDate].filter(Boolean).join(' → '):'';
 const analysis={
  sourceReport:{provider:profile.provider,type:'Reporte crediticio',template:profile.template,profileFamily:profile.family,profileConfidence:profile.confidence,reportDate:updated||creation||'',periodCovered,sectionsDetected:reportSections.length,sectionsExpected:reportSections.length,parserMode:'local',analysisMode},
  client:{name:firstName(name||'Cliente'),document:protectedDocument(dni||ruc||ce)||'Documento protegido',age:'',reportDate:updated||creation||'',entities:institutions.join(' · ')},
  score,risk:parserRisk(score),confidence:parserConfidence,debtChange:0,deepAnalysis,creditLines,
  metrics,debtSeries,debtComposition,monthlyBehavior,entities,obligations,inquiries:[],raw,reportSections,
  reportCharts:{noteEvolution,classificationHistory:[],overdueByType,overdueShare,currentVsOverdue,institutionShare:[]}
 };
 Object.assign(analysis,buildRuleInterpretation(analysis));
 analysis.sourceReport.interpretationEngine='Reglas locales';
 return {analysis,parserConfidence};
}
function interpretationPayload(a){
 const raw=a.raw||{};
 const keep=[
  'Score Experian','Nivel del score','Bancarizado','Capacidad de pago mensual',
  'Deuda vigente · Consulta rápida','Deuda vigente SBS / Microfinanzas',
  'Deuda vencida SBS / Microfinanzas','Monto de documentos vencidos',
  'Días de vencimiento del documento','Días de atraso visibles en BCP',
  'Documentos protestados no regularizados','Documentos protestados regularizados',
  'Deuda tributaria','Deuda laboral','Condición del contribuyente',
  'Estado del contribuyente','Entidades detectadas'
 ];
 const datos={};
 for(const k of keep)if(raw[k]!=null&&String(raw[k]).trim()!=='')datos[k]=raw[k];
 for(const [k,v] of Object.entries(raw)){
  if(Object.keys(datos).length>=20)break;
  if(datos[k]!=null||/^(?:Nombre|Documento|Tipo de documento|Últimos dígitos)/i.test(k))continue;
  if(v!=null&&String(v).trim()!=='')datos[k]=v;
 }
 const deep=a.deepAnalysis&&a.sourceReport?.analysisMode==='deep'?{
  observaciones:a.deepAnalysis.observations,
  deudaActual:a.deepAnalysis.currentFinancialDebt,
  porcentajeNormal:a.deepAnalysis.currentNormalPct,
  vencidoSbsActual:a.deepAnalysis.currentOverdueSbs,
  documentosImpagos:a.deepAnalysis.currentUnpaidDocs,
  acreedor:a.deepAnalysis.creditor,
  diasVencido:a.deepAnalysis.creditorDays,
  picoDeuda:a.deepAnalysis.peakDebt,
  fechaPico:a.deepAnalysis.peakDebtDate,
  picoVencido:a.deepAnalysis.peakOverdue,
  reduccionDesdePico:a.deepAnalysis.debtReductionFromPeak,
  periodosRojos:a.deepAnalysis.redPeriods,
  recientes:(a.deepAnalysis.recent||[]).slice(0,6).map(r=>({f:r.date,d:r.totalDebt,v:r.overdueSbs,doc:r.unpaidDocs,s:r.signal,n:r.normalPct}))
 }:null;
 return {
  score:a.score,
  nivel:getScoreBand(a.score).category,
  confianza:a.confidence,
  modo:a.sourceReport?.analysisMode||'fast',
  fuente:a.sourceReport?.provider||'Reporte crediticio',
  plantilla:a.sourceReport?.template||'Estructura adaptable',
  datos,
  entidades:(a.entities||[]).slice(0,8).map(x=>({n:x.name,p:x.product,s:x.balance,e:x.status||x.classification})),
  obligaciones:(a.obligations||[]).slice(0,10).map(x=>({e:x.entity,p:x.product,s:x.balance,st:x.status,d:x.detail})),
  profundo:deep
 };
}

let localAiEngine=null;
let localAiPromise=null;
let localAiWorker=null;
let localAiQueue=Promise.resolve();
let localAiHardware=null;
let localAiBackend='';
let localAiModelId='';
let localAiLastError='';
let localAiGpuError='';
let cpuQwenWorker=null;
let cpuQwenSeq=0;
const cpuQwenPending=new Map();

const LOCAL_AI_MODULE='https://esm.run/@mlc-ai/web-llm@0.2.85';
const LOCAL_AI_CANDIDATES_F16=[
 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
 'Qwen3-0.6B-q4f16_1-MLC',
 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'
];
const LOCAL_AI_CANDIDATES_F32=[
 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
 'Qwen3-0.6B-q4f32_1-MLC',
 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC'
];
const LOCAL_AI_WORKER='/admin/local-ai-worker.js?v=20260914-qwenreal1';
const CPU_QWEN_WORKER='/admin/qwen-cpu-worker.js?v=20260914-qwencpu1';

function setLocalAiStatus(textValue,ok=false){
 const el=$('#aiStatus');
 if(!el)return;
 el.textContent=textValue;
 el.className=ok?'ok':'';
}
function setInlineAiMessage(message='',kind='error'){
 const el=$('#aiInlineError');if(!el)return;
 const text=String(message||'').trim();
 if(!text){el.textContent='';el.className='ai-inline-error hidden';el.title='';return}
 el.textContent=text.length>150?text.slice(0,147)+'…':text;
 el.title=text;
 el.className='ai-inline-error '+(kind==='info'?'info':kind==='ok'?'ok':'');
}
function localAiProgressText(p){
 const raw=String(p?.text||p?.status||'Cargando IA local…');
 const pct=Number(p?.progress);
 return Number.isFinite(pct)?raw+' '+Math.round(pct*100)+'%':raw;
}
async function inspectLocalHardware(){
 if(localAiHardware)return localAiHardware;
 const result={webgpu:false,shaderF16:false,label:'No disponible',detail:''};
 if(!('gpu' in navigator)){
  result.detail='WebGPU no está disponible en este navegador/equipo.';
  localAiHardware=result;
  return result;
 }
 try{
  const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
  if(!adapter){result.detail='WebGPU existe, pero no se encontró un adaptador compatible.';localAiHardware=result;return result}
  const info=adapter.info||{};
  result.webgpu=true;
  result.shaderF16=adapter.features?.has?.('shader-f16')||false;
  result.label=[info.vendor,info.architecture].filter(Boolean).join(' · ')||'WebGPU compatible';
  result.detail='Qwen local · '+(result.shaderF16?'q4f16':'q4f32')+' · Web Worker';
 }catch(e){
  result.detail='WebGPU detectado, pero falló la inicialización del adaptador.';
 }
 localAiHardware=result;
 return result;
}
function renderHardwareStatus(hw){
 const el=$('#aiHardware');if(!el)return;
 el.textContent=hw.webgpu?(hw.label+' · compatible'):(hw.detail||'No compatible · se usará CPU/WASM');
 el.className=hw.webgpu?'ok':'';
}
function cpuWorker(){
 if(cpuQwenWorker)return cpuQwenWorker;
 const worker=new Worker(CPU_QWEN_WORKER,{type:'module',name:'tioscore-qwen-cpu'});
 worker.onmessage=e=>{
  const msg=e.data||{},pending=cpuQwenPending.get(msg.id);
  if(!pending)return;
  if(msg.type==='status'){
   setLocalAiStatus(msg.message||'Qwen CPU…');
   setInlineAiMessage(msg.message||'Preparando Qwen CPU…','info');
   return;
  }
  if(msg.type==='progress'){
   const pct=Number(msg.progress);
   const p=Number.isFinite(pct)?Math.max(0,Math.min(100,Math.round(pct))):null;
   const label='Qwen CPU'+(p!=null?' · '+p+'%':'')+' · '+String(msg.message||'descargando');
   setLocalAiStatus(label);
   setInlineAiMessage(label,'info');
   return;
  }
  clearTimeout(pending.timer);
  cpuQwenPending.delete(msg.id);
  if(msg.type==='error')pending.reject(new Error(msg.message||'Error Qwen CPU'));
  else pending.resolve(msg);
 };
 worker.onerror=e=>{
  const err=new Error(e?.message||'No se pudo iniciar el Worker de Qwen CPU.');
  for(const [id,p] of cpuQwenPending){clearTimeout(p.timer);p.reject(err);cpuQwenPending.delete(id)}
 };
 cpuQwenWorker=worker;
 return worker;
}
function cpuQwenRequest(type,payload={},timeoutMs=600000){
 const worker=cpuWorker();
 const id='cpu-'+Date.now()+'-'+(++cpuQwenSeq);
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{
   cpuQwenPending.delete(id);
   reject(new Error('Qwen CPU superó el tiempo máximo de espera.'));
  },timeoutMs);
  cpuQwenPending.set(id,{resolve,reject,timer});
  worker.postMessage({id,type,...payload});
 });
}
async function initWebGpuQwen(hw){
 setLocalAiStatus('Cargando Qwen 0.5B por WebGPU…');
 const webllm=await import(LOCAL_AI_MODULE);
 const ids=(webllm.prebuiltAppConfig?.model_list||[]).map(x=>x.model_id).filter(Boolean);
 const preferred=hw.shaderF16?LOCAL_AI_CANDIDATES_F16:LOCAL_AI_CANDIDATES_F32;
 localAiModelId=preferred.find(id=>ids.includes(id))||'';
 if(!localAiModelId){
  const availableQwen=ids.filter(id=>/qwen/i.test(id)).slice(0,8).join(', ');
  throw new Error('Qwen 0.5B no aparece en el catálogo WebLLM 0.2.85.'+(availableQwen?' Qwen disponibles: '+availableQwen:''));
 }

 if(localAiWorker){try{localAiWorker.terminate()}catch{}}
 localAiWorker=new Worker(LOCAL_AI_WORKER,{type:'module',name:'tioscore-local-ai'});
 const engine=await webllm.CreateWebWorkerMLCEngine(
  localAiWorker,
  localAiModelId,
  {
   initProgressCallback:p=>{
    const msg=localAiProgressText(p);
    setLocalAiStatus(msg);
    setInlineAiMessage(msg,'info');
   },
   logLevel:'WARN'
  },
  {context_window_size:4096}
 );
 setLocalAiStatus('Verificando Qwen WebGPU…');
 const test=await Promise.race([
  engine.chat.completions.create({messages:[{role:'user',content:'Responde solo: OK'}],temperature:0,max_tokens:5}),
  new Promise((_,reject)=>setTimeout(()=>reject(new Error('La autoprueba WebGPU superó 60 segundos.')),60000))
 ]);
 const probe=String(test?.choices?.[0]?.message?.content||'').trim();
 if(!probe)throw new Error('Qwen WebGPU cargó, pero no produjo texto.');
 localAiBackend='webgpu';
 localAiEngine=engine;
 localAiGpuError='';
 localAiLastError='';
 setLocalAiStatus('Qwen WebGPU verificado · '+localAiModelId,true);
 setInlineAiMessage('Qwen funcionando por WebGPU.','ok');
 const testEl=$('#aiSelfTest');if(testEl){testEl.textContent='Correcta · WebGPU · '+probe.slice(0,20);testEl.className='ok'}
 const modelEl=$('#aiModelActive');if(modelEl)modelEl.textContent=localAiModelId;
 return engine;
}
async function initCpuQwen(reason=''){
 if(reason)setInlineAiMessage('WebGPU no disponible: '+reason+' · iniciando Qwen por CPU/WASM.','info');
 setLocalAiStatus('Preparando Qwen CPU/WASM…');
 const ready=await cpuQwenRequest('init',{},600000);
 localAiBackend='cpu';
 localAiModelId=String(ready.model||'Qwen2.5-0.5B-Instruct')+' · CPU/WASM';
 localAiEngine={kind:'cpu'};
 localAiLastError='';
 setLocalAiStatus('Qwen CPU verificado',true);
 setInlineAiMessage('Qwen funcionando por CPU/WASM.','ok');
 const testEl=$('#aiSelfTest');if(testEl){testEl.textContent='Correcta · CPU/WASM · '+String(ready.probe||'OK').slice(0,20);testEl.className='ok'}
 const modelEl=$('#aiModelActive');if(modelEl)modelEl.textContent=localAiModelId;
 return localAiEngine;
}
async function getLocalAiEngine(){
 if(localAiEngine)return localAiEngine;
 if(localAiPromise)return localAiPromise;
 localAiPromise=(async()=>{
  const hw=await inspectLocalHardware();
  renderHardwareStatus(hw);
  let gpuReason='';
  if(hw.webgpu){
   try{return await initWebGpuQwen(hw)}
   catch(e){
    gpuReason=String(e?.message||e||'fallo WebGPU');
    localAiGpuError=gpuReason;
    if(localAiWorker){try{localAiWorker.terminate()}catch{}}
    localAiWorker=null;
    setInlineAiMessage('Qwen WebGPU falló: '+gpuReason+' · probando CPU/WASM.','info');
   }
  }else{
   gpuReason=hw.detail||'WebGPU no disponible';
   localAiGpuError=gpuReason;
  }
  try{return await initCpuQwen(gpuReason)}
  catch(e){
   const cpuErr=String(e?.message||e||'fallo CPU/WASM');
   localAiLastError='WebGPU: '+gpuReason+' | CPU/WASM: '+cpuErr;
   setLocalAiStatus('Qwen local no disponible');
   setInlineAiMessage(localAiLastError,'error');
   const testEl=$('#aiSelfTest');if(testEl){testEl.textContent='Falló · '+localAiLastError.slice(0,180);testEl.className=''}
   localAiEngine=null;localAiBackend='';
   throw new Error(localAiLastError);
  }
 })();
 try{return await localAiPromise}
 finally{localAiPromise=null}
}
async function warmLocalAI(){
 try{await getLocalAiEngine()}catch{}
}
function cleanLocalJson(s=''){
 const text=String(s||'').trim().replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim();
 const first=text.indexOf('{'),last=text.lastIndexOf('}');
 return first>=0&&last>first?text.slice(first,last+1):text;
}
function normalizeLocalInterpretation(x){
 const v=x&&typeof x==='object'?x:{};
 v.tags=Array.isArray(v.tags)?v.tags:[];
 v.alerts=Array.isArray(v.alerts)?v.alerts:[];
 v.recommendations=Array.isArray(v.recommendations)?v.recommendations:[];
 v.checklist=Array.isArray(v.checklist)?v.checklist:[];
 v.closing=v.closing&&typeof v.closing==='object'?v.closing:{headline:'Conclusión de la lectura',text:''};
 v.followUp=v.followUp&&typeof v.followUp==='object'?v.followUp:{};
 v.followUp.verificationPoints=Array.isArray(v.followUp.verificationPoints)?v.followUp.verificationPoints:[];
 v.followUp.questions=Array.isArray(v.followUp.questions)?v.followUp.questions:[];
 return v;
}
function mergeQwenNarrative(analysis,narrative){
 const base=buildRuleInterpretation(analysis);
 const n=narrative&&typeof narrative==='object'?narrative:{};
 if(n.scoreDescription)base.scoreDescription=String(n.scoreDescription);
 if(n.summary)base.summary=String(n.summary);
 if(n.priorityAction){
  base.recommendations=[{title:'Prioridad principal',text:String(n.priorityAction),impact:'Prioridad 1'},...base.recommendations.filter(r=>r.title!=='Prioridad principal')].slice(0,5);
 }
 if(n.closing)base.closing={headline:'Conclusión de la lectura',text:String(n.closing)};
 if(n.followUpObjective)base.followUp.objective=String(n.followUpObjective);
 if(n.nextQuestion)base.followUp.questions=[String(n.nextQuestion),...(base.followUp.questions||[]).filter(q=>q!==n.nextQuestion)].slice(0,4);
 return normalizeLocalInterpretation(base);
}
function cleanQwenFieldText(value=''){
 return String(value||'')
  .replace(/^[-*#\s]+/,'')
  .replace(/\s+/g,' ')
  .replace(/^["']+|["']+$/g,'')
  .trim();
}
function parseQwenFieldResponse(text=''){
 const raw=String(text||'').replace(/\r/g,'').trim();
 if(!raw)return null;
 const labels=[
  ['scoreDescription','SCORE'],
  ['summary','RESUMEN'],
  ['priorityAction','PRIORIDAD'],
  ['closing','CIERRE'],
  ['followUpObjective','SEGUIMIENTO'],
  ['nextQuestion','PREGUNTA']
 ];
 const out={};
 for(let i=0;i<labels.length;i++){
  const key=labels[i][0],label=labels[i][1];
  const next=labels.slice(i+1).map(x=>x[1]).join('|');
  const tail=next?'(?=\\n\\s*(?:'+next+')\\s*:|$)':'$';
  const re=new RegExp('(?:^|\\n)\\s*'+label+'\\s*:\\s*([\\s\\S]*?)'+tail,'i');
  const m=raw.match(re);
  if(m&&m[1])out[key]=cleanQwenFieldText(m[1]);
 }
 if(!out.summary){
  const stripped=cleanQwenFieldText(raw.replace(/^(SCORE|RESUMEN|PRIORIDAD|CIERRE|SEGUIMIENTO|PREGUNTA)\s*:\s*/gmi,''));
  if(stripped)out.summary=stripped.slice(0,900);
 }
 return Object.keys(out).length?out:null;
}
async function runLocalInterpretation(analysis){
 await getLocalAiEngine();
 const deep=analysis.sourceReport?.analysisMode==='deep'&&analysis.deepAnalysis;
 const payload=JSON.stringify(interpretationPayload(analysis)).slice(0,deep?3400:1700);
 const system='Eres asesor educativo de Tío Score en Perú. Usa únicamente los datos recibidos. No inventes cifras ni prometas aprobación, aumento garantizado del score o eliminación de registros. Responde en español y sin markdown.';
 const focus=deep
  ?'Haz una lectura profunda: compara situación actual con el pico histórico, distingue deuda vigente de vencida y documentos impagos, explica mejoras y riesgos históricos, y prioriza la siguiente acción.'
  :'Haz una lectura rápida: interpreta el estado actual y prioriza la acción más importante.';
 const format='Responde usando exactamente estas seis etiquetas, cada una iniciando una línea: SCORE:, RESUMEN:, PRIORIDAD:, CIERRE:, SEGUIMIENTO:, PREGUNTA:. No uses JSON, llaves, listas ni bloques de código.';
 const user=format+' '+focus+' Sé breve, concreto y útil para una asesoría. DATOS: '+payload;
 const messages=[{role:'system',content:system},{role:'user',content:user}];
 const maxOut=deep?320:220;
 let text='';
 if(localAiBackend==='cpu'){
  const out=await cpuQwenRequest('generate',{messages,maxNewTokens:maxOut},deep?420000:300000);
  text=String(out.text||'');
 }else{
  const reply=await localAiEngine.chat.completions.create({messages,temperature:0,max_tokens:maxOut});
  text=String(reply?.choices?.[0]?.message?.content||'');
 }
 if(!text.trim())throw new Error('Qwen respondió sin contenido.');
 const parsed=parseQwenFieldResponse(text);
 if(!parsed)throw new Error('Qwen respondió, pero no se pudo interpretar el contenido.');
 return mergeQwenNarrative(analysis,parsed);
}
function generateLocalInterpretation(analysis){
 const job=()=>runLocalInterpretation(analysis);
 const current=localAiQueue.then(job,job);
 localAiQueue=current.catch(()=>{});
 return current;
}

async function processPdf(file,{background=false}={}){
 state.processUi=background?'drawer':'initial';
 const analysisMode=state.analysisMode==='fast'?'fast':'deep';
 setReportReadProgress(1);
 if(!background)setAiWorkStatus('waiting','IA en espera',true);
 if(background){
  showDrawerProcessing(file);
 }else{
  $('#uploadState').classList.remove('hidden');
  updateProcessTitle('Leyendo '+file.name);
  updateProcessDetail('Extrayendo datos del reporte…');
 }

 let localShown=false;
 try{
  const extracted=await extractPdfHybrid(file);
  if(extracted.text.length<100)throw new Error('No se logró obtener suficiente contenido legible del reporte.');

  setReportReadProgress(96);
  const parsed=parseCreditReport(extracted.text,{
   totalPages:extracted.totalPages,
   digitalPages:extracted.digitalPages,
   visualPages:extracted.visualPages,
   analysisMode
  });
  const local=parsed.analysis;
  local.sourceReport.extractionMode=extracted.visualPages>0?'Híbrida (texto + OCR local)':'Texto digital';
  local.sourceReport.totalPages=extracted.totalPages;
  local.sourceReport.visualPages=extracted.visualPages;
  local.sourceReport.readProgress=100;
  setReportReadProgress(100);
  local.sourceReport.interpretationEngine='Reglas locales · respuesta inmediata';

  // Mostrar el análisis completo por reglas inmediatamente. Qwen NO bloquea la ficha.
  localShown=true;
  loadAnalysis(local,false,file.name,{skipReveal:false,skipHistory:true});
  $('#analysisMeta').textContent='Reporte leído 100% · '+(analysisMode==='deep'?'lectura profunda lista · ':'')+'IA local mejorando en segundo plano';
  setWorkspaceReadProgress(100);
  setAiWorkStatus('processing','IA mejorando',true);
  updateProcessTitle('Análisis listo');
  updateProcessDetail(analysisMode==='deep'?'Historial y evolución analizados. Qwen está refinando la asesoría profunda en segundo plano…':'Datos visibles. Qwen rápido está mejorando interpretación, plan y seguimiento en segundo plano…');

  // IndexedDB es local y rápido; guarda la versión inmediata.
  await saveToHistory(file.name);
  const analysisHistoryId=state.currentHistoryId;

  if(background){
   state.drawerProcessing=false;
   setTimeout(()=>closeNewAnalysisDrawer(true),120);
  }

  // La IA continúa sin bloquear la carga ni el siguiente paso del asesor.
  generateLocalInterpretation(local).then(async interpretation=>{
   Object.assign(local,interpretation);
   local.confidence=parsed.parserConfidence;
   local.sourceReport.interpretationEngine='IA local · '+(localAiModelId||'Qwen local');
   local.sourceReport.interpretationError='';
   local.sourceReport.parserMode=parsed.parserConfidence>=70
    ?'Parser local + '+(localAiModelId||'Qwen rápido')
    :'Parser/OCR parcial + '+(localAiModelId||'Qwen rápido');

   if(state.analysis===local){
    loadAnalysis(local,false,file.name,{skipReveal:true,skipHistory:true,keepHistoryId:true});
    $('#analysisMeta').textContent='Reporte leído 100% · IA completada · '+dateNow();
    setWorkspaceReadProgress(100);
    setAiWorkStatus('done',localAiBackend==='cpu'?'IA lista · CPU':'IA lista · GPU',true);
    setInlineAiMessage('Qwen completó la interpretación por '+(localAiBackend==='cpu'?'CPU/WASM':'WebGPU')+'.','ok');
   }
   await persistHistoryAnalysis(analysisHistoryId,local).catch(()=>{});
  }).catch(err=>{
   const aiErr=String(err?.message||err||'IA local no disponible');
   local.sourceReport.interpretationEngine='Reglas locales';
   local.sourceReport.interpretationError=aiErr;
   local.sourceReport.parserMode=parsed.parserConfidence>=70
    ?'Parser local · reglas rápidas'
    :'Parser/OCR parcial · reglas rápidas';
   setLocalAiStatus('Reglas activas · Qwen no disponible');
   setInlineAiMessage(aiErr,'error');
   const self=$('#aiSelfTest');if(self)self.textContent='Falló · '+aiErr.slice(0,120);
   if(state.analysis===local){renderInterpretationEngine(local);setWorkspaceReadProgress(100);setAiWorkStatus('fallback','Reglas locales',true);$('#analysisMeta').textContent='Reporte leído 100% · IA local no disponible';}
   persistHistoryAnalysis(analysisHistoryId,local).catch(()=>{});
  });
 }catch(err){
  if(background){
   if(localShown){
    state.drawerProcessing=false;
    closeNewAnalysisDrawer(true);
   }else showDrawerError(err.message);
  }else{
   updateProcessTitle('No se pudo completar la lectura');
   updateProcessDetail(friendlyAnalysisError(err.message));
  }
 }
}

function quickTextReady(text=''){
 const s=String(text);
 if(s.length<350)return false;
 const hasIdentity=/(?:dni|documento|titular|nombre|ruc)/i.test(s);
 const hasScore=/(?:score|experian|puntaje|calificaci[oó]n)/i.test(s);
 return (hasIdentity&&hasScore)||s.length>=6000;
}

async function parallelMapLimit(items,limit,worker){
 if(!items.length)return;
 let next=0;
 const count=Math.min(Math.max(1,limit),items.length);
 const runners=Array.from({length:count},async()=>{
  while(true){
   const i=next++;
   if(i>=items.length)return;
   await worker(items[i],i);
  }
 });
 await Promise.all(runners);
}

async function extractPdfHybrid(file,{onQuickText}={}){
 const pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
 const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
 const totalPages=Math.min(pdf.numPages,60);
 setReportReadProgress(5);
 const pages=Array(totalPages).fill('');
 const visualJobs=[];
 let digitalPages=0,visualPages=0,quickTriggered=false;

 const maybeStartQuick=()=>{
  if(quickTriggered||typeof onQuickText!=='function')return;
  const partial=pages.filter(Boolean).join('\n\n');
  if(!quickTextReady(partial))return;
  quickTriggered=true;
  Promise.resolve(onQuickText(partial.slice(0,90000))).catch(()=>{});
 };

 for(let i=1;i<=totalPages;i++){
  updateProcessDetail('Página '+i+' de '+totalPages+' · detectando texto…');
  const page=await pdf.getPage(i);
  const content=await page.getTextContent();
  const digitalText=content.items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();

  if(isDigitalTextUseful(digitalText,content.items)){
   digitalPages++;
   pages[i-1]='--- PÁGINA '+i+' · TEXTO DIGITAL ---\n'+digitalText;
   maybeStartQuick();
  }else{
   visualPages++;
   visualJobs.push({page,pageNumber:i,index:i-1});
  }
  setReportReadProgress(5+(i/Math.max(totalPages,1))*45);
 }

 if(visualJobs.length){
  let done=0;
  setReportReadProgress(52);
  updateProcessDetail('OCR local: preparando lectura de '+visualPages+' página'+(visualPages===1?'':'s')+' sin tokens…');
  await getOcrScheduler();
  const ocrParallel=(Number(navigator.hardwareConcurrency)||2)>=8&&(Number(navigator.deviceMemory)||0)>=8?3:2;
  await parallelMapLimit(visualJobs,ocrParallel,async job=>{
   const image=await renderPageForVision(job.page);
   const visualText=await readPageWithOcr(image,job.pageNumber);
   pages[job.index]='--- PÁGINA '+job.pageNumber+' · OCR LOCAL ---\n'+visualText;
   done++;
   setReportReadProgress(52+(done/Math.max(visualPages,1))*40);
   updateProcessDetail('OCR local '+done+' de '+visualPages+' · procesamiento en este navegador…');
   maybeStartQuick();
  });
 }else{
  setReportReadProgress(92);
 }

 setReportReadProgress(94);
 const text=pages.filter(Boolean).join('\n\n').slice(0,240000);
 if(!quickTriggered&&typeof onQuickText==='function'&&text.length>=100){
  quickTriggered=true;
  Promise.resolve(onQuickText(text.slice(0,90000))).catch(()=>{});
 }

 return {text,totalPages,digitalPages,visualPages};
}

function isDigitalTextUseful(text,items){
 if(text.length>=220)return true;
 if(text.length>=90&&items.length>=18)return true;
 const financialSignals=(text.match(/(?:S\/|soles|deuda|saldo|banco|entidad|normal|mora|cr[eé]dito|clasificaci[oó]n|sentinel)/gi)||[]).length;
 return text.length>=70&&financialSignals>=3;
}

async function renderPageForVision(page){
 const base=page.getViewport({scale:1});
 const targetWidth=base.width>0?Math.min(1500,Math.max(1050,base.width*1.55)):1300;
 const scale=targetWidth/base.width;
 const viewport=page.getViewport({scale});
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d',{alpha:false});
 canvas.width=Math.ceil(viewport.width);
 canvas.height=Math.ceil(viewport.height);
 ctx.fillStyle='#ffffff';
 ctx.fillRect(0,0,canvas.width,canvas.height);
 await page.render({canvasContext:ctx,viewport}).promise;

 let quality=.70;
 let image=canvas.toDataURL('image/jpeg',quality);
 while(image.length>2_100_000&&quality>.46){
  quality-=.08;
  image=canvas.toDataURL('image/jpeg',quality);
 }
 if(image.length>2_350_000){
  const shrink=document.createElement('canvas');
  const ratio=Math.sqrt(1_900_000/image.length);
  shrink.width=Math.max(760,Math.floor(canvas.width*ratio));
  shrink.height=Math.max(980,Math.floor(canvas.height*ratio));
  const sctx=shrink.getContext('2d',{alpha:false});
  sctx.fillStyle='#fff';sctx.fillRect(0,0,shrink.width,shrink.height);
  sctx.drawImage(canvas,0,0,shrink.width,shrink.height);
  image=shrink.toDataURL('image/jpeg',.64);
 }
 return image;
}

let tesseractLoader=null;
let ocrScheduler=null;
let ocrSchedulerPromise=null;
let ocrJobCount=0;

async function ensureTesseract(){
 if(window.Tesseract)return window.Tesseract;
 if(!tesseractLoader){
  tesseractLoader=new Promise((resolve,reject)=>{
   const existing=document.querySelector('script[data-tesseract-local]');
   if(existing){
    existing.addEventListener('load',()=>window.Tesseract?resolve(window.Tesseract):reject(new Error('OCR local no disponible.')),{once:true});
    existing.addEventListener('error',()=>reject(new Error('No se pudo cargar el motor OCR local.')),{once:true});
    return;
   }
   const s=document.createElement('script');
   s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
   s.async=true;
   s.dataset.tesseractLocal='1';
   s.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(new Error('OCR local no disponible.'));
   s.onerror=()=>reject(new Error('No se pudo cargar el motor OCR local.'));
   document.head.appendChild(s);
  });
 }
 return tesseractLoader;
}

async function getOcrScheduler(){
 if(ocrScheduler&&ocrJobCount<300)return ocrScheduler;
 if(ocrSchedulerPromise)return ocrSchedulerPromise;
 ocrSchedulerPromise=(async()=>{
  if(ocrScheduler){
   try{await ocrScheduler.terminate()}catch{}
   ocrScheduler=null;
  }
  const T=await ensureTesseract();
  const scheduler=T.createScheduler();
  const cores=Math.max(1,Number(navigator.hardwareConcurrency)||2);
  const mem=Math.max(0,Number(navigator.deviceMemory)||0);
  const workerCount=cores>=8&&mem>=8?3:cores>=4?2:1;
  updateProcessDetail('OCR local · cargando motor en español…');
  for(let i=0;i<workerCount;i++){
   const worker=await T.createWorker('spa',1,{
    logger:m=>{
     if(m?.status==='recognizing text'&&Number.isFinite(m.progress)){
      updateProcessDetail('OCR local · '+Math.round(m.progress*100)+'%');
     }
    }
   });
   scheduler.addWorker(worker);
  }
  ocrScheduler=scheduler;
  ocrJobCount=0;
  return scheduler;
 })();
 try{return await ocrSchedulerPromise}
 finally{ocrSchedulerPromise=null}
}

async function readPageWithOcr(image,page){
 const scheduler=await getOcrScheduler();
 try{
  const result=await scheduler.addJob('recognize',image);
  ocrJobCount++;
  const text=String(result?.data?.text||'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
  return text||'[Página sin contenido legible por OCR]';
 }catch{
  throw new Error('El OCR local no pudo leer la página '+page+'.');
 }
}

function renderInterpretationEngine(x){
 const el=$('#interpretationEngineBadge');if(!el)return;
 const engine=x?.sourceReport?.interpretationEngine||'Reglas locales';
 const isAI=/IA local/i.test(engine),prelim=/respuesta inmediata/i.test(engine);
 el.textContent=isAI?'IA local':prelim?'Preliminar':'Reglas locales';
 el.className='engine-badge '+(isAI?'engine-ai':'engine-rules');
 const err=x?.sourceReport?.interpretationError||'';
 el.title=isAI?'Interpretación generada por Qwen local.':prelim?'Lectura preliminar mientras Qwen trabaja en segundo plano.':(err?'Qwen no completó la generación: '+err:'Interpretación generada con reglas locales.');
}
function loadQuickAnalysis(a,filename=''){
 state.analysis=normalize(a);const x=state.analysis;
 const quickSafeName=sanitizePersonName(x.client?.name||'');if(x.client)x.client.name=quickSafeName||'Cliente';
 $('#uploadPanel').classList.add('hidden');$('#resultPanel').classList.remove('hidden');
 $('#reportTypeBadge').textContent=[x.sourceReport.provider||'Sentinel',x.sourceReport.type||'Reporte detectado'].filter(Boolean).join(' · ');
 $('#analysisMeta').textContent='Vista rápida · completando análisis…';
 renderInterpretationEngine(x);
 syncAnalysisProgress(x);
 $('#confidenceValue').textContent='Lectura preliminar '+(x.confidence||0)+'%';
 const visibleName=firstName(x.client.name||'Cliente');
 $('#clientName').textContent=visibleName;
 $('#clientSubline').textContent=[x.client.document||'Documento protegido',x.client.age,x.client.reportDate].filter(Boolean).join(' · ');
 const scoreInfo=renderScoreGauge(x.score);
 setScoreFace($('#clientScoreFace'),x.score);
 $('#riskBadge').textContent=scoreInfo.category;
 $('#scoreDescription').textContent=x.scoreDescription||'Completando interpretación del reporte…';
 $('#debtDelta').textContent='Completando evolución de deuda…';
 $('#executiveSummary').textContent=x.summary||'Completando lectura financiera…';
 $('#summaryTags').innerHTML=x.tags.map(t=>'<span>'+esc(t)+'</span>').join('');
 $('#alertsGrid').innerHTML='<div class="empty-line">Completando alertas y fortalezas…</div>';
 $('#recommendations').innerHTML='<div class="empty-line" style="color:#cbd2cc">Preparando recomendaciones…</div>';
 $('#closingHeadline').textContent='Análisis en curso';
 $('#closingText').textContent='La información detallada aparecerá automáticamente al terminar.';
 $('#checklist').innerHTML='';
 $('#checkProgress').textContent='0 / 0';
 renderFollowUp({timeframe:'Preparando…',objective:'Generando seguimiento personalizado…',nextReview:'',verificationPoints:[],questions:[]});
 renderDeepAnalysis(x.deepAnalysis,x.sourceReport?.analysisMode||'fast');
 renderData(x.raw);
 $('#entitiesTable').innerHTML='<div class="empty-line" style="padding:10px">Completando entidades…</div>';
 $('#obligationsTable').innerHTML='<div class="empty-line" style="padding:10px">Completando obligaciones…</div>';
 $('#inquiriesList').innerHTML='<div class="empty-line">Completando consultas…</div>';
 $('#reportSections').innerHTML='<div class="empty-line">Completando información adicional…</div>';
 $('#metricsGrid').innerHTML='<div class="empty-line">Completando cifras clave…</div>';
 renderReportCharts(x);
 renderCoverage(x);
 if(Number(x.score)>0)runScoreReveal(x.score);
}

function loadAnalysis(a,isDemo=false,filename='',options={}){
 if(options.historyId)state.currentHistoryId=options.historyId;else if(!isDemo&&!options.keepHistoryId)state.currentHistoryId=null;
 state.analysis=normalize(a);const x=state.analysis;
 const fullSafeName=sanitizePersonName(x.client?.name||'');if(x.client)x.client.name=fullSafeName||'Cliente';
 $('#uploadPanel').classList.add('hidden');$('#resultPanel').classList.remove('hidden');
 $('#reportTypeBadge').textContent=[x.sourceReport.provider||'Sentinel',x.sourceReport.type||'Reporte detectado'].filter(Boolean).join(' · ');
 $('#analysisMeta').textContent=(isDemo?'Demo':'Procesado')+' · '+dateNow();
 renderInterpretationEngine(x);
 syncAnalysisProgress(x);
 $('#confidenceValue').textContent='Confianza '+(x.confidence||0)+'%';
 const visibleName=firstName(x.client.name||'Cliente');
 $('#clientName').textContent=visibleName;
 $('#clientSubline').textContent=[x.client.document,x.client.age,x.client.reportDate].filter(isMeaningfulDisplayValue).join(' · ');
 const scoreInfo=renderScoreGauge(x.score);
 setScoreFace($('#clientScoreFace'),x.score);
 $('#riskBadge').textContent=scoreInfo.category;
 $('#scoreDescription').textContent=isMeaningfulDisplayValue(x.scoreDescription)?x.scoreDescription:'';
 const dc=Number(x.debtChange),deltaEl=$('#debtDelta');if(deltaEl){const hasDelta=Number.isFinite(dc)&&dc!==0;deltaEl.textContent=hasDelta?(dc<0?'↓ Deuda -':'↑ Deuda +')+Math.abs(dc).toFixed(2)+'%':'';deltaEl.classList.toggle('hidden',!hasDelta)}
 $('#executiveSummary').textContent=isMeaningfulDisplayValue(x.summary)?x.summary:'';
 $('#summaryTags').innerHTML=x.tags.map(t=>'<span>'+esc(t)+'</span>').join('');
 $('#alertsGrid').innerHTML=x.alerts.map(v=>'<div class="alert '+esc(v.level)+'"><div class="alert-top"><i class="alert-dot"></i><b>'+esc(v.title)+'</b></div><p>'+esc(v.text)+'</p></div>').join('')||'<div class="empty-line">Sin alertas identificadas.</div>';
 renderRecommendations(x.recommendations);$('#closingHeadline').textContent=isMeaningfulDisplayValue(x.closing.headline)?x.closing.headline:'Conclusión';$('#closingText').textContent=isMeaningfulDisplayValue(x.closing.text)?x.closing.text:'';
 renderChecklist(x.checklist);renderFollowUp(x.followUp);renderDeepAnalysis(x.deepAnalysis,x.sourceReport?.analysisMode||'fast');renderData(x.raw);renderEntities(x.entities);renderObligations(x.obligations);renderInquiries(x.inquiries);renderSections(x.reportSections);
 renderMetrics(x.metrics);renderReportCharts(x);renderCoverage(x);
 $('#advisorNotes').value=x.notes||'';
 if(!isDemo&&!options.skipHistory)saveToHistory(filename);
 if(!options.skipReveal)runScoreReveal(x.score);
}
function getScoreBand(score){
 const s=Number(score)||0;
 if(s>=877)return {index:4,category:'Excelente Puntaje',range:'Score: 877-999'};
 if(s>=722)return {index:3,category:'Buen Puntaje',range:'Score: 722-876'};
 if(s>=598)return {index:2,category:'Puntaje medio',range:'Score: 598-721'};
 if(s>=477)return {index:1,category:'Puntaje Bajo',range:'Score: 477-597'};
 if(s>=1)return {index:0,category:'Puntaje Muy Bajo',range:'Score: 1-476'};
 return {index:-1,category:'Puntaje por revisar',range:'Score: —'};
}

function scoreFaceClass(score){
 const info=getScoreBand(score);
 return info.index>=0?'face-c'+(info.index+1):'face-unrated';
}
function setScoreFace(el,score){
 if(!el)return;
 el.classList.remove('face-c1','face-c2','face-c3','face-c4','face-c5','face-unrated');
 el.classList.add(scoreFaceClass(score));
 const info=getScoreBand(score);
 el.setAttribute('aria-label',info.category);
}
function runScoreReveal(score){
 const panel=$('#resultPanel');
 const overlay=$('#scoreRevealOverlay');
 const face=$('#revealScoreFace');
 const label=$('#revealScoreCategory');
 if(!panel||!overlay||!face)return;

 clearTimeout(state.revealTimer);
 clearTimeout(state.revealHideTimer);

 setScoreFace(face,score);
 if(label)label.textContent=getScoreBand(score).category;

 panel.classList.add('revealing');
 overlay.classList.remove('hidden','is-leaving','is-animating');
 overlay.setAttribute('aria-hidden','false');

 requestAnimationFrame(()=>{
  requestAnimationFrame(()=>overlay.classList.add('is-animating'));
 });

 state.revealTimer=setTimeout(()=>{
  panel.classList.remove('revealing');
  overlay.classList.remove('is-animating');
  overlay.classList.add('is-leaving');

  state.revealHideTimer=setTimeout(()=>{
   overlay.classList.add('hidden');
   overlay.classList.remove('is-leaving');
   overlay.setAttribute('aria-hidden','true');
  },300);
 },1580);
}

function polar(cx,cy,r,deg){
 const rad=deg*Math.PI/180;
 return {x:cx+r*Math.cos(rad),y:cy-r*Math.sin(rad)};
}
function ringSegmentPath(cx,cy,outer,inner,a1,a2){
 const p1=polar(cx,cy,outer,a1),p2=polar(cx,cy,outer,a2);
 const p3=polar(cx,cy,inner,a2),p4=polar(cx,cy,inner,a1);
 return [
  'M',p1.x.toFixed(2),p1.y.toFixed(2),
  'A',outer,outer,0,0,1,p2.x.toFixed(2),p2.y.toFixed(2),
  'L',p3.x.toFixed(2),p3.y.toFixed(2),
  'A',inner,inner,0,0,0,p4.x.toFixed(2),p4.y.toFixed(2),
  'Z'
 ].join(' ');
}
function renderScoreGauge(score){
 const info=getScoreBand(score);
 const svg=$('#scoreGaugeSvg');
 const s=Math.max(0,Math.min(999,Number(score)||0));
 if(svg){
  const cx=160,cy=158,outer=126,inner=92,gap=3.2;
  let out='';
  for(let i=0;i<5;i++){
   const a1=180-i*36-gap/2;
   const a2=180-(i+1)*36+gap/2;
   const active=i<=info.index;
   out+='<path class="score-segment score-c'+(i+1)+' '+(active?'active':'inactive')+'" d="'+ringSegmentPath(cx,cy,outer,inner,a1,a2)+'"></path>';
  }
  svg.innerHTML=out;
 }
 $('#scoreValue').textContent=s||'—';
 $('#scoreCategory').textContent=info.category;
 $('#scoreRange').textContent=info.range;
 return info;
}


function isMeaningfulDisplayValue(value){
 if(value===0)return true;
 if(value==null)return false;
 const s=String(value).trim();
 if(!s)return false;
 if(/^(?:n\/a|null|undefined|—|-)$/i.test(s))return false;
 if(/^no\s+(?:informad[oa]|determinad[oa]|disponible|registrad[oa])(?:\s+.*)?$/i.test(s))return false;
 if(/^sin\s+(?:informaci[oó]n|datos)\s+(?:disponible|suficiente|estructurad[oa])(?:\s+.*)?$/i.test(s))return false;
 return true;
}
function toggleBlock(selector,show){
 const el=$(selector);if(el)el.classList.toggle('hidden',!show);
}
function cleanDisplayItems(items=[]){
 return items.filter(x=>x&&isMeaningfulDisplayValue(x.value));
}
function normalize(a){
 const x=a||{};x.sourceReport=x.sourceReport||{};x.client=x.client||{};x.alerts=Array.isArray(x.alerts)?x.alerts:[];x.tags=Array.isArray(x.tags)?x.tags:[];
 x.metrics=Array.isArray(x.metrics)?x.metrics:[];x.debtSeries=Array.isArray(x.debtSeries)?x.debtSeries:[];x.debtComposition=Array.isArray(x.debtComposition)?x.debtComposition:[];x.creditLines=Array.isArray(x.creditLines)?x.creditLines:[];
 x.monthlyBehavior=Array.isArray(x.monthlyBehavior)?x.monthlyBehavior:[];x.entities=Array.isArray(x.entities)?x.entities:[];x.obligations=Array.isArray(x.obligations)?x.obligations:[];
 x.inquiries=Array.isArray(x.inquiries)?x.inquiries:[];x.recommendations=Array.isArray(x.recommendations)?x.recommendations:[];x.checklist=Array.isArray(x.checklist)?x.checklist:[];
 x.raw=x.raw&&typeof x.raw==='object'?x.raw:{};x.reportSections=Array.isArray(x.reportSections)?x.reportSections:[];x.closing=x.closing||{};x.followUp=x.followUp&&typeof x.followUp==='object'?x.followUp:{};x.followUp.verificationPoints=Array.isArray(x.followUp.verificationPoints)?x.followUp.verificationPoints:[];x.followUp.questions=Array.isArray(x.followUp.questions)?x.followUp.questions:[];x.deepAnalysis=x.deepAnalysis&&typeof x.deepAnalysis==='object'?x.deepAnalysis:null;if(x.deepAnalysis){x.deepAnalysis.signals=Array.isArray(x.deepAnalysis.signals)?x.deepAnalysis.signals:[];x.deepAnalysis.recent=Array.isArray(x.deepAnalysis.recent)?x.deepAnalysis.recent:[];x.deepAnalysis.history=Array.isArray(x.deepAnalysis.history)?x.deepAnalysis.history:[];}
 x.reportCharts=x.reportCharts&&typeof x.reportCharts==='object'?x.reportCharts:{};
 for(const k of ['noteEvolution','classificationHistory','overdueByType','overdueShare','currentVsOverdue','institutionShare'])if(!Array.isArray(x.reportCharts[k]))x.reportCharts[k]=[];
 return x
}
function renderRecommendations(items){$('#recommendations').innerHTML=items.map((r,i)=>'<div class="rec"><div class="rec-num">'+(i+1)+'</div><div><h4>'+esc(r.title)+'</h4><p>'+esc(r.text)+'</p><span class="impact">'+esc(r.impact||'')+'</span></div></div>').join('')||'<div class="empty-line">Sin recomendaciones suficientes.</div>'}
function renderChecklist(items){
 state.analysis=state.analysis||{};
 state.analysis.checkState=state.analysis.checkState&&typeof state.analysis.checkState==='object'?state.analysis.checkState:{};
 $('#checklist').innerHTML=items.map((t,i)=>'<label class="check '+(state.analysis.checkState[i]?'done':'')+'"><input type="checkbox" data-i="'+i+'" '+(state.analysis.checkState[i]?'checked':'')+'><span>'+esc(t)+'</span></label>').join('');
 $$('#checklist input').forEach(v=>v.addEventListener('change',()=>{
  v.closest('.check').classList.toggle('done',v.checked);
  state.analysis.checkState[v.dataset.i]=v.checked;
  updateCheck();
  persistCurrentHistory().catch(()=>{});
 }));
 updateCheck();
}
function renderFollowUp(f={}){
 const timing=$('#followUpTiming');if(timing){timing.textContent=isMeaningfulDisplayValue(f.timeframe)?f.timeframe:'';timing.classList.toggle('hidden',!isMeaningfulDisplayValue(f.timeframe))}
 const objective=$('#followUpObjective');if(objective)objective.textContent=isMeaningfulDisplayValue(f.objective)?f.objective:'';
 const next=$('#followUpReview');if(next)next.textContent=isMeaningfulDisplayValue(f.nextReview)?f.nextReview:'';
 const pts=(f.verificationPoints||[]).filter(isMeaningfulDisplayValue);
 const qs=(f.questions||[]).filter(isMeaningfulDisplayValue);
 const points=$('#followUpPoints');if(points)points.innerHTML=pts.map(x=>'<li>'+esc(x)+'</li>').join('');
 const questions=$('#followUpQuestions');if(questions)questions.innerHTML=qs.map(x=>'<li>'+esc(x)+'</li>').join('');
 const hasFollow=isMeaningfulDisplayValue(f.timeframe)||isMeaningfulDisplayValue(f.objective)||isMeaningfulDisplayValue(f.nextReview)||pts.length||qs.length;
 toggleBlock('.followup-block',Boolean(hasFollow));
}
function renderDeepAnalysis(deep,mode='fast'){
 const grid=$('#deepSummaryGrid'),signals=$('#deepSignals'),recent=$('#deepHistoryRecent'),badge=$('#deepAnalysisBadge');
 if(badge)badge.textContent=mode==='deep'?'Profundo':'Rápido';
 if(!grid||!signals||!recent)return;
 if(mode!=='deep'||!deep){
  toggleBlock('.deep-analysis-block',false);
  grid.innerHTML='';signals.innerHTML='';recent.innerHTML='';
  return;
 }
 const stats=[];
 const stat=(label,value,cls='')=>stats.push('<div class="deep-stat '+cls+'"><small>'+esc(label)+'</small><b>'+esc(value)+'</b></div>');
 if(deep.observations>0)stat('Registros históricos',String(deep.observations));
 if(deep.currentFinancialDebt!=null)stat('Deuda financiera actual',reportMoney(deep.currentFinancialDebt),Number(deep.currentFinancialDebt)>0?'':'good');
 if(deep.peakDebt!=null&&deep.peakDebt>0)stat('Pico histórico',reportMoney(deep.peakDebt)+(deep.peakDebtDate?' · '+deep.peakDebtDate:''),'warn');
 if(deep.debtReductionFromPeak!=null)stat('Reducción desde pico',Number(deep.debtReductionFromPeak).toFixed(1)+'%',Number(deep.debtReductionFromPeak)>0?'good':'');
 if(deep.currentOverdueSbs!=null)stat('Vencido SBS actual',reportMoney(deep.currentOverdueSbs),Number(deep.currentOverdueSbs)>0?'bad':'good');
 if(deep.currentUnpaidDocs!=null)stat('Documentos impagos',reportMoney(deep.currentUnpaidDocs),Number(deep.currentUnpaidDocs)>0?'bad':'good');
 grid.innerHTML=stats.join('');
 signals.innerHTML=(deep.signals||[]).map(s=>'<div class="deep-signal '+esc(s.level||'warn')+'"><div><b>'+esc(s.title||'Señal')+'</b><p>'+esc(s.text||'')+'</p></div></div>').join('');
 const rows=(deep.recent||[]).slice(0,8);
 recent.innerHTML=rows.length?'<div class="deep-history-row head"><span>Fecha</span><span>Deuda</span><span>Vencidos</span><span>Semáforo</span></div>'+rows.map(r=>'<div class="deep-history-row"><span>'+esc(r.date)+'</span><b>'+esc(reportMoney(r.totalDebt))+'</b><span>'+esc(reportMoney((r.overdueSbs||0)+(r.unpaidDocs||0)))+'</span><span>'+esc(r.signal>2?'Rojo':r.signal>=.001?'Amarillo':'Verde')+'</span></div>').join(''):'';
 toggleBlock('.deep-analysis-block',Boolean(stats.length||signals.innerHTML||rows.length));
}
function updateCheck(){const all=$$('#checklist input'),done=all.filter(x=>x.checked).length;$('#checkProgress').textContent=done+' / '+all.length}
function renderData(data){
 const rows=Object.entries(data)
  .filter(([k,v])=>!isSurnameLabel(k)&&isMeaningfulDisplayValue(v))
  .map(([k,v])=>{
   const safe=clientSafeValue(k,v);
   if(!isMeaningfulDisplayValue(safe))return '';
   return '<div class="data-item" data-key="'+esc(k)+'"><span>'+esc(labelEs(k))+'</span><b>'+esc(safe)+'</b></div>';
  }).filter(Boolean);
 $('#detectedData').innerHTML=rows.join('');
 toggleBlock('#detectedDataSection',rows.length>0);
}
$('#editDataBtn')?.addEventListener('click',()=>{if(!state.analysis)return;state.editing=!state.editing;$('#editDataBtn').textContent=state.editing?'Guardar':'Editar datos';$$('#detectedData .data-item').forEach(el=>{const key=el.dataset.key,b=el.querySelector('b');if(state.editing)b.outerHTML='<input value="'+esc(state.analysis.raw[key])+'">';else{const i=el.querySelector('input');state.analysis.raw[key]=i.value;i.outerHTML='<b>'+esc(i.value)+' *</b>'}})});
function clsStatus(s=''){s=s.toLowerCase();return /normal|al día|vigente|cancelad|detectada/.test(s)?'status-good':/mora|vencid|impag|castig|pérdida|pendiente/.test(s)?'status-bad':'status-warn'}
function renderEntities(items){
 const clean=(items||[]).filter(v=>v&&isMeaningfulDisplayValue(v.name));
 $('#entityCount').textContent=clean.length+' registros';
 toggleBlock('#entitiesSection',clean.length>0);
 if(!clean.length){$('#entitiesTable').innerHTML='';return}
 $('#entitiesTable').innerHTML='<div class="table-row head"><span>Entidad / producto</span><span>Saldo</span><span>Estado</span></div>'+clean.map(v=>{
  const balance=isMeaningfulDisplayValue(v.balance)?esc(v.balance):'';
  const status=isMeaningfulDisplayValue(v.status)?v.status:isMeaningfulDisplayValue(v.classification)?v.classification:'Detectada';
  return '<div class="table-row"><b>'+esc(v.name)+(v.product?' · '+esc(v.product):'')+'</b><span>'+balance+'</span><span class="'+clsStatus(status)+'">'+esc(status)+'</span></div>';
 }).join('');
}
function renderObligations(items){
 const clean=(items||[]).filter(v=>v&&isMeaningfulDisplayValue(v.entity)&&isMeaningfulDisplayValue(v.balance));
 toggleBlock('#obligationsSection',clean.length>0);
 if(!clean.length){$('#obligationsTable').innerHTML='';return}
 $('#obligationsTable').innerHTML='<div class="table-row head"><span>Obligación</span><span>Saldo</span><span>Estado</span></div>'+clean.map(v=>'<div class="table-row"><b>'+esc(v.entity)+(v.product?' · '+esc(v.product):'')+(v.detail?'<small style="display:block;color:#667085;font-weight:400">'+esc(v.detail)+'</small>':'')+'</b><span>'+esc(v.balance)+'</span><span class="'+clsStatus(v.status||'')+'">'+esc(v.status||'')+'</span></div>').join('');
}
function renderInquiries(items){
 const clean=(items||[]).filter(v=>v&&(isMeaningfulDisplayValue(v.date)||isMeaningfulDisplayValue(v.entity)||isMeaningfulDisplayValue(v.type)));
 toggleBlock('#inquiriesSection',clean.length>0);
 if(!clean.length){$('#inquiriesList').innerHTML='';return}
 $('#inquiriesList').innerHTML=clean.map(v=>'<div class="timeline-item">'+(isMeaningfulDisplayValue(v.date)?'<time>'+esc(v.date)+'</time>':'')+'<div>'+(isMeaningfulDisplayValue(v.entity)?'<b>'+esc(v.entity)+'</b>':'')+(isMeaningfulDisplayValue(v.type)?'<small>'+esc(v.type)+'</small>':'')+'</div></div>').join('');
}
function renderSections(sections){
 const html=(sections||[]).map(s=>{
  const items=(Array.isArray(s.items)?s.items:[])
   .filter(i=>!isSurnameLabel(i.label)&&isMeaningfulDisplayValue(i.value))
   .map(i=>{
    const safe=clientSafeValue(i.label,i.value);
    return isMeaningfulDisplayValue(safe)?'<div class="kv"><dt>'+esc(labelEs(i.label))+'</dt><dd>'+esc(safe)+'</dd></div>':'';
   }).filter(Boolean).join('');
  return items?'<div class="report-section"><h4>'+esc(labelEs(s.title||'Sección'))+'</h4><dl>'+items+'</dl></div>':'';
 }).filter(Boolean).join('');
 toggleBlock('#reportSectionsSection',Boolean(html));
 $('#reportSections').innerHTML=html;
}
function renderMetrics(items){
 const clean=(items||[]).filter(m=>m&&isMeaningfulDisplayValue(m.value));
 $('#metricsGrid').innerHTML=clean.map(m=>'<div class="metric '+(m.danger?'danger':'')+'"><b>'+esc(m.value)+'</b><span>'+esc(m.label)+'</span></div>').join('');
 toggleBlock('.metrics-block',clean.length>0);
}
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

function chartEmpty(svg){
 if(svg)svg.innerHTML='';
}
function gridLines(w,h,p,yTicks=4){
 let out='';
 for(let i=0;i<=yTicks;i++){const y=p+i*((h-p*2)/yTicks);out+='<line class="sentinel-grid" x1="'+p+'" x2="'+(w-p)+'" y1="'+y+'" y2="'+y+'"/>'}
 out+='<line class="sentinel-axis" x1="'+p+'" x2="'+p+'" y1="'+p+'" y2="'+(h-p)+'"/>';
 out+='<line class="sentinel-axis" x1="'+p+'" x2="'+(w-p)+'" y1="'+(h-p)+'" y2="'+(h-p)+'"/>';
 return out;
}
function renderNoteEvolution(items){
 const svg=$('#noteEvolutionChart');if(!svg)return;
 if(!items.length){chartEmpty(svg);return}
 const w=760,h=260,p=34,vals=items.map(v=>Number(v.value)||0),max=Math.max(4,Math.ceil(Math.max(...vals)));
 const pts=items.map((v,i)=>({x:p+i*((w-p*2)/(items.length-1||1)),y:h-p-(Number(v.value)||0)/max*(h-p*2),...v}));
 const line=pts.map((q,i)=>(i?'L':'M')+q.x+' '+q.y).join(' ');
 let labels='';
 const step=Math.max(1,Math.ceil(items.length/9));
 pts.forEach((q,i)=>{if(i%step===0||i===pts.length-1)labels+='<text class="sentinel-label" x="'+q.x+'" y="'+(h-9)+'" text-anchor="middle">'+esc(q.label)+'</text>'});
 svg.innerHTML=gridLines(w,h,p,4)+'<path class="note-line" d="'+line+'"/>'+pts.map(q=>'<circle class="note-point" cx="'+q.x+'" cy="'+q.y+'" r="4"/>').join('')+labels;
}
function renderClassification(items){
 const svg=$('#classificationChart'),leg=$('#classificationLegend');if(!svg)return;
 const cats=[['NOR','class-nor'],['CPP','class-cpp'],['DEF','class-def'],['DUD','class-dud'],['PER','class-per']];
 leg.innerHTML=cats.map(c=>'<span><i class="legend-'+c[0].toLowerCase()+'"></i>'+c[0]+'</span>').join('');
 if(!items.length){chartEmpty(svg);return}
 const w=760,h=280,p=36,plotH=h-p*2,bw=Math.max(7,Math.min(28,(w-p*2)/items.length*.58)),step=(w-p*2)/(items.length||1);
 let bars=gridLines(w,h,p,4),labels='';
 items.forEach((v,i)=>{
  const x=p+i*step+(step-bw)/2;let y=h-p;
  for(const [key,cls] of cats){const val=Math.max(0,Number(v[key])||0);const bh=val/100*plotH;if(bh>0){y-=bh;bars+='<rect class="'+cls+'" x="'+x+'" y="'+y+'" width="'+bw+'" height="'+bh+'"/>'}}
  if(i%Math.max(1,Math.ceil(items.length/9))===0||i===items.length-1)labels+='<text class="sentinel-label" x="'+(x+bw/2)+'" y="'+(h-8)+'" text-anchor="middle">'+esc(v.label)+'</text>';
 });
 svg.innerHTML=bars+labels;
}
function renderOverdueType(items){
 const svg=$('#overdueTypeChart');if(!svg)return;
 if(!items.length){chartEmpty(svg);return}
 const w=760,h=280,p=36,max=Math.max(1,...items.flatMap(v=>[Number(v.sbs)||0,Number(v.other)||0])),step=(w-p*2)/items.length,bw=Math.max(6,Math.min(18,step*.28));
 let out=gridLines(w,h,p,4),labels='';
 items.forEach((v,i)=>{
  const x=p+i*step+step/2;const a=(Number(v.sbs)||0)/max*(h-p*2),b=(Number(v.other)||0)/max*(h-p*2);
  out+='<rect class="bar-cyan" x="'+(x-bw-1)+'" y="'+(h-p-a)+'" width="'+bw+'" height="'+a+'"/>';
  out+='<rect class="bar-purple" x="'+(x+1)+'" y="'+(h-p-b)+'" width="'+bw+'" height="'+b+'"/>';
  if(i%Math.max(1,Math.ceil(items.length/9))===0||i===items.length-1)labels+='<text class="sentinel-label" x="'+x+'" y="'+(h-8)+'" text-anchor="middle">'+esc(v.label)+'</text>';
 });
 svg.innerHTML=out+labels;
}
function renderCurrentVsOverdue(items){
 const svg=$('#currentVsOverdueChart');if(!svg)return;
 if(!items.length){chartEmpty(svg);return}
 const w=760,h=280,p=36,max=Math.max(1,...items.map(v=>(Number(v.current)||0)+(Number(v.overdue)||0))),step=(w-p*2)/items.length,bw=Math.max(8,Math.min(25,step*.52));
 let out=gridLines(w,h,p,4),labels='';
 items.forEach((v,i)=>{
  const x=p+i*step+(step-bw)/2,cur=(Number(v.current)||0)/max*(h-p*2),ov=(Number(v.overdue)||0)/max*(h-p*2);
  out+='<rect class="bar-blue" x="'+x+'" y="'+(h-p-cur)+'" width="'+bw+'" height="'+cur+'"/>';
  out+='<rect class="bar-coral" x="'+x+'" y="'+(h-p-cur-ov)+'" width="'+bw+'" height="'+ov+'"/>';
  if(i%Math.max(1,Math.ceil(items.length/9))===0||i===items.length-1)labels+='<text class="sentinel-label" x="'+(x+bw/2)+'" y="'+(h-8)+'" text-anchor="middle">'+esc(v.label)+'</text>';
 });
 svg.innerHTML=out+labels;
}
function renderPieChart(target,items,palette){
 const box=$(target);if(!box)return;
 if(!items.length){box.innerHTML='';return}
 const vals=items.map(v=>Math.max(0,Number(v.value)||0)),total=vals.reduce((a,b)=>a+b,0);
 if(total<=0){box.innerHTML='';return}
 let acc=0,stops=[];
 vals.forEach((v,i)=>{const a=acc/total*100;acc+=v;const b=acc/total*100;stops.push((palette[i%palette.length])+' '+a.toFixed(2)+'% '+b.toFixed(2)+'%')});
 const legend=items.map((v,i)=>'<div class="pie-legend-row"><i style="background:'+palette[i%palette.length]+'"></i><span>'+esc(v.label)+'</span><b>'+((Number(v.value)||0)/total*100).toFixed(1)+'%</b></div>').join('');
 box.innerHTML='<div class="pie-visual" style="background:conic-gradient('+stops.join(',')+')"><div class="pie-total"><b>'+items.length+'</b><small>grupos</small></div></div><div class="pie-legend">'+legend+'</div>';
}
function fallbackCharts(x){
 const comp=x.debtComposition||[],monthly=x.monthlyBehavior||[],series=x.debtSeries||[];
 return {
  noteEvolution:series.map((v,i)=>({label:v.label,value:Math.min(4,Math.max(0,(Number(v.value)||0)/(Math.max(...series.map(q=>Number(q.value)||0),1))*4))})),
  classificationHistory:monthly.filter(v=>/(normal|al día|cpp|potencial|deficiente|dudoso|pérdida|perdida)/i.test(v.status||'')).map(v=>({label:v.period,NOR:/normal|al día/i.test(v.status||'')?100:0,CPP:/cpp|potencial/i.test(v.status||'')?100:0,DEF:/deficiente/i.test(v.status||'')?100:0,DUD:/dudoso/i.test(v.status||'')?100:0,PER:/pérdida|perdida/i.test(v.status||'')?100:0})),
  overdueByType:[],
  overdueShare:[],
  currentVsOverdue:series.map(v=>({label:v.label,current:Number(v.value)||0,overdue:0})),
  institutionShare:comp
 };
}
function renderReportCharts(x){
 const rc=x.reportCharts||{},fb=fallbackCharts(x);
 const use=(k)=>Array.isArray(rc[k])&&rc[k].length?rc[k]:(Array.isArray(fb[k])?fb[k]:[]);
 const note=use('noteEvolution');
 const classification=use('classificationHistory');
 const overdueType=use('overdueByType');
 const overdueShare=use('overdueShare').filter(v=>Number(v.value)>0);
 const currentVs=use('currentVsOverdue');
 const institution=use('institutionShare').filter(v=>Number(v.value)>0);

 toggleBlock('#noteEvolutionSection',note.length>1);
 toggleBlock('#classificationSection',classification.length>0);
 toggleBlock('#overdueTypeSection',overdueType.length>0&&overdueType.some(v=>(Number(v.sbs)||0)+(Number(v.other)||0)>0));
 toggleBlock('#overdueShareSection',overdueShare.length>0);
 toggleBlock('#currentVsOverdueSection',currentVs.length>0&&currentVs.some(v=>(Number(v.current)||0)+(Number(v.overdue)||0)>0));
 toggleBlock('#institutionShareSection',institution.length>0);

 renderNoteEvolution(note);
 renderClassification(classification);
 renderOverdueType(overdueType);
 renderPieChart('#overdueShareChart',overdueShare,['#64d2dc','#9a55dc','#f0a04b','#59bd67']);
 renderCurrentVsOverdue(currentVs);
 renderPieChart('#institutionShareChart',institution,['#5f93ba','#65c856','#f3d94f','#efa04b','#9a55dc','#64d2dc']);
}
function renderCoverage(x){
 const s=x.sourceReport||{},det=Number(s.sectionsDetected)||x.reportSections.length,exp=Number(s.sectionsExpected)||det;
 const rows=[
  ['Fuente detectada',s.provider],
  ['Tipo de reporte',s.type],
  ['Estructura detectada',s.template],
  ['Método de lectura',s.extractionMode],
  ['Páginas del reporte',s.totalPages],
  ['Páginas leídas visualmente',s.visualPages!=null?String(s.visualPages):''],
  ['Periodo cubierto',s.periodCovered],
  ['Secciones estructuradas',det?(det+(exp?' / '+exp:'')):''],
  ['Modo de análisis',s.analysisMode==='deep'?'Profundo':s.analysisMode==='fast'?'Rápido':''],
  ['Confianza de extracción',x.confidence!=null?String(x.confidence)+'%':'']
 ].filter(([,v])=>isMeaningfulDisplayValue(v));
 $('#coverageBox').innerHTML=rows.map(([label,value])=>'<div class="coverage-item"><span>'+esc(label)+'</span><b>'+esc(value)+'</b></div>').join('');
}

$('#copyActionsBtn')?.addEventListener('click',async()=>{if(!state.analysis)return;const t=state.analysis.recommendations.map((r,i)=>(i+1)+'. '+r.title+'\n'+r.text).join('\n\n');await navigator.clipboard.writeText(t);$('#copyActionsBtn').textContent='Copiado';setTimeout(()=>$('#copyActionsBtn').textContent='Copiar',1200)});
$$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{await navigator.clipboard.writeText($(b.dataset.copy)?.innerText||'');b.textContent='Copiado';setTimeout(()=>b.textContent='Copiar',1000)}));
$('#printBtn')?.addEventListener('click',()=>window.print());
$('#saveNotesBtn')?.addEventListener('click',saveNotes);let noteTimer;$('#advisorNotes')?.addEventListener('input',()=>{clearTimeout(noteTimer);$('#notesStatus').textContent='Guardando…';noteTimer=setTimeout(saveNotes,600)});
const HISTORY_DB='tioscore-advisory-history';
const HISTORY_STORE='reports';
let historyDbPromise=null;

function openHistoryDb(){
 if(historyDbPromise)return historyDbPromise;
 historyDbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(HISTORY_DB,1);
  req.onupgradeneeded=()=>{
   const db=req.result;
   if(!db.objectStoreNames.contains(HISTORY_STORE)){
    const store=db.createObjectStore(HISTORY_STORE,{keyPath:'id'});
    store.createIndex('clientKey','clientKey',{unique:false});
    store.createIndex('date','date',{unique:false});
   }
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('No se pudo abrir el historial local.'));
 });
 return historyDbPromise;
}
async function historyAll(){
 const db=await openHistoryDb();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(HISTORY_STORE,'readonly');
  const req=tx.objectStore(HISTORY_STORE).getAll();
  req.onsuccess=()=>resolve((req.result||[]).sort((a,b)=>new Date(b.date)-new Date(a.date)));
  req.onerror=()=>reject(req.error);
 });
}
async function historyPut(item){
 const db=await openHistoryDb();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(HISTORY_STORE,'readwrite');
  tx.objectStore(HISTORY_STORE).put(item);
  tx.oncomplete=()=>resolve(item);
  tx.onerror=()=>reject(tx.error);
 });
}
function historyClientKey(a){
 const name=firstName(a?.client?.name||'cliente').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
 const doc=String(a?.client?.document||'').replace(/\s+/g,'');
 return (name||'cliente')+'|'+(doc||'sin-documento');
}
function historyNumber(raw,labels){
 for(const key of labels){
  if(raw&&raw[key]!=null){
   const n=reportMoneyNumber(raw[key]);
   if(n!=null)return n;
  }
 }
 return null;
}
function historySnapshot(a){
 const raw=a?.raw||{};
 return {
  score:Number(a?.score)||0,
  currentDebt:historyNumber(raw,['Deuda vigente SBS / Microfinanzas','Deuda vigente · Consulta rápida','Deuda vigente']),
  overdueDebt:historyNumber(raw,['Deuda vencida SBS / Microfinanzas','Monto de documentos vencidos','Deuda vencida']),
  daysPastDue:Math.max(Number(raw['Días de vencimiento del documento'])||0,Number(raw['Días de atraso visibles en BCP'])||0)
 };
}
function deltaText(current,previous,prefix=''){
 if(current==null||previous==null)return '';
 const d=current-previous;
 if(Math.abs(d)<.005)return prefix+'Sin cambio';
 return prefix+(d>0?'+':'')+d.toLocaleString('es-PE',{maximumFractionDigits:2});
}
async function initHistoryStore(){
 try{
  if(navigator.storage?.persist)await navigator.storage.persist();
  const db=await openHistoryDb();
  const legacy=JSON.parse(localStorage.getItem('ts-admin-history')||'[]');
  if(Array.isArray(legacy)&&legacy.length){
   for(const old of legacy){
    const analysis=old.analysis||{};
    await historyPut({
     id:old.id||crypto.randomUUID(),
     clientKey:historyClientKey(analysis),
     name:firstName(old.name||analysis.client?.name||'Cliente'),
     document:analysis.client?.document||'Documento protegido',
     score:Number(old.score)||Number(analysis.score)||0,
     risk:old.risk||analysis.risk||'',
     date:old.date||new Date().toISOString(),
     summary:old.summary||analysis.summary||'',
     followUp:analysis.followUp||{},
     snapshot:historySnapshot(analysis),
     analysis
    });
   }
   localStorage.removeItem('ts-admin-history');
  }
  state.history=await historyAll();
  state.historyReady=true;
 }catch(e){
  state.history=[];
  state.historyReady=false;
 }
}
async function persistCurrentHistory(){
 if(!state.currentHistoryId||!state.analysis)return;
 const item=state.history.find(x=>x.id===state.currentHistoryId);
 if(!item)return;
 item.analysis=structuredClone(state.analysis);
 item.summary=state.analysis.summary||item.summary;
 item.followUp=structuredClone(state.analysis.followUp||{});
 item.snapshot=historySnapshot(state.analysis);
 await historyPut(item);
}
async function persistHistoryAnalysis(id,analysis){
 if(!id||!analysis)return;
 const item=state.history.find(x=>x.id===id);
 if(!item)return;
 item.analysis=structuredClone(analysis);
 item.summary=analysis.summary||item.summary;
 item.followUp=structuredClone(analysis.followUp||{});
 item.snapshot=historySnapshot(analysis);
 item.score=Number(analysis.score)||item.score||0;
 item.risk=analysis.risk||item.risk||'';
 await historyPut(item);
 renderHistory();
}
function saveNotes(){
 if(state.analysis)state.analysis.notes=$('#advisorNotes').value;
 $('#notesStatus').textContent='Guardado local';
 persistCurrentHistory().catch(()=>{});
}
async function saveToHistory(filename){
 if(!state.analysis)return;
 const analysis=structuredClone(state.analysis);
 const item={
  id:crypto.randomUUID(),
  clientKey:historyClientKey(analysis),
  name:firstName(analysis.client?.name||filename||'Cliente'),
  document:analysis.client?.document||'Documento protegido',
  score:Number(analysis.score)||0,
  risk:analysis.risk||'',
  date:new Date().toISOString(),
  summary:analysis.summary||'',
  followUp:structuredClone(analysis.followUp||{}),
  snapshot:historySnapshot(analysis),
  analysis
 };
 await historyPut(item);
 state.currentHistoryId=item.id;
 state.history.unshift(item);
 renderHistory();
}
function historyGroups(){
 const groups=new Map();
 const query=state.historyFilter.trim().toLowerCase();
 for(const item of state.history){
  const hay=(item.name+' '+item.document+' '+item.summary).toLowerCase();
  if(query&&!hay.includes(query))continue;
  if(!groups.has(item.clientKey))groups.set(item.clientKey,[]);
  groups.get(item.clientKey).push(item);
 }
 return [...groups.entries()].map(([clientKey,reports])=>({clientKey,reports:reports.sort((a,b)=>new Date(b.date)-new Date(a.date))}))
  .sort((a,b)=>new Date(b.reports[0].date)-new Date(a.reports[0].date));
}
function renderHistoryStats(groups){
 const box=$('#historyStats');if(!box)return;
 const reports=groups.reduce((n,g)=>n+g.reports.length,0);
 box.innerHTML='<span><b>'+groups.length+'</b> clientes</span><span><b>'+reports+'</b> reportes</span><span><b>IndexedDB</b> almacenamiento local</span>';
}
function renderHistory(){
 const box=$('#historyList');if(!box)return;
 const groups=historyGroups();
 renderHistoryStats(groups);
 if(!state.historyReady&&state.history.length===0){box.innerHTML='<div class="empty-line">Preparando historial local…</div>';return}
 if(!groups.length){box.innerHTML='<div class="empty-line">No hay asesorías que coincidan con la búsqueda.</div>';return}
 box.innerHTML=groups.map(group=>{
  const reports=group.reports,latest=reports[0],prev=reports[1];
  const ls=latest.snapshot||{},ps=prev?.snapshot||{};
  const scoreDelta=prev?deltaText(ls.score,ps.score):'Primera lectura';
  const debtDelta=prev?deltaText(ls.currentDebt,ps.currentDebt,'S/ '):'';
  const overdueDelta=prev?deltaText(ls.overdueDebt,ps.overdueDebt,'S/ '):'';
  const follow=latest.followUp||{};
  const rows=reports.map((r,i)=>{
   const prior=reports[i+1],rs=r.snapshot||{},prs=prior?.snapshot||{};
   const compare=prior?'Score '+deltaText(rs.score,prs.score)+' · Deuda '+deltaText(rs.currentDebt,prs.currentDebt,'S/ '):'Lectura inicial';
   const checks=r.analysis?.checklist||[],done=Object.values(r.analysis?.checkState||{}).filter(Boolean).length;
   return '<div class="history-report-row"><div><b>'+new Date(r.date).toLocaleDateString('es-PE')+'</b><small>'+esc(r.risk||'')+' · '+esc(compare)+'</small></div><div><small>Score</small><strong>'+esc(r.score||'—')+'</strong></div><div><small>Seguimiento</small><strong>'+done+' / '+checks.length+'</strong></div><button class="mini-btn open-history" data-id="'+r.id+'">Abrir</button></div>';
  }).join('');
  return '<article class="history-client-card"><header><div><span class="eyebrow">CLIENTE</span><h3>'+esc(latest.name)+'</h3><small>'+esc(latest.document||'Documento protegido')+' · '+reports.length+' lectura'+(reports.length===1?'':'s')+'</small></div><div class="history-latest-score"><small>Último score</small><b>'+esc(latest.score||'—')+'</b></div></header><div class="history-comparison"><span><small>Δ Score</small><b>'+esc(scoreDelta)+'</b></span><span><small>Δ Deuda vigente</small><b>'+esc(debtDelta)+'</b></span><span><small>Δ Vencida</small><b>'+esc(overdueDelta)+'</b></span><span><small>Próxima asesoría</small><b>'+esc(follow.timeframe||'Por definir')+'</b></span></div><p class="history-summary">'+esc(latest.summary||'Sin resumen disponible.')+'</p><details><summary>Ver historial y comparaciones</summary><div class="history-report-list">'+rows+'</div></details></article>';
 }).join('');
 $$('.open-history').forEach(b=>b.addEventListener('click',()=>{
  const x=state.history.find(h=>h.id===b.dataset.id);
  if(x){switchView('analysis');loadAnalysis(structuredClone(x.analysis),true,'',{historyId:x.id})}
 }));
}
$('#historySearch')?.addEventListener('input',e=>{state.historyFilter=e.target.value||'';renderHistory()});

async function retryLocalAI(){
 setLocalAiStatus('Reiniciando Qwen…');
 setInlineAiMessage('Reintentando Qwen local…','info');
 const testEl=$('#aiSelfTest');if(testEl){testEl.textContent='Reintentando…';testEl.className=''}
 try{if(localAiWorker)localAiWorker.terminate()}catch{}
 try{if(cpuQwenWorker)cpuQwenWorker.terminate()}catch{}
 for(const [id,p] of cpuQwenPending){clearTimeout(p.timer);p.reject(new Error('Reinicio manual'));cpuQwenPending.delete(id)}
 localAiWorker=null;cpuQwenWorker=null;localAiEngine=null;localAiPromise=null;localAiBackend='';localAiModelId='';localAiLastError='';localAiGpuError='';localAiHardware=null;
 try{await getLocalAiEngine()}catch{}
}
$('#retryLocalAi')?.addEventListener('click',retryLocalAI);

async function checkAIStatus(){
 const hw=await inspectLocalHardware();
 renderHardwareStatus(hw);
 if(localAiEngine){
  setLocalAiStatus('Qwen verificado · '+(localAiBackend==='cpu'?'CPU/WASM':'WebGPU'),true);
  return;
 }
 if(localAiLastError){setLocalAiStatus('Qwen local no disponible');setInlineAiMessage(localAiLastError,'error');return}
 setLocalAiStatus(hw.webgpu?'Qwen WebGPU · precalentando…':'Qwen CPU/WASM · precalentando…');
}

bootstrap();