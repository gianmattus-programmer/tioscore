const crypto=require('crypto');
function sign(payload,secret){return crypto.createHmac('sha256',secret).update(payload).digest('base64url')}
function safeEqual(a,b){const A=Buffer.from(a||''),B=Buffer.from(b||'');return A.length===B.length&&crypto.timingSafeEqual(A,B)}
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  const password=process.env.ADMIN_PASSWORD,secret=process.env.ADMIN_SESSION_SECRET;
  if(!password||!secret)return res.status(503).json({error:'config_missing'});
  const supplied=(req.body&&req.body.password)||'';
  if(!safeEqual(supplied,password))return res.status(401).json({error:'invalid_credentials'});
  const payload=Buffer.from(JSON.stringify({exp:Date.now()+12*60*60*1000,scope:'tioscore-admin'})).toString('base64url');
  const token=payload+'.'+sign(payload,secret);
  res.setHeader('Set-Cookie','ts_admin='+token+'; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200');
  return res.status(200).json({ok:true});
};