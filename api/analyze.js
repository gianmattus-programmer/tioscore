const crypto=require('crypto');
function sign(payload,secret){return crypto.createHmac('sha256',secret).update(payload).digest('base64url')}
function cookie(req,name){const m=('; '+(req.headers.cookie||'')).split('; '+name+'=');return m.length===2?m.pop().split(';').shift():''}
function authed(req){
 const secret=process.env.ADMIN_SESSION_SECRET;if(!secret)return false;
 const token=cookie(req,'ts_admin');if(!token)return false;const [p,s]=token.split('.');if(!p||!s)return false;
 const expected=sign(p,secret),A=Buffer.from(s),B=Buffer.from(expected);
 if(A.length!==B.length||!crypto.timingSafeEqual(A,B))return false;
 try{const d=JSON.parse(Buffer.from(p,'base64url').toString());return d.scope==='tioscore-admin'&&Date.now()<d.exp}catch{return false}
}
function outputText(data){if(typeof data.output_text==='string'&&data.output_text)return data.output_text;return (data.output||[]).flatMap(v=>v.content||[]).map(v=>v.text||'').join('')}
function cleanJson(s){return String(s||'').trim().replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim()}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(!process.env.ADMIN_PASSWORD||!process.env.ADMIN_SESSION_SECRET)return res.status(503).json({error:'config_missing'});
 if(!authed(req))return res.status(401).json({error:'unauthorized'});
 if(req.method==='GET')return res.status(200).json({configured:!!process.env.OPENAI_API_KEY});
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'ai_not_configured',message:'Falta configurar OPENAI_API_KEY en Vercel.'});
 const text=String(req.body?.text||'').slice(0,240000),filename=String(req.body?.filename||'reporte.pdf'),extractionMeta=req.body?.extractionMeta||{};
 const mode=String(req.body?.mode||'interpret');
 const quick=mode==='quick';

 if(mode==='interpret'){
  const structured=req.body?.structured&&typeof req.body.structured==='object'?req.body.structured:{};
  const payload=JSON.stringify(structured).slice(0,12000);
  if(payload.length<20)return res.status(400).json({error:'missing_structured_data',message:'No llegaron datos suficientes para interpretar.'});

  const interpretationPrompt=`Eres el asesor educativo de Tío Score. Recibes datos YA EXTRAÍDOS de un reporte crediticio peruano.
NO vuelvas a extraer datos, NO inventes cifras y NO cambies el score recibido.
Tu única tarea es redactar la sección "Interpretación y plan" con lenguaje claro, prudente y útil para explicarla en vivo.

REGLAS:
- Todo en español natural.
- Basa cada afirmación únicamente en los datos recibidos.
- No garantices aprobación de créditos, eliminación de registros ni aumento del score.
- Prioriza deuda vencida, días de atraso, protestos, deuda tributaria/laboral, capacidad de pago y score.
- Si un valor es 0, "No informado" o está ausente, no lo conviertas en problema.
- Entre 2 y 5 alertas/fortalezas.
- Entre 3 y 5 recomendaciones concretas y ordenadas.
- El cierre debe ser breve.
- Devuelve SOLO JSON válido.

Estructura exacta:
{
 "scoreDescription":"",
 "summary":"",
 "tags":[""],
 "alerts":[{"level":"red|yellow|green","title":"","text":""}],
 "recommendations":[{"title":"","text":"","impact":"Prioridad 1|Prioridad 2|Prioridad 3|Seguimiento"}],
 "closing":{"headline":"Conclusión de la lectura","text":""},
 "checklist":[""]
}

DATOS ESTRUCTURADOS:
${payload}`;

  try{
   const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-5.6-luna',input:interpretationPrompt,reasoning:{effort:'low'},max_output_tokens:1600})
   });
   const data=await r.json();
   if(!r.ok)return res.status(502).json({error:'ai_error',message:data?.error?.message||'El proveedor de IA devolvió un error.'});
   const interpretation=JSON.parse(cleanJson(outputText(data)));
   interpretation.tags=Array.isArray(interpretation.tags)?interpretation.tags:[];
   interpretation.alerts=Array.isArray(interpretation.alerts)?interpretation.alerts:[];
   interpretation.recommendations=Array.isArray(interpretation.recommendations)?interpretation.recommendations:[];
   interpretation.checklist=Array.isArray(interpretation.checklist)?interpretation.checklist:[];
   interpretation.closing=interpretation.closing&&typeof interpretation.closing==='object'?interpretation.closing:{headline:'Conclusión de la lectura',text:''};
   return res.status(200).json({interpretation,mode:'interpret'});
  }catch(e){
   return res.status(500).json({error:'interpretation_failed',message:'No se pudo generar la interpretación del reporte.'});
  }
 }

 if(mode!=='interpret'){
  return res.status(410).json({
   error:'full_analysis_disabled',
   message:'El análisis completo del PDF con IA está desactivado para evitar consumo alto de tokens. Usa el parser/OCR local y la interpretación estructurada.'
  });
 }

 if(text.length<100)return res.status(400).json({error:'pdf_without_text',message:'El PDF no contiene suficiente texto digital para esta ruta de lectura.'});

 if(quick){
  const quickPrompt=`Eres el modo rápido de Tío Score. Lee el texto disponible de un reporte crediticio peruano y devuelve SOLO JSON válido, sin markdown.
Tu objetivo es mostrar una vista preliminar útil lo antes posible mientras otro proceso completa el análisis exhaustivo.

Extrae únicamente información que esté explícitamente presente. No inventes.
Si aparece un Score Experian u otro score explícito de 1 a 999, úsalo. Si todavía no aparece, score=0.
Usa solo el primer nombre del titular.
Oculta el documento y muestra como máximo sus últimos 2 dígitos.
Todo texto visible debe estar en español natural.

Estructura exacta:
{
 "sourceReport":{"provider":"","type":"","reportDate":""},
 "client":{"name":"","document":"","age":"","reportDate":"","entities":""},
 "score":0,
 "confidence":0,
 "scoreDescription":"",
 "summary":"",
 "tags":[""],
 "raw":{}
}

Prioriza: nombre, DNI protegido, fecha, Score Experian, nivel del score, bancarizado, capacidad de pago, deuda vigente, deuda vencida y principales alertas visibles.
En raw usa etiquetas humanas en español, nunca camelCase ni claves técnicas.

ARCHIVO: ${filename}
TEXTO DISPONIBLE:
${text.slice(0,90000)}`;
  try{
   const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-5.6-luna',input:quickPrompt,reasoning:{effort:'low'},max_output_tokens:2400})
   });
   const data=await r.json();
   if(!r.ok)return res.status(502).json({error:'ai_error',message:data?.error?.message||'El proveedor de IA devolvió un error.'});
   const analysis=JSON.parse(cleanJson(outputText(data)));
   analysis.score=Math.max(0,Math.min(999,Number(analysis.score)||0));
   analysis.confidence=Math.max(0,Math.min(100,Number(analysis.confidence)||0));
   analysis.sourceReport=analysis.sourceReport||{};
   analysis.client=analysis.client||{};
   analysis.tags=Array.isArray(analysis.tags)?analysis.tags:[];
   analysis.raw=analysis.raw&&typeof analysis.raw==='object'?analysis.raw:{};
   return res.status(200).json({analysis,quick:true});
  }catch(e){
   return res.status(500).json({error:'quick_analysis_failed',message:'No se pudo generar la vista rápida.'});
  }
 }

 const prompt=`Eres el motor de estructuración y apoyo educativo de Tío Score para reportes crediticios peruanos, especialmente reportes de Sentinel en cualquiera de sus variantes de estructura, extensión y orden de secciones.

OBJETIVO
1. Identifica el tipo de reporte y sus secciones reales.
2. Extrae de forma exhaustiva todos los datos financieros relevantes que estén presentes.
3. Normaliza distintos formatos Sentinel a una estructura común sin perder información.
4. Separa hechos del reporte de interpretación.
5. Genera una lectura educativa prudente y un plan de seguimiento.
6. Devuelve SOLO JSON válido. Sin markdown.

REGLAS CRÍTICAS
- No inventes datos. Cuando no exista un dato, usa "No informado", null o un array vacío según corresponda.
- No supongas que todas las versiones de Sentinel contienen las mismas secciones.
- Preserva en reportSections los campos relevantes que no encajen en las tablas principales.
- No decidas elegibilidad para créditos ni garantices aprobación, eliminación de registros o aumento de score.
- El score de Tío Score es una estimación educativa de 1 a 999 basada únicamente en señales observables. Si no hay evidencia suficiente: score=0 y risk="POR REVISAR".
- confidence mide calidad/completitud de extracción, NO solvencia.
- Para documento de identidad, en la salida muestra solo los últimos 2 dígitos cuando pueda identificarse.
- Las recomendaciones deben referirse a hechos concretos del reporte y nunca recomendar endeudarse solo para "subir score".
- Detecta clasificación Normal, CPP, Deficiente, Dudoso, Pérdida u otras equivalentes cuando aparezcan.
- Detecta días de atraso, deuda directa/indirecta, créditos, tarjetas, líneas, saldos, cuotas, deuda vencida, castigos, deuda comercial, entidades, consultas, avales/garantías y comportamiento histórico cuando existan.
- monthlyBehavior puede incluir hasta 24 periodos relevantes.
- reportSections debe conservar los bloques relevantes del documento que no estén ya plenamente representados. Sé detallado.
- entities y obligations deben incluir todos los registros claramente identificables, no solo los más importantes.
- TODO texto destinado a mostrarse en la interfaz debe estar en español natural.
- En raw, usa etiquetas humanas en español como claves. Ejemplo: "Tipo de documento", nunca "documentType"; "Fecha del reporte", nunca "reportDate".
- En reportSections, tanto title como cada items[].label deben estar en español legible. Nunca expongas nombres internos camelCase, snake_case ni claves técnicas en inglés.
- Si el documento fuente usa un nombre técnico en inglés, conserva su significado pero traduce la etiqueta visible al español.

ESTRUCTURA EXACTA
{
 "sourceReport":{
   "provider":"Sentinel|Otra fuente|No identificado",
   "type":"",
   "reportDate":"",
   "periodCovered":"",
   "sectionsDetected":0,
   "sectionsExpected":0
 },
 "client":{
   "name":"",
   "document":"",
   "age":"",
   "reportDate":"",
   "entities":""
 },
 "score":0,
 "risk":"EXCELENTE|BUENO|REGULAR|ALERTA|POR REVISAR",
 "confidence":0,
 "debtChange":0,
 "scoreDescription":"",
 "summary":"",
 "tags":[""],
 "alerts":[{"level":"red|yellow|green","title":"","text":""}],
 "metrics":[{"value":"","label":"","danger":false}],
 "debtSeries":[{"label":"","value":0}],
 "debtComposition":[{"label":"","value":0}],
 "monthlyBehavior":[{"period":"","status":"","daysPastDue":0,"balance":0,"entity":""}],
 "entities":[
   {"name":"","type":"","product":"","balance":"","status":"","daysPastDue":"","classification":"","limit":"","monthlyPayment":""}
 ],
 "obligations":[
   {"entity":"","product":"","balance":"","status":"","detail":""}
 ],
 "inquiries":[{"date":"","entity":"","type":""}],
 "recommendations":[{"title":"","text":"","impact":"Prioridad 1|Prioridad 2|Prioridad 3|Seguimiento"}],
 "closing":{"headline":"","text":""},
 "checklist":[""],
 "raw":{},
 "reportSections":[
   {"title":"","items":[{"label":"","value":""}]}
 ],
 "reportCharts":{
   "noteEvolution":[{"label":"","value":0}],
   "classificationHistory":[{"label":"","NOR":0,"CPP":0,"DEF":0,"DUD":0,"PER":0}],
   "overdueByType":[{"label":"","sbs":0,"other":0}],
   "overdueShare":[{"label":"","value":0}],
   "currentVsOverdue":[{"label":"","current":0,"overdue":0}],
   "institutionShare":[{"label":"","value":0}]
 }
}

CRITERIOS DE REPRESENTACIÓN
- raw: incluye todos los datos identificativos y cifras globales útiles como pares etiqueta/valor. No incluyas textos enormes.
- entities: una fila por entidad/producto distinguible.
- obligations: una fila por obligación financiera o comercial distinguible.
- debtSeries: evolución del saldo/deuda cuando existan periodos comparables.
- debtComposition: agrupa por tipo o entidad cuando permita visualizar de qué está compuesta la deuda.
- monthlyBehavior: refleja periodos y estado cuando el reporte lo muestre.
- inquiries: consultas al reporte o solicitudes detectadas; si no hay, array vacío.
- reportSections: bloques adicionales como datos personales, resumen SBS, deuda indirecta, garantías, avales, protestos, información tributaria/comercial, líneas, tarjetas, calificaciones, consultas u otras secciones presentes.
- alerts: entre 2 y 8 señales. Verde=fortaleza observada, amarillo=requiere revisión, rojo=atraso/obligación/condición negativa explícita.
- recommendations: entre 3 y 6, ordenadas.
- closing: cierre breve apto para explicar en vivo a un cliente.
- reportCharts: estos datos alimentan gráficos que replican los gráficos típicos de Sentinel. NO calcules ni inventes un gráfico si el reporte no contiene base suficiente: devuelve [] para ese gráfico.
- reportCharts.noteEvolution: serie temporal de "Evolución de Nota" o semáforo/nota equivalente, preferentemente hasta 24 meses.
- reportCharts.classificationHistory: porcentajes por periodo de calificación SBS/Micro. Cada fila debe sumar aproximadamente 100 cuando el reporte lo permita. Claves NOR, CPP, DEF, DUD, PER.
- reportCharts.overdueByType: deuda vencida por periodo separando SBS/Micro ("sbs") y otros/documentos impagos ("other").
- reportCharts.overdueShare: distribución porcentual o proporcional de vencidos por tipo. Usa los valores reales subyacentes; el frontend calcula porcentajes.
- reportCharts.currentVsOverdue: deuda SBS/Micro vigente ("current") y vencida ("overdue") por periodo.
- reportCharts.institutionShare: saldo o participación por institución SBS/Micro. Usa montos o porcentajes reales, pero no mezcles ambos en la misma serie.
- Si el propio reporte incluye una sección "Gráficos", "Posición Histórica", "Semáforos de los últimos 24 meses" o tablas históricas, prioriza esos datos para reportCharts.
- Mantén el orden cronológico original del reporte de antiguo a reciente.
- Para score: si el reporte contiene explícitamente un Score Experian u otro score de 1 a 999 del titular, usa ese valor. Solo si no existe un score explícito puedes usar una estimación educativa, y debe quedar indicado en scoreDescription.

ARCHIVO: ${filename}
MÉTODO DE EXTRACCIÓN: ${extractionMeta.mode||'digital'}
PÁGINAS TOTALES: ${extractionMeta.totalPages||'no informado'}
PÁGINAS DIGITALES: ${extractionMeta.digitalPages||0}
PÁGINAS LEÍDAS VISUALMENTE: ${extractionMeta.visualPages||0}

TEXTO EXTRAÍDO DEL REPORTE:
${text}`;

 try{
  const r=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',
   headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({model:'gpt-5.6-luna',input:prompt,reasoning:{effort:'low'},max_output_tokens:11000})
  });
  const data=await r.json();
  if(!r.ok)return res.status(502).json({error:'ai_error',message:data?.error?.message||'El proveedor de IA devolvió un error.'});
  const analysis=JSON.parse(cleanJson(outputText(data)));
  analysis.score=Math.max(0,Math.min(999,Number(analysis.score)||0));
  analysis.confidence=Math.max(0,Math.min(100,Number(analysis.confidence)||0));
  analysis.sourceReport=analysis.sourceReport||{};
  analysis.client=analysis.client||{};
  for(const k of ['alerts','metrics','debtSeries','debtComposition','monthlyBehavior','entities','obligations','inquiries','recommendations','checklist','reportSections'])if(!Array.isArray(analysis[k]))analysis[k]=[];
  analysis.reportCharts=analysis.reportCharts&&typeof analysis.reportCharts==='object'?analysis.reportCharts:{};
  for(const k of ['noteEvolution','classificationHistory','overdueByType','overdueShare','currentVsOverdue','institutionShare'])if(!Array.isArray(analysis.reportCharts[k]))analysis.reportCharts[k]=[];
  analysis.raw=analysis.raw&&typeof analysis.raw==='object'?analysis.raw:{};
  analysis.closing=analysis.closing||{headline:'Conclusión',text:''};
  return res.status(200).json({analysis});
 }catch(e){
  return res.status(500).json({error:'analysis_failed',message:'No se pudo convertir el reporte en una lectura estructurada. Intenta nuevamente.'});
 }
};