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
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(!authed(req))return res.status(401).json({error:'unauthorized'});
 return res.status(410).json({
  error:'vision_disabled',
  message:'La lectura visual con IA está desactivada. Tío Score usa OCR local en el navegador para no consumir tokens.'
 });
};
