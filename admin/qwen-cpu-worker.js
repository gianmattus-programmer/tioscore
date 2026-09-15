import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

env.allowLocalModels=false;
env.allowRemoteModels=true;
env.useBrowserCache=true;
env.useWasmCache=true;

let generator=null;
let generatorPromise=null;
const MODEL_ID="onnx-community/Qwen2.5-0.5B-Instruct";

function send(id,type,data={}){self.postMessage({id,type,...data})}
function progressToPct(p){
  const raw=Number(p?.progress);
  if(Number.isFinite(raw))return raw<=1?Math.round(raw*100):Math.round(raw);
  return null;
}
function generatedText(out){
  const row=Array.isArray(out)?out[0]:out;
  const g=row?.generated_text;
  if(Array.isArray(g)){
    const last=[...g].reverse().find(x=>x?.role==="assistant")||g[g.length-1];
    return String(last?.content||"").trim();
  }
  return String(g||row?.text||"").trim();
}
async function ensureGenerator(id){
  if(generator)return generator;
  if(generatorPromise)return generatorPromise;
  send(id,"status",{message:"Preparando Qwen local estable…"});
  generatorPromise=pipeline("text-generation",MODEL_ID,{
    dtype:"q4",
    progress_callback:p=>{
      const pct=progressToPct(p);
      const label=String(p?.file||p?.status||"Descargando modelo");
      send(id,"progress",{progress:pct,message:label});
    }
  }).then(pipe=>{
    generator=pipe;
    return pipe;
  }).catch(err=>{
    generatorPromise=null;
    throw err;
  });
  return generatorPromise;
}
self.onmessage=async e=>{
  const {id,type,messages,maxNewTokens=420}=e.data||{};
  if(!id)return;
  try{
    const gen=await ensureGenerator(id);
    if(type==="init"){
      const out=await gen([{role:"user",content:"Responde solo: OK"}],{max_new_tokens:5,do_sample:false});
      const text=generatedText(out);
      if(!text)throw new Error("Qwen local cargó pero no generó texto.");
      send(id,"ready",{model:MODEL_ID,probe:text.slice(0,30)});
      return;
    }
    if(type==="generate"){
      const out=await gen(messages||[],{
        max_new_tokens:maxNewTokens,
        do_sample:false,
        repetition_penalty:1.08
      });
      const text=generatedText(out);
      if(!text)throw new Error("Qwen local no devolvió contenido.");
      send(id,"result",{text,model:MODEL_ID});
    }
  }catch(err){
    send(id,"error",{message:String(err?.message||err||"Error Qwen local")});
  }
};
