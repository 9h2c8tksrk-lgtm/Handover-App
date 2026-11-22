(() => {
'use strict';
function init(){
 const photo=document.getElementById('bcPhoto'),part=document.getElementById('bcPart'),desc=document.getElementById('bcDesc');
 if(!photo||!part||!desc||document.getElementById('geOcrPanel'))return;
 const panel=document.createElement('section');panel.id='geOcrPanel';panel.style.cssText='background:#20252b;color:#fff;border:1px solid #d4a62d;border-radius:12px;padding:12px;margin:12px 0';
 panel.innerHTML=`<strong>Photo label reader: review before saving</strong><p id="geOcrStatus" role="status" aria-live="polite">Take a close, clear photograph of the product label.</p><canvas id="geOcrCanvas" style="width:100%;max-height:360px;object-fit:contain;touch-action:none;border:1px solid #777;display:none"></canvas><p id="geCropHint" hidden>Drag across the image to select the printed label, then tap Read selection.</p><button id="geReadSelection" type="button" hidden>Read selected label</button><button id="geReadWhole" type="button" hidden class="sec">Read full photo</button><div id="geOcrReview" hidden><label for="geOcrPrimary">Primary / supplier part number</label><select id="geOcrPrimary" style="width:100%"></select><label for="geOcrManual">Correct part number</label><input id="geOcrManual" autocomplete="off"><label for="geOcrDescription">Description</label><input id="geOcrDescription" autocomplete="off"><label for="geOcrCross">Other reference (not Business Central part number)</label><input id="geOcrCross" autocomplete="off"><p id="geOcrConfidence"></p><button id="geOcrApply" type="button">Use confirmed part and description</button><details><summary>All OCR text</summary><pre id="geOcrRaw" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre></details></div>`;
 photo.after(panel);
 const $=id=>document.getElementById(id),canvas=$('geOcrCanvas'),ctx=canvas.getContext('2d');let source=null,rect=null,drag=null,loading=null;
 const status=text=>$('geOcrStatus').textContent=text;
 function loadOCR(){if(window.Tesseract)return Promise.resolve();if(!loading)loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>reject(Error('OCR library could not load; internet required'));document.head.append(script)}).catch(e=>{loading=null;throw e});return loading}
 function redraw(){if(!source)return;ctx.drawImage(source,0,0,canvas.width,canvas.height);if(rect){ctx.strokeStyle='#ffbf3a';ctx.lineWidth=4;ctx.strokeRect(rect.x,rect.y,rect.w,rect.h)}}
 function point(e){const b=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(canvas.width,(e.clientX-b.left)*canvas.width/b.width)),y:Math.max(0,Math.min(canvas.height,(e.clientY-b.top)*canvas.height/b.height))}}
 canvas.addEventListener('pointerdown',e=>{if(!source)return;canvas.setPointerCapture(e.pointerId);drag=point(e);rect=null});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const q=point(e);rect={x:Math.min(drag.x,q.x),y:Math.min(drag.y,q.y),w:Math.abs(drag.x-q.x),h:Math.abs(drag.y-q.y)};redraw()});
 canvas.addEventListener('pointerup',()=>{drag=null;if(rect&&(rect.w<20||rect.h<20))rect=null;redraw()});
 photo.addEventListener('change',()=>{const file=photo.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>12e6){status('Choose an image under 12 MB.');return}const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{source=img;const scale=Math.min(1,1600/img.width,1600/img.height);canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));rect=null;redraw();canvas.style.display='block';$('geCropHint').hidden=false;$('geReadSelection').hidden=false;$('geReadWhole').hidden=false;$('geOcrReview').hidden=true;status('Drag around the part-number label, then tap Read selected label.');URL.revokeObjectURL(url)};img.onerror=()=>{status('Unable to open photo.');URL.revokeObjectURL(url)};img.src=url});
 function analyse(text){
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean),upper=text.toUpperCase();
 const brand=/FLEETGUARD/i.test(text)?'Fleetguard':/CASTROL/i.test(text)?'Castrol':'';
 const options=[];const add=(value,reason,score)=>{value=value.toUpperCase().replace(/[^A-Z0-9._/-]/g,'');if(value.length<4||options.some(o=>o.value===value))return;options.push({value,reason,score})};
 for(const m of upper.matchAll(/\bLF\s*[- ]?\s*\d{4,6}[A-Z]{0,3}\b/g))add(m[0].replace(/[ -]/g,''),'Fleetguard LF-series pattern',95);
 for(const line of lines){
 const label=line.match(/(?:ITEM\s*(?:NO|NUMBER)?|PART\s*(?:NO|NUMBER|#)?|P\/?N|SKU|PRODUCT\s*CODE)\s*[:#.-]?\s*([A-Z0-9][A-Z0-9._/-]{3,})/i);
 if(label)add(label[1],'Explicit part/item label',90);
 for(const token of (line.toUpperCase().match(/\b[A-Z0-9][A-Z0-9._/-]{3,}\b/g)||[])){
 if(/^(?:MAGNATEC|FLEETGUARD|CASTROL|CUMMINS|PROTECTION|INSTANT|START|FILTER)$/.test(token))continue;
 if(/[0-9]/.test(token)&&/[A-Z]/.test(token))add(token,'Alphanumeric candidate',55);
 }
 }
 const numeric=[...upper.matchAll(/\b\d{6,9}\b/g)].map(m=>m[0]);
 if(brand==='Castrol'){const item=upper.match(/ITEM\s*(?:NO|NUMBER)?\s*[:#.-]?\s*(\d{6,9})/);if(item)add(item[1],'Castrol item number',92)}
 const cross=brand==='Fleetguard'?(upper.match(/CUMMINS\s*[:#-]?\s*(\d{6,9})/)?.[1]||numeric.find(x=>!options.some(o=>o.value===x))||''):'';
 if(!options.length&&numeric.length)add(numeric[0],'Numeric candidate, verify carefully',35);
 options.sort((a,b)=>b.score-a.score);
 let description='';
 if(brand==='Fleetguard')description='Fleetguard Filter'+(options[0]?' '+options[0].value:'');
 else if(brand==='Castrol'){const product=/MAGNATEC/i.test(text)?'MAGNATEC':'Oil';const grade=upper.match(/\b\d{1,2}W[- ]?\d{2}(?:\s*[A-Z])?\b/)?.[0]||'';const size=upper.match(/\b\d+(?:\.\d+)?\s*L\b/)?.[0]||'';description=['Castrol',product,grade,size].filter(Boolean).join(' ')}
 else {const labeled=lines.find(x=>/^(?:DESCRIPTION|DESC|PRODUCT NAME)\s*[:#-]/i.test(x));description=labeled?labeled.replace(/^(?:DESCRIPTION|DESC|PRODUCT NAME)\s*[:#-]\s*/i,''):(lines.find(x=>/[A-Z]{3,}/i.test(x)&&x.length>9)||'')}
 return{options,description,cross,brand};
 }
 async function read(useSelection){if(!source)return;const bounds=useSelection&&rect&&rect.w>20&&rect.h>20?rect:{x:0,y:0,w:canvas.width,h:canvas.height};const output=document.createElement('canvas');const scale=Math.min(3,Math.max(1,1400/bounds.w));output.width=Math.round(bounds.w*scale);output.height=Math.round(bounds.h*scale);const c=output.getContext('2d',{willReadFrequently:true});c.drawImage(canvas,bounds.x,bounds.y,bounds.w,bounds.h,0,0,output.width,output.height);const image=c.getImageData(0,0,output.width,output.height);for(let i=0;i<image.data.length;i+=4){const v=Math.max(0,Math.min(255,(.299*image.data[i]+.587*image.data[i+1]+.114*image.data[i+2]-128)*1.45+128));image.data[i]=image.data[i+1]=image.data[i+2]=v}c.putImageData(image,0,0);
 $('geReadSelection').disabled=$('geReadWhole').disabled=true;status('Reading selected label...');try{await loadOCR();const result=await window.Tesseract.recognize(output,'eng');const text=result.data?.text||'';const found=analyse(text);const select=$('geOcrPrimary');select.replaceChildren();if(!found.options.length)select.add(new Option('No confident candidate',''));for(const opt of found.options)select.add(new Option(`${opt.value} (${opt.reason})`,opt.value));$('geOcrManual').value=found.options[0]?.value||'';$('geOcrDescription').value=found.description;$('geOcrCross').value=found.cross;$('geOcrRaw').textContent=text||'No text detected';$('geOcrConfidence').textContent=found.options[0]?`Suggested match: ${found.options[0].reason}. Verify visually; this is not a measured OCR confidence score.`:'No reliable part number. Enter it manually.';$('geOcrReview').hidden=false;status('Review and correct the suggested fields before applying.')}catch(e){status('OCR failed: '+e.message)}finally{$('geReadSelection').disabled=$('geReadWhole').disabled=false}}
 $('geReadSelection').addEventListener('click',()=>read(true));$('geReadWhole').addEventListener('click',()=>read(false));$('geOcrPrimary').addEventListener('change',e=>{if(e.target.value)$('geOcrManual').value=e.target.value});
 $('geOcrApply').addEventListener('click',()=>{const value=$('geOcrManual').value.trim();if(!value){status('Confirm a part number before applying.');return}part.value=value;part.dispatchEvent(new Event('change',{bubbles:true}));desc.value=$('geOcrDescription').value.trim();status('Part and description filled in. Cross-reference: '+($('geOcrCross').value.trim()||'none')+'. Confirm your Business Central item number before saving.');$('geOcrReview').hidden=true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
