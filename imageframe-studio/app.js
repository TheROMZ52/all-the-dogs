import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const $=id=>document.getElementById(id);
const state={file:null,url:"",width:1,height:1,client:null,bucket:"imageframe-images",items:[],selected:new Set()};
const saved=JSON.parse(localStorage.getItem("imageframe-studio")||"null");
if(saved){$("supabaseUrl").value=saved.url||"";$("supabaseKey").value=saved.key||"";$("bucketName").value=saved.bucket||"imageframe-images";state.bucket=saved.bucket||"imageframe-images";if(saved.url&&saved.key)connect(saved.url,saved.key)}

function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),2200)}
function setStatus(ok,m){$("statusDot").style.background=ok?"#5de1c2":"#ffb84d";$("statusText").textContent=m}
function formatBytes(n){if(n<1024)return n+" B";if(n<1048576)return(n/1024).toFixed(1)+" KB";if(n<1073741824)return(n/1048576).toFixed(2)+" MB";return(n/1073741824).toFixed(2)+" GB"}
function connect(url,key){try{state.client=createClient(url,key);setStatus(true,"Supabase connected");$("uploadBtn").disabled=!state.file;loadGallery()}catch{state.client=null;setStatus(false,"Invalid Supabase settings")}}
function copy(v){if(!v)return;navigator.clipboard.writeText(v).then(()=>toast("Copied")).catch(()=>toast("Copy failed"))}

$("settingsBtn").onclick=()=>$("settingsDialog").showModal();
$("saveSettingsBtn").onclick=()=>{const url=$("supabaseUrl").value.trim(),key=$("supabaseKey").value.trim(),bucket=$("bucketName").value.trim()||"imageframe-images";localStorage.setItem("imageframe-studio",JSON.stringify({url,key,bucket}));state.bucket=bucket;if(url&&key)connect(url,key);else setStatus(false,"Supabase not configured");toast("Settings saved")};
$("refreshGallery").onclick=loadGallery;
$("searchInput").oninput=renderGallery;

const dz=$("dropzone");
dz.addEventListener("dragover",e=>{e.preventDefault();dz.classList.add("drag")});
dz.addEventListener("dragleave",()=>dz.classList.remove("drag"));
dz.addEventListener("drop",e=>{e.preventDefault();dz.classList.remove("drag");const f=e.dataTransfer.files[0];if(f)selectFile(f)});
$("fileInput").onchange=e=>{const f=e.target.files[0];if(f)selectFile(f)};
$("resetFile").onclick=()=>{state.file=null;$("fileInput").value="";$("fileInfo").classList.add("hidden");$("preview").innerHTML='<div class="empty">Pick an image to preview it.</div>';$("dimensions").textContent="—";$("currentSize").textContent="—";$("uploadBtn").disabled=true};

function selectFile(file){
 if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){toast("Use PNG, JPG, WEBP or GIF");return}
 state.file=file;$("fileInfo").classList.remove("hidden");$("fileInfo").textContent=file.name+" · "+formatBytes(file.size)+" · "+file.type;
 const local=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{$("dimensions").textContent=img.naturalWidth+" × "+img.naturalHeight+" px";$("currentSize").textContent=img.naturalWidth+"×"+img.naturalHeight;$("preview").innerHTML="";$("preview").appendChild(img);URL.revokeObjectURL(local)};
 img.src=local;$("nameInput").value=file.name.replace(/\.[^.]+$/,"").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,48)||"my-image";$("uploadBtn").disabled=!state.client;updateCommand()
}

async function uploadBlob(){
 const max=Math.max(128,Math.min(4096,Number($("resizeInput").value)||2048));
 if(state.file.type==="image/gif")return state.file;
 const bmp=await createImageBitmap(state.file);
 if(bmp.width<=max)return state.file;
 const scale=max/bmp.width,canvas=document.createElement("canvas");canvas.width=Math.round(bmp.width*scale);canvas.height=Math.round(bmp.height*scale);canvas.getContext("2d").drawImage(bmp,0,0,canvas.width,canvas.height);
 return await new Promise(r=>canvas.toBlob(r,state.file.type,.92));
}
$("uploadBtn").onclick=async()=>{
 if(!state.client||!state.file)return;$("uploadBtn").disabled=true;$("uploadBtn").textContent="Uploading…";
 try{const blob=await uploadBlob(),safe=state.file.name.toLowerCase().replace(/[^a-z0-9._-]/g,"-"),path="imageframe/"+Date.now()+"-"+crypto.randomUUID()+"-"+safe;
 const{error}=await state.client.storage.from(state.bucket).upload(path,blob,{contentType:state.file.type,cacheControl:"31536000",upsert:false});if(error)throw error;
 const{data}=state.client.storage.from(state.bucket).getPublicUrl(path);state.url=data.publicUrl;$("urlInput").value=state.url;$("copyUrlBtn").disabled=false;updateCommand();await loadGallery();toast("Image uploaded")}catch(e){toast(e?.message||"Upload failed")}finally{$("uploadBtn").disabled=false;$("uploadBtn").textContent="Upload to Supabase"}
};
$("copyUrlBtn").onclick=()=>copy(state.url);$("copyCommandBtn").onclick=()=>copy($("commandOutput").textContent);

async function loadGallery(){
 if(!state.client)return;
 const{data,error}=await state.client.storage.from(state.bucket).list("imageframe",{limit:100,sortBy:{column:"created_at",order:"desc"}});
 if(error){$("gallery").innerHTML='<div class="empty">Could not read the bucket. Check the Storage policy.</div>';return}
 state.items=(data||[]).filter(x=>x.name&&!x.name.endsWith("/"));state.selected.clear();$("imageCount").textContent=state.items.length;renderGallery()
}
function renderGallery(){
 const q=$("searchInput").value.trim().toLowerCase(),items=state.items.filter(x=>x.name.toLowerCase().includes(q));$("deleteSelected").disabled=state.selected.size===0;
 if(!items.length){$("gallery").innerHTML='<div class="empty">No images found.</div>';return}
 $("gallery").innerHTML=items.map((x,i)=>{const path="imageframe/"+x.name,{data}=state.client.storage.from(state.bucket).getPublicUrl(path),checked=state.selected.has(x.name);return '<article class="card '+(checked?"selected":"")+'" data-name="'+encodeURIComponent(x.name)+'"><img loading="lazy" src="'+data.publicUrl+'" alt=""><div class="card-body"><label class="check"><input type="checkbox" '+(checked?"checked":"")+'> <span>Select</span></label><strong title="'+x.name+'">'+x.name+'</strong><small>'+(x.metadata?.size?formatBytes(x.metadata.size):"image")+'</small><div><button class="secondary use">Use</button><button class="secondary copy-img">URL</button></div></div></article>'}).join("");
 document.querySelectorAll(".card").forEach(card=>{const name=decodeURIComponent(card.dataset.name);card.querySelector("input").onchange=e=>{e.target.checked?state.selected.add(name):state.selected.delete(name);renderGallery()};card.querySelector(".use").onclick=()=>useImage(name);card.querySelector(".copy-img").onclick=()=>{const{data}=state.client.storage.from(state.bucket).getPublicUrl("imageframe/"+name);copy(data.publicUrl)};card.querySelector("img").onclick=()=>useImage(name)})
}
function useImage(name){const{data}=state.client.storage.from(state.bucket).getPublicUrl("imageframe/"+name);state.url=data.publicUrl;$("urlInput").value=state.url;$("copyUrlBtn").disabled=false;$("nameInput").value=name.replace(/\.[^.]+$/,"").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,48);updateCommand();window.scrollTo({top:$("nameInput").closest(".panel").offsetTop-80,behavior:"smooth"});toast("Image selected")}
$("deleteSelected").onclick=async()=>{
 if(!state.client||!state.selected.size)return;if(!confirm("Delete "+state.selected.size+" image(s) from Supabase Storage?"))return;
 const paths=[...state.selected].map(n=>"imageframe/"+n);const{error}=await state.client.storage.from(state.bucket).remove(paths);if(error)toast(error.message);else{toast("Deleted");await loadGallery()}
};

function updateCommand(){
 const name=$("nameInput").value.trim()||"my-image",url=state.url||"<url>",w=Math.max(1,Number($("widthInput").value)||1),h=Math.max(1,Number($("heightInput").value)||1),mode=$("modeInput").value;
 let cmd=mode==="selection"?"/imageframe create "+name+" "+url+" selection":mode==="combined"?"/imageframe create "+name+" "+url+" "+w+" "+h+" combined":mode==="overlay"?"/imageframe overlay "+name+" "+url:"/imageframe create "+name+" "+url+" "+w+" "+h;
 $("commandOutput").textContent=cmd;$("copyCommandBtn").disabled=!state.url
}
["nameInput","widthInput","heightInput","modeInput","urlInput"].forEach(id=>$(id).addEventListener("input",()=>{if(id==="urlInput")state.url=$(id).value.trim();updateCommand()}));
document.querySelectorAll("[data-size]").forEach(b=>b.onclick=()=>{const[a,c]=b.dataset.size.split("x");$("widthInput").value=a;$("heightInput").value=c;updateCommand()});
document.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>{const name=$("nameInput").value.trim()||"my-image",n=b.dataset.command,map={refresh:"/imageframe refresh "+name,get:"/imageframe get "+name,"get-selection":"/imageframe get "+name+" selection","get-combined":"/imageframe get "+name+" combined",delete:"/imageframe delete "+name,rename:"/imageframe rename "+name+" <new_name>",info:"/imageframe info",list:"/imageframe list"};$("commandOutput").textContent=map[n];copy(map[n])});
$("markerBtn").onclick=()=>{const image=$("nameInput").value.trim()||"my-image",marker=$("markerName").value.trim()||"marker",direction=Math.max(0,Math.min(15,Number($("markerDirection").value)||0)),type=$("markerType").value.trim()||"default",caption=$("markerCaption").value.trim(),cmd="/imageframe marker add "+image+" "+marker+" "+direction+" "+type+(caption?" "+caption:"");$("markerOutput").textContent=cmd;$("markerOutput").classList.remove("hidden");copy(cmd)};
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>copy(b.dataset.copy));
