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
 const text=String(req.body?.text||'').slice(0,260000),filename=String(req.body?.filename||'reporte.pdf');
 if(text.length<100)return res.status(400).json({error:'pdf_without_text',message:'El PDF no contiene suficiente texto digital para esta ruta de lectura.'});

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
- monthlyBehavior puede incluir hasta 48 periodos relevantes.
- reportSections debe conservar los bloques relevantes del documento que no estén ya plenamente representados. Sé detallado.
- entities y obligations deben incluir todos los registros claramente identificables, no solo los más importantes.

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
 ]
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

ARCHIVO: ${filename}

TEXTO EXTRAÍDO DEL REPORTE:
${text}`;

 try{
  const r=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',
   headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({model:'gpt-5.6-luna',input:prompt,reasoning:{effort:'low'},max_output_tokens:18000})
  });
  const data=await r.json();
  if(!r.ok)return res.status(502).json({error:'ai_error',message:data?.error?.message||'El proveedor de IA devolvió un error.'});
  const analysis=JSON.parse(cleanJson(outputText(data)));
  analysis.score=Math.max(0,Math.min(999,Number(analysis.score)||0));
  analysis.confidence=Math.max(0,Math.min(100,Number(analysis.confidence)||0));
  analysis.sourceReport=analysis.sourceReport||{};
  analysis.client=analysis.client||{};
  for(const k of ['alerts','metrics','debtSeries','debtComposition','monthlyBehavior','entities','obligations','inquiries','recommendations','checklist','reportSections'])if(!Array.isArray(analysis[k]))analysis[k]=[];
  analysis.raw=analysis.raw&&typeof analysis.raw==='object'?analysis.raw:{};
  analysis.closing=analysis.closing||{headline:'Conclusión',text:''};
  return res.status(200).json({analysis});
 }catch(e){
  return res.status(500).json({error:'analysis_failed',message:'No se pudo convertir el reporte en una lectura estructurada. Intenta nuevamente.'});
 }
};