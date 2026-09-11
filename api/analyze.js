const crypto=require('crypto');
function sign(payload,secret){return crypto.createHmac('sha256',secret).update(payload).digest('base64url')}
function cookie(req,name){const m=('; '+(req.headers.cookie||'')).split('; '+name+'=');return m.length===2?m.pop().split(';').shift():''}
function authed(req){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret)return false;const token=cookie(req,'ts_admin');if(!token)return false;const [p,s]=token.split('.');if(!p||!s)return false;const expected=sign(p,secret);const A=Buffer.from(s),B=Buffer.from(expected);if(A.length!==B.length||!crypto.timingSafeEqual(A,B))return false;try{const d=JSON.parse(Buffer.from(p,'base64url').toString());return d.scope==='tioscore-admin'&&Date.now()<d.exp}catch{return false}}
function getText(data){if(typeof data.output_text==='string'&&data.output_text)return data.output_text;return (data.output||[]).flatMap(x=>x.content||[]).map(x=>x.text||'').join('')}
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!process.env.ADMIN_PASSWORD||!process.env.ADMIN_SESSION_SECRET)return res.status(503).json({error:'config_missing'});
  if(!authed(req))return res.status(401).json({error:'unauthorized'});
  if(req.method==='GET')return res.status(200).json({configured:!!process.env.OPENAI_API_KEY});
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'ai_not_configured',message:'Falta configurar OPENAI_API_KEY en Vercel.'});
  const text=String(req.body?.text||'').slice(0,180000),filename=String(req.body?.filename||'reporte.pdf');
  if(text.length<80)return res.status(400).json({error:'pdf_without_text',message:'El PDF no contiene suficiente texto legible. Prueba con un PDF digital o revisa el documento.'});
  const prompt=`Eres el motor de apoyo educativo de Tío Score. Analiza el texto extraído de un reporte crediticio peruano y devuelve SOLO JSON válido, sin markdown. 
No inventes datos. Si algo no aparece, usa "No detectado" o valores vacíos. Diferencia datos objetivos de interpretación. No prometas aprobación, aumento de score ni resultados exactos. No decidas elegibilidad para crédito. Las recomendaciones deben ser prudentes, educativas, accionables y basadas únicamente en evidencia del reporte.

Estructura exacta:
{
 "client":{"name":"", "document":"", "age":"", "reportDate":"", "entities":""},
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
 "recommendations":[{"title":"","text":"","impact":"ALTO IMPACTO|IMPACTO MEDIO|CONTROL DE RIESGO"}],
 "checklist":[""],
 "raw":{"Nombre":"","Documento":"","Edad":"","Fecha del reporte":"","Entidades":"","Crédito bancario":"","Deuda comercial":"","Máx. días de atraso":""}
}

Reglas:
- score es una estimación educativa de 1 a 999 basada en señales observables del reporte, NO un score oficial. Si no hay suficiente evidencia usa 0 y risk "POR REVISAR".
- confidence de 0 a 100 mide calidad/completitud de extracción, no solvencia.
- debtChange es porcentaje con signo: negativo si bajó, positivo si subió; 0 si no se puede calcular.
- alerts: 3 a 6 señales, con verde para fortalezas, amarillo para revisión y rojo para obligaciones/atrasos relevantes.
- metrics: 6 cifras clave como máximo.
- debtSeries: usa periodos reales detectados; máximo 10 puntos.
- recommendations: 3 a 5 pasos priorizados. Si hay deuda impaga, prioriza regularizar y verificar actualización antes de sugerir nuevos productos.
- Nunca recomiendes endeudarse solo para "subir score". Nunca garantices eliminación de registros ni aprobación.
- Oculta el documento personal: solo últimos 2 dígitos si fue detectado.

Archivo: ${filename}

TEXTO DEL REPORTE:
${text}`;
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5.6-luna',input:prompt,reasoning:{effort:'low'},max_output_tokens:5000})});
    const data=await r.json();
    if(!r.ok)return res.status(502).json({error:'ai_error',message:data?.error?.message||'El proveedor de IA devolvió un error.'});
    let raw=getText(data).trim().replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim();
    const analysis=JSON.parse(raw);
    analysis.score=Math.max(0,Math.min(999,Number(analysis.score)||0));analysis.confidence=Math.max(0,Math.min(100,Number(analysis.confidence)||0));
    return res.status(200).json({analysis});
  }catch(e){return res.status(500).json({error:'analysis_failed',message:'No se pudo convertir el análisis en datos estructurados. Intenta nuevamente.'})}
};