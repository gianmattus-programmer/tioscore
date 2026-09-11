const crypto=require('crypto');
function sign(payload,secret){return crypto.createHmac('sha256',secret).update(payload).digest('base64url')}
function cookie(req,name){const m=('; '+(req.headers.cookie||'')).split('; '+name+'=');return m.length===2?m.pop().split(';').shift():''}
function verify(req){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret)return false;const token=cookie(req,'ts_admin');if(!token)return false;const [p,s]=token.split('.');if(!p||!s)return false;const expected=sign(p,secret);const A=Buffer.from(s),B=Buffer.from(expected);if(A.length!==B.length||!crypto.timingSafeEqual(A,B))return false;try{const data=JSON.parse(Buffer.from(p,'base64url').toString());return data.scope==='tioscore-admin'&&Date.now()<data.exp}catch{return false}}
module.exports=(req,res)=>{
  if(!process.env.ADMIN_PASSWORD||!process.env.ADMIN_SESSION_SECRET)return res.status(503).json({error:'config_missing'});
  return res.status(verify(req)?200:401).json({authenticated:verify(req)});
};