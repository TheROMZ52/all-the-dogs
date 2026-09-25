import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const $ = id => document.getElementById(id);
const state = { file:null, url:"", width:1, height:1, client:null, bucket:"imageframe-images" };

const saved = JSON.parse(localStorage.getItem("imageframe-studio") || "null");
if (saved) {
  $("supabaseUrl").value = saved.url || "";
  $("supabaseKey").value = saved.key || "";
  $("bucketName").value = saved.bucket || "imageframe-images";
  state.bucket = saved.bucket || "imageframe-images";
  if (saved.url && saved.key) connect(saved.url, saved.key);
}

function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),2200)}
function formatBytes(n){if(n<1024)return n+" B";if(n<1048576)return (n/1024).toFixed(1)+" KB";return (n/1048576).toFixed(2)+" MB"}
function setStatus(ok,text){$("statusDot").style.background=ok?"#5de1c2":"#ffb84d";$("statusText").textContent=text}
function connect(url,key){try{state.client=createClient(url,key);setStatus(true,"Supabase connected")}catch{state.client=null;setStatus(false,"Invalid Supabase settings")}}

$("settingsBtn").onclick=()=>$("settingsDialog").showModal();
$("saveSettingsBtn").onclick=()=>{
  const url=$("supabaseUrl").value.trim(), key=$("supabaseKey").value.trim(), bucket=$("bucketName").value.trim()||"imageframe-images";
  localStorage.setItem("imageframe-studio",JSON.stringify({url,key,bucket}));
  state.bucket=bucket;
  if(url&&key) connect(url,key); else setStatus(false,"Supabase not configured");
  toast("Settings saved");
};

const dz=$("dropzone");
dz.addEventListener("dragover",e=>{e.preventDefault();dz.classList.add("drag")});
dz.addEventListener("dragleave",()=>dz.classList.remove("drag"));
dz.addEventListener("drop",e=>{e.preventDefault();dz.classList.remove("drag");const f=e.dataTransfer.files[0];if(f) selectFile(f)});
$("fileInput").onchange=e=>{const f=e.target.files[0];if(f)selectFile(f)};

function selectFile(file){
  if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){toast("Use PNG, JPG, WEBP or GIF");return}
  state.file=file;
  $("fileInfo").classList.remove("hidden");
  $("fileInfo").textContent=file.name+" · "+formatBytes(file.size)+" · "+file.type;
  const local=URL.createObjectURL(file), img=new Image();
  img.onload=()=>{$("dimensions").textContent=img.naturalWidth+" × "+img.naturalHeight+" px";$("preview").innerHTML="";$("preview").appendChild(img);URL.revokeObjectURL(local)};
  img.src=local;
  $("nameInput").value=file.name.replace(/\.[^.]+$/,"").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,48)||"my-image";
  $("uploadBtn").disabled=!state.client;
  if(!state.client)toast("Open Settings and connect Supabase first");
  updateCommand();
}

$("uploadBtn").onclick=async()=>{
  if(!state.client||!state.file)return;
  $("uploadBtn").disabled=true;$("uploadBtn").textContent="Uploading…";
  try{
    const safe=state.file.name.toLowerCase().replace(/[^a-z0-9._-]/g,"-");
    const path="imageframe/"+Date.now()+"-"+crypto.randomUUID()+"-"+safe;
    const {error}=await state.client.storage.from(state.bucket).upload(path,state.file,{contentType:state.file.type,cacheControl:"31536000",upsert:false});
    if(error)throw error;
    const {data}=state.client.storage.from(state.bucket).getPublicUrl(path);
    state.url=data.publicUrl;$("urlInput").value=state.url;$("copyUrlBtn").disabled=false;updateCommand();toast("Image uploaded");
  }catch(e){toast(e?.message||"Upload failed")}finally{$("uploadBtn").disabled=false;$("uploadBtn").textContent="Upload to Supabase"}
};

$("copyUrlBtn").onclick=()=>copy(state.url);
$("copyCommandBtn").onclick=()=>copy($("commandOutput").textContent);

function copy(text){if(!text)return;navigator.clipboard.writeText(text).then(()=>toast("Copied"))}

function updateCommand(){
  const name=$("nameInput").value.trim()||"my-image", url=state.url||"<url>";
  const w=Math.max(1,Number($("widthInput").value)||1), h=Math.max(1,Number($("heightInput").value)||1), mode=$("modeInput").value;
  let cmd;
  if(mode==="selection")cmd="/imageframe create "+name+" "+url+" selection";
  else if(mode==="combined")cmd="/imageframe create "+name+" "+url+" "+w+" "+h+" combined";
  else if(mode==="overlay")cmd="/imageframe overlay "+name+" "+url;
  else cmd="/imageframe create "+name+" "+url+" "+w+" "+h;
  $("commandOutput").textContent=cmd;$("copyCommandBtn").disabled=!state.url;
}
["nameInput","widthInput","heightInput","modeInput","urlInput"].forEach(id=>$(id).addEventListener("input",()=>{if(id==="urlInput")state.url=$(id).value.trim();updateCommand()}));

document.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>{
  const name=$("nameInput").value.trim()||"my-image";
  const n=b.dataset.command;
  const map={refresh:"/imageframe refresh "+name,get:"/imageframe get "+name,"get-selection":"/imageframe get "+name+" selection","get-combined":"/imageframe get "+name+" combined",delete:"/imageframe delete "+name,rename:"/imageframe rename "+name+" <new_name>",info:"/imageframe info",list:"/imageframe list"};
  copy(map[n]);
  $("commandOutput").textContent=map[n];
});

$("markerBtn").onclick=()=>{
  const image=$("nameInput").value.trim()||"my-image", marker=$("markerName").value.trim()||"marker", direction=Math.max(0,Math.min(15,Number($("markerDirection").value)||0)), type=$("markerType").value.trim()||"default", caption=$("markerCaption").value.trim();
  const cmd="/imageframe marker add "+image+" "+marker+" "+direction+" "+type+(caption?" "+caption:"");
  $("markerOutput").textContent=cmd;$("markerOutput").classList.remove("hidden");copy(cmd)
};
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copy(b.dataset.copy));

$("urlInput").addEventListener("paste",()=>setTimeout(()=>{state.url=$("urlInput").value.trim();updateCommand()},0));
