const crypto=require('crypto');

function sign(payload,secret){
  return crypto.createHmac('sha256',secret).update(payload).digest('base64url')
}
function cookie(req,name){
  const m=('; '+(req.headers.cookie||'')).split('; '+name+'=');
  return m.length===2?m.pop().split(';').shift():''
}
function authed(req){
  const secret=process.env.ADMIN_SESSION_SECRET;
  if(!secret)return false;
  const token=cookie(req,'ts_admin');
  if(!token)return false;
  const [p,s]=token.split('.');
  if(!p||!s)return false;
  const expected=sign(p,secret),A=Buffer.from(s),B=Buffer.from(expected);
  if(A.length!==B.length||!crypto.timingSafeEqual(A,B))return false;
  try{
    const d=JSON.parse(Buffer.from(p,'base64url').toString());
    return d.scope==='tioscore-admin'&&Date.now()<d.exp
  }catch{return false}
}
function outputText(data){
  if(typeof data.output_text==='string'&&data.output_text)return data.output_text;
  return (data.output||[]).flatMap(v=>v.content||[]).map(v=>v.text||'').join('')
}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!process.env.ADMIN_PASSWORD||!process.env.ADMIN_SESSION_SECRET)
    return res.status(503).json({error:'config_missing'});
  if(!authed(req))return res.status(401).json({error:'unauthorized'});
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  if(!process.env.OPENAI_API_KEY)
    return res.status(503).json({error:'ai_not_configured',message:'Falta configurar OPENAI_API_KEY en Vercel.'});

  const image=String(req.body?.image||'');
  const page=Number(req.body?.page)||0;
  const filename=String(req.body?.filename||'reporte.pdf');

  if(!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image))
    return res.status(400).json({error:'invalid_image',message:'La página no llegó como imagen válida.'});

  if(image.length>3_200_000)
    return res.status(413).json({error:'image_too_large',message:'La página escaneada es demasiado pesada para procesarla.'});

  const instruction=`Lee visualmente esta página de un reporte crediticio peruano, normalmente Sentinel.

TAREA:
- Transcribe TODO el contenido legible de la página.
- Conserva títulos, subtítulos, nombres de entidades, cifras, fechas, estados, clasificaciones, tablas, filas y columnas.
- Para tablas usa líneas de texto claras separando columnas con " | ".
- No resumas, no interpretes y no inventes.
- Si una celda no se puede leer, escribe [ilegible].
- Si hay gráficos, describe sus etiquetas, fechas y valores visibles.
- Si hay iconos o colores que representen estados, indica el estado textual si puede inferirse claramente de la leyenda o etiqueta.
- Omite únicamente elementos decorativos sin información.
- Devuelve SOLO la transcripción en texto plano.

Archivo: ${filename}
Página: ${page}`;

  try{
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{
        Authorization:'Bearer '+process.env.OPENAI_API_KEY,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:'gpt-5.6-luna',
        input:[{
          role:'user',
          content:[
            {type:'input_text',text:instruction},
            {type:'input_image',image_url:image,detail:'high'}
          ]
        }],
        reasoning:{effort:'low'},
        max_output_tokens:6000
      })
    });
    const data=await r.json();
    if(!r.ok)return res.status(502).json({
      error:'vision_error',
      message:data?.error?.message||'No se pudo leer visualmente la página.'
    });
    const text=outputText(data).trim();
    return res.status(200).json({page,text});
  }catch(e){
    return res.status(500).json({error:'vision_failed',message:'Falló la lectura visual de la página.'});
  }
};