import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

env.allowLocalModels=false;
env.allowRemoteModels=true;
env.useBrowserCache=true;
env.useWasmCache=true;

let generator=null;
let generatorPromise=null;
let backend="";
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
async function loadPipeline(id,device){
  send(id,"status",{message:device==="webgpu"?"Preparando Qwen por WebGPU…":"Preparando Qwen por CPU/WASM…"});
  return pipeline("text-generation",MODEL_ID,{
    dtype:"q4",
    device,
    progress_callback:p=>{
      const pct=progressToPct(p);
      const label=String(p?.file||p?.status||"Cargando modelo");
      send(id,"progress",{progress:pct,message:label,backend:device});
    }
  });
}
async function ensureGenerator(id){
  if(generator)return generator;
  if(generatorPromise)return generatorPromise;
  generatorPromise=(async()=>{
    if("gpu" in self.navigator){
      try{
        const pipe=await loadPipeline(id,"webgpu");
        generator=pipe;backend="webgpu";
        return pipe;
      }catch(err){
        send(id,"status",{message:"WebGPU no pudo iniciar. Cambiando a CPU/WASM…"});
      }
    }
    const pipe=await loadPipeline(id,"wasm");
    generator=pipe;backend="wasm";
    return pipe;
  })().catch(err=>{
    generatorPromise=null;
    throw err;
  });
  return generatorPromise;
}
self.onmessage=async e=>{
  const {id,type,messages,maxNewTokens=180}=e.data||{};
  if(!id)return;
  try{
    const gen=await ensureGenerator(id);
    if(type==="init"){
      const out=await gen([{role:"user",content:"Responde solo: OK"}],{max_new_tokens:5,do_sample:false});
      const text=generatedText(out);
      if(!text)throw new Error("Qwen local cargó pero no generó texto.");
      send(id,"ready",{model:MODEL_ID,probe:text.slice(0,30),backend});
      return;
    }
    if(type==="generate"){
      const out=await gen(messages||[],{
        max_new_tokens:maxNewTokens,
        do_sample:false,
        repetition_penalty:1.06
      });
      const text=generatedText(out);
      if(!text)throw new Error("Qwen local no devolvió contenido.");
      send(id,"result",{text,model:MODEL_ID,backend});
    }
  }catch(err){
    send(id,"error",{message:String(err?.message||err||"Error Qwen local"),backend});
  }
};
