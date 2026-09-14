const crypto=require('crypto');

function sign(payload,secret){return crypto.createHmac('sha256',secret).update(payload).digest('base64url')}
function cookie(req,name){const m=('; '+(req.headers.cookie||'')).split('; '+name+'=');return m.length===2?m.pop().split(';').shift():''}
function authed(req){
 const secret=process.env.ADMIN_SESSION_SECRET;if(!secret)return false;
 const token=cookie(req,'ts_admin');if(!token)return false;
 const [p,s]=token.split('.');if(!p||!s)return false;
 const expected=sign(p,secret),A=Buffer.from(s),B=Buffer.from(expected);
 if(A.length!==B.length||!crypto.timingSafeEqual(A,B))return false;
 try{const d=JSON.parse(Buffer.from(p,'base64url').toString());return d.scope==='tioscore-admin'&&Date.now()<d.exp}catch{return false}
}
function cap(text,patterns){
 for(const re of patterns){const m=String(text||'').match(re);if(m&&m[1]!=null)return String(m[1]).trim()}
 return '';
}
function firstName(v=''){const s=String(v||'').trim().replace(/\s+/g,' ');return s?s.split(' ')[0]:'Cliente'}
function moneyNumber(v){
 const s=String(v||'').replace(/[^\d,.-]/g,'').trim();if(!s)return null;
 let n=s;
 if(s.includes(',')&&s.includes('.'))n=s.lastIndexOf('.')>s.lastIndexOf(',')?s.replace(/,/g,''):s.replace(/\./g,'').replace(',','.');
 else if(s.includes(','))n=s.replace(',','.');
 const x=Number(n);return Number.isFinite(x)?x:null;
}
function money(v){const n=moneyNumber(v);return n==null?'':'S/ '+n.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2})}
function scoreBand(score){
 const s=Number(score)||0;
 if(s>=877)return ['EXCELENTE','Excelente Puntaje'];
 if(s>=722)return ['BUENO','Buen Puntaje'];
 if(s>=598)return ['REGULAR','Puntaje medio'];
 if(s>=477)return ['ALERTA','Puntaje Bajo'];
 if(s>=1)return ['ALERTA','Puntaje Muy Bajo'];
 return ['POR REVISAR','Puntaje por revisar'];
}
function getRawValue(raw,labels){
 for(const label of labels){
  if(raw&&raw[label]!=null&&String(raw[label]).trim()!=='')return raw[label];
 }
 return '';
}
function rulesInterpretation(structured={}){
 const raw=structured.datos&&typeof structured.datos==='object'?structured.datos:{};
 const score=Number(structured.score)||Number(getRawValue(raw,['Score Experian','Puntaje']))||0;
 const [,band]=scoreBand(score);
 const overdue=moneyNumber(getRawValue(raw,['Deuda vencida SBS / Microfinanzas','Deuda vencida']))||0;
 const overdueDocs=moneyNumber(getRawValue(raw,['Monto de documentos vencidos','Documentos vencidos']))||0;
 const tax=moneyNumber(getRawValue(raw,['Deuda tributaria']))||0;
 const labor=moneyNumber(getRawValue(raw,['Deuda laboral']))||0;
 const days=Math.max(
  Number(getRawValue(raw,['Días de vencimiento del documento']))||0,
  Number(getRawValue(raw,['Días de atraso visibles en BCP','Máx. días de atraso']))||0
 );
 const protested=moneyNumber(getRawValue(raw,['Documentos protestados no regularizados']))||0;
 const alerts=[],recommendations=[],tags=[];
 if(score)tags.push(band);
 if(overdue>0||overdueDocs>0){
  alerts.push({level:'red',title:'Obligaciones vencidas detectadas',text:'El reporte registra montos vencidos que requieren regularización y posterior verificación.'});
  recommendations.push({title:'Regularizar obligaciones vencidas',text:'Prioriza los saldos vencidos y conserva constancias de pago o no adeudo.',impact:'Prioridad 1'});
  tags.push('Deuda vencida');
 }
 if(days>0){
  alerts.push({level:'red',title:'Atraso registrado',text:'Se observan '+days+' días de atraso en los datos extraídos.'});
  if(!recommendations.some(x=>/vencid/i.test(x.title)))recommendations.push({title:'Corregir el atraso',text:'Regulariza la obligación atrasada y verifica su actualización posteriormente.',impact:'Prioridad 1'});
 }
 if(protested>0){
  alerts.push({level:'red',title:'Protestos pendientes',text:'Se identifican documentos protestados no regularizados.'});
  recommendations.push({title:'Regularizar documentos protestados',text:'Solicita sustento de regularización y revisa su actualización en el siguiente reporte.',impact:'Prioridad 2'});
 }
 if(tax>0||labor>0){
  alerts.push({level:'yellow',title:'Obligaciones adicionales',text:'Hay obligaciones tributarias o laborales que deben revisarse.'});
  recommendations.push({title:'Revisar obligaciones adicionales',text:'Verifica el estado y exigibilidad de las obligaciones tributarias o laborales detectadas.',impact:'Prioridad 2'});
 }
 if(!alerts.length)alerts.push({level:'green',title:'Sin alertas críticas detectadas',text:'Los principales campos extraídos no muestran una observación crítica explícita.'});
 if(!recommendations.length)recommendations.push({title:'Mantener pagos puntuales',text:'Conserva el cumplimiento de tus obligaciones y evita nuevos atrasos.',impact:'Prioridad 1'});
 recommendations.push({title:'Verificar actualización',text:'Compara un reporte posterior para confirmar cambios y regularizaciones.',impact:'Seguimiento'});
 const hasIssue=overdue>0||overdueDocs>0||days>0||protested>0||tax>0||labor>0;
 return {
  scoreDescription:score?'El score se encuentra en el rango "'+band+'". Debe interpretarse junto con las obligaciones, atrasos y capacidad de pago observados.':'No se identificó un score explícito con suficiente certeza.',
  summary:hasIssue?'La lectura presenta observaciones que requieren atención y seguimiento antes de asumir nuevas obligaciones.':'La lectura local no detectó una señal crítica en los campos principales extraídos.',
  tags:[...new Set(tags)].slice(0,5),
  alerts:alerts.slice(0,5),
  recommendations:recommendations.slice(0,5),
  closing:{headline:'Conclusión de la lectura',text:'Regulariza cualquier observación pendiente y confirma los cambios en un reporte actualizado antes de tomar decisiones financieras.'},
  checklist:['Revisar obligaciones identificadas','Regularizar pendientes si corresponde','Conservar constancias','Verificar actualización en un nuevo reporte'],
  followUp:{
   timeframe:hasIssue?'7–30 días':'30–60 días',
   objective:hasIssue?'Confirmar regularizaciones y medir cambios del perfil.':'Confirmar estabilidad del perfil y ausencia de nuevas observaciones.',
   nextReview:'Comparar un reporte actualizado contra esta lectura y registrar variaciones de score, saldos, atrasos y estados.',
   verificationPoints:['Estado de obligaciones pendientes','Cambios en saldos y días de atraso','Cambios en score o clasificación','Nuevas consultas u obligaciones'],
   questions:['¿Qué obligaciones se regularizaron desde esta lectura?','¿Apareció alguna nueva deuda o solicitud?','¿Qué cambió en el reporte actualizado?']
  }
 };
}
function localFallbackAnalysis(source,filename,meta={}){
 const text=String(source||'').replace(/--- PÁGINA \d+ · [^-]+ ---/g,' ').replace(/\s+/g,' ').trim();
 const scoreRaw=cap(text,[
  /(?:score\s*(?:experian)?|puntaje(?:\s+experian)?)\s*[:\-]?\s*(\d{1,3})\b/i,
  /\bexperian\b.{0,35}\b(\d{3})\b/i
 ]);
 const score=Math.max(0,Math.min(999,Number(scoreRaw)||0));
 const name=cap(text,[/(?:nombres?\s*(?:y\s*apellidos?)?|titular|cliente)\s*[:\-]?\s*([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ]+){0,4})/i]);
 const dni=cap(text,[/\bDNI\s*(?:N[°ºo.]*)?\s*[:\-]?\s*(\d{8})\b/i]);
 const ruc=cap(text,[/\bRUC\s*(?:N[°ºo.]*)?\s*[:\-]?\s*(\d{11})\b/i]);
 const updated=cap(text,[/(?:informaci[oó]n actualizada(?: al)?|informationUpdated)\s*[:\-]?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i]);
 const creation=cap(text,[/(?:fecha(?: y hora)? de creaci[oó]n|creationDateTime)\s*[:\-]?\s*(\d{2}[\/.-]\d{2}[\/.-]\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)/i]);
 const capacity=cap(text,[/(?:capacidad(?: de)? pago(?: mensual)?|capacityOfMonthlyPayment)\s*[:\-]?\s*((?:S\/\s*)?[\d.,]+\s*(?:a|-|hasta)\s*(?:S\/\s*)?[\d.,]+)/i]);
 const currentDebt=cap(text,[/(?:deuda vigente\s*(?:SBS\s*\/?\s*Microfinanzas)?|currentDebtSBSMicrofinance|currentDebtQuickQuery)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const overdueDebt=cap(text,[/(?:deuda vencida\s*(?:SBS\s*\/?\s*Microfinanzas)?|overdueDebtSBSMicrofinance)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const overdueDocs=cap(text,[/(?:monto(?: de)? documentos vencidos|overdueDocumentAmount)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const overdueDays=cap(text,[/(?:d[ií]as de vencimiento(?: del documento)?|overdueDocumentDays|visibleBCPOverdueDays)\s*[:\-]?\s*(\d{1,4})/i]);
 const banked=cap(text,[/bancarizad[oa]\s*[:\-]?\s*(S[IÍ]|NO)\b/i]);
 const taxDebt=cap(text,[/(?:deuda tributaria|taxDebt)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const laborDebt=cap(text,[/(?:deuda laboral|laborDebt)\s*[:\-]?\s*(S\/\s*[\d.,]+)/i]);
 const [,band]=scoreBand(score);
 const raw={};
 const add=(k,v)=>{if(v!==''&&v!=null)raw[k]=String(v)};
 add('Nombre',firstName(name));
 add('Documento',(dni||ruc)?'••••••'+String(dni||ruc).slice(-2):'Documento protegido');
 add('Información actualizada al',updated||creation);
 add('Score Experian',score||'');
 add('Nivel del score',band);
 add('Bancarizado',banked);
 add('Capacidad de pago mensual',capacity);
 add('Deuda vigente SBS / Microfinanzas',currentDebt);
 add('Deuda vencida SBS / Microfinanzas',overdueDebt);
 add('Monto de documentos vencidos',overdueDocs);
 add('Días de vencimiento del documento',overdueDays);
 add('Deuda tributaria',taxDebt);
 add('Deuda laboral',laborDebt);
 add('Páginas del reporte',meta.totalPages||'');
 const structured={score,datos:raw};
 const interp=rulesInterpretation(structured);
 const current=moneyNumber(currentDebt),overdue=moneyNumber(overdueDebt),docs=moneyNumber(overdueDocs);
 const metrics=[];
 if(score)metrics.push({value:String(score),label:'Score Experian'});
 if(current!=null)metrics.push({value:money(current),label:'Deuda vigente'});
 if(overdue!=null)metrics.push({value:money(overdue),label:'Deuda vencida',danger:overdue>0});
 if(docs!=null)metrics.push({value:money(docs),label:'Documentos vencidos',danger:docs>0});
 if(overdueDays)metrics.push({value:String(overdueDays),label:'Días de atraso',danger:Number(overdueDays)>0});
 if(capacity)metrics.push({value:capacity,label:'Capacidad de pago'});
 const [risk]=scoreBand(score);
 return {
  sourceReport:{provider:/\bsentinel\b/i.test(text)?'Sentinel':'Reporte detectado',type:'Reporte crediticio',reportDate:updated||creation||'',periodCovered:'',sectionsDetected:1,sectionsExpected:1,extractionMode:meta.mode||'local',parserMode:'Compatibilidad local sin IA',totalPages:meta.totalPages||''},
  client:{name:firstName(name),document:(dni||ruc)?'••••••'+String(dni||ruc).slice(-2):'Documento protegido',age:'',reportDate:updated||creation||'',entities:''},
  score,risk,confidence:Math.max(35,score?65:40),debtChange:0,
  metrics,debtSeries:[],debtComposition:[],monthlyBehavior:[],entities:[],obligations:[],inquiries:[],
  raw,
  reportSections:[{title:'Datos extraídos localmente',items:Object.entries(raw).map(([label,value])=>({label,value}))}],
  reportCharts:{noteEvolution:[],classificationHistory:[],overdueByType:[],overdueShare:[],currentVsOverdue:[],institutionShare:[]},
  ...interp
 };
}

module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(!process.env.ADMIN_PASSWORD||!process.env.ADMIN_SESSION_SECRET)return res.status(503).json({error:'config_missing'});
 if(!authed(req))return res.status(401).json({error:'unauthorized'});
 if(req.method==='GET')return res.status(200).json({configured:true,provider:'local-browser',requiresApiKey:false});
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});

 const structured=req.body?.structured&&typeof req.body.structured==='object'?req.body.structured:null;
 if(structured){
  return res.status(200).json({interpretation:rulesInterpretation(structured),mode:'rules',aiUsed:false});
 }

 const text=String(req.body?.text||'').slice(0,240000);
 const filename=String(req.body?.filename||'reporte.pdf');
 const extractionMeta=req.body?.extractionMeta||{};
 if(text.length<100)return res.status(400).json({error:'pdf_without_text',message:'El PDF no contiene suficiente texto legible.'});
 const analysis=localFallbackAnalysis(text,filename,extractionMeta);
 return res.status(200).json({analysis,localFallback:true,aiUsed:false});
};
