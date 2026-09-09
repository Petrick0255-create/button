"use strict";

const STORAGE={api:"jbGeminiApiKey",model:"jbGeminiModel",rules:"jbExamMakerRules"};
const SOURCE_ROOT="https://petrick0255-create.github.io/science-lab/programs/problem-idea/";
const DATA_ROOT=`${SOURCE_ROOT}data`;
const DEFAULT_RULES={
  commonRules:`- 2022 개정 교육과정 통합과학 범위 안에서 출제한다.\n- 참고 문항의 표현이나 수치를 그대로 복제하지 않고, 핵심 개념과 자료 구성 방식만 참고한다.\n- 문제에서 주어진 조건만으로 정답을 하나로 확정할 수 있어야 한다.\n- 발문, 자료, 보기, 선택지, 정답, 해설 사이에 모순이 없어야 한다.`,
  analysisRules:`- 문제 분석에서는 미지의 대상이 무엇인지 먼저 밝힌다.\n- 문제에서 A로 주어졌고 정답이 수소라면 “A는 수소(H)이다.”라고 쓴다.\n- 이후에는 “A(수소)는 원자가 전자가 1개이다.”처럼 기호와 실제 대상을 함께 쓴다.\n- 문제 해결에 실제로 필요한 조건을 순서대로 설명한다.`,
  solutionRules:`- 정답 선지는 ㄱ, ㄴ, ㄷ 순서로 각각 근거를 설명한다.\n- 틀린 선지는 [오답 풀이] 뒤에 선지별로 틀린 이유를 설명한다.\n- 계산형 문항은 사용한 식, 대입 과정, 단위를 생략하지 않는다.\n- 정답 번호와 보기의 참·거짓 조합이 반드시 일치해야 한다.`,
  notationRules:`- 원소는 처음 등장할 때 한글명과 원소 기호를 함께 쓴다.\n- 화학식의 원자 수는 아래첨자, 이온의 전하는 위첨자로 표현한다.\n- 물리량 기호는 이탤릭체를 전제로 작성하고 단위는 로마체로 구분한다.\n- 범위 기호는 물결표(~)가 아니라 en dash(–)를 사용한다.\n- 선택지는 ①, ②, ③, ④, ⑤를 사용한다.`,
  forbiddenRules:`- “무조건”, “항상”처럼 과도하게 단정하는 표현을 근거 없이 사용하지 않는다.\n- 교육과정 밖의 전문 용어가 정답 판단에 필요하도록 만들지 않는다.\n- 복수 정답, 정답 없음, 조건 부족 문항을 만들지 않는다.\n- 자료에 표시되지 않은 값을 해설에서 임의로 사용하지 않는다.\n- 참고 문항의 고유한 수치와 문장 배열을 그대로 재사용하지 않는다.`
};
const state={db:[],types:[],references:[],result:null,shards:new Map()};
const $=id=>document.getElementById(id);

document.addEventListener("DOMContentLoaded",init);
async function init(){
  bindTabs();bindEvents();loadRules();loadApiSettings();
  try{const res=await fetch(`${DATA_ROOT}/search-index.json`,{cache:"no-cache"});if(!res.ok)throw new Error(`HTTP ${res.status}`);const payload=await res.json();state.db=payload.filter(x=>x.s==="통합과학").map(indexRow);state.types=[...new Set(state.db.map(x=>x.type).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ko"));$("typeSelect").replaceChildren(new Option("유형을 선택하세요",""),...state.types.map(x=>new Option(`${x} (${state.db.filter(y=>y.type===x).length})`,x)));$("dataStatus").textContent=`통합과학 ${state.db.length.toLocaleString("ko-KR")}문항 준비됨`;}catch(e){$("dataStatus").textContent="DB 로딩 실패";alert(`문항 DB를 불러오지 못했습니다. ${e.message}`)}
}
function absoluteSourceUrl(value){return value?new URL(value,SOURCE_ROOT).href:""}
function indexRow(row){return{id:row.i,grade:row.g,subject:row.s,year:Number(row.y)||0,sourceYear:Number(row.sy??row.y)||0,month:Number(row.m)||0,exam:row.e,number:Number(row.n)||0,type:row.t||"미분류",prompt:row.q||"",view:"",choices:[],answer:"",explanation:"",imageUrl:absoluteSourceUrl(row.lim||row.im),fallbackImageUrl:row.im||"",problemUrl:absoluteSourceUrl(row.lp||row.p),solutionUrl:absoluteSourceUrl(row.lsol||row.sol),status:row.st||"",formatTags:detectFormat(row.q||""),detailFile:row.d,detailRow:Number(row.r)||0,excluded:false}}
function detectFormat(text){const tags=[];if(/표는|\[실험 결과\]|자료는/.test(text))tags.push("표·자료");if(/그래프|곡선|좌표/.test(text))tags.push("그래프");if(/그림|모식도|장치/.test(text))tags.push("그림");if(/실험|탐구 과정|탐구 활동/.test(text))tags.push("실험·탐구");if(/ㄱ\.|ㄴ\.|<보기>|〈보기〉/.test(text))tags.push("보기형");return tags.length?[...new Set(tags)]:["개념형"]}
async function hydrate(row){if(row.explanation)return row;if(!state.shards.has(row.detailFile)){const promise=fetch(`${DATA_ROOT}/details/${row.detailFile}.json`).then(res=>{if(!res.ok)throw new Error(`상세 문항 HTTP ${res.status}`);return res.json()});state.shards.set(row.detailFile,promise)}const item=(await state.shards.get(row.detailFile))[row.detailRow];if(!item)throw new Error(`${row.id} 상세 문항을 찾지 못했습니다.`);return{...row,prompt:item.prompt||row.prompt,view:item.view||"",choices:(item.choices||[]).map(x=>String(x||"")),answer:String(item.answer||""),explanation:item.explanation||"",imageUrl:absoluteSourceUrl(item.localImageUrl||item.imageUrl)||row.imageUrl,fallbackImageUrl:item.imageUrl||row.fallbackImageUrl}}
function bindTabs(){document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>openTab(btn.dataset.tab)))}
function openTab(name){document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===`${name}Panel`))}
function bindEvents(){
  $("apiButton").addEventListener("click",()=>$("apiDialog").showModal());$("saveApi").addEventListener("click",saveApiSettings);$("removeApi").addEventListener("click",removeApiSettings);
  $("saveRules").addEventListener("click",saveRules);$("resetRules").addEventListener("click",resetRules);
  $("typeSelect").addEventListener("change",drawReferences);$("formatSelect").addEventListener("change",drawReferences);$("referenceCount").addEventListener("change",drawReferences);$("normalOnly").addEventListener("change",drawReferences);$("drawReferences").addEventListener("click",drawReferences);
  $("generateButton").addEventListener("click",generate);$("copyQuestion").addEventListener("click",()=>copyResult(false));$("copyAll").addEventListener("click",()=>copyResult(true));
}
function loadRules(){const saved=JSON.parse(localStorage.getItem(STORAGE.rules)||"null")||DEFAULT_RULES;Object.keys(DEFAULT_RULES).forEach(k=>$(k).value=saved[k]??DEFAULT_RULES[k])}
function collectRules(){return Object.fromEntries(Object.keys(DEFAULT_RULES).map(k=>[k,$(k).value.trim()]))}
function saveRules(){localStorage.setItem(STORAGE.rules,JSON.stringify(collectRules()));flash($("saveRules"),"저장됨")}
function resetRules(){if(!confirm("입력한 규칙을 기본값으로 되돌릴까요?"))return;Object.keys(DEFAULT_RULES).forEach(k=>$(k).value=DEFAULT_RULES[k]);saveRules()}
function loadApiSettings(){$("apiKey").value=localStorage.getItem(STORAGE.api)||"";$("modelName").value=localStorage.getItem(STORAGE.model)||"gemini-3.5-flash";updateApiButton()}
function saveApiSettings(){const key=$("apiKey").value.trim(),model=$("modelName").value.trim();if(!key||!model){alert("API 키와 모델명을 입력해 주세요.");return}localStorage.setItem(STORAGE.api,key);localStorage.setItem(STORAGE.model,model);$("apiDialog").close();updateApiButton()}
function removeApiSettings(){localStorage.removeItem(STORAGE.api);$("apiKey").value="";updateApiButton();$("apiDialog").close()}
function updateApiButton(){$("apiButton").textContent=localStorage.getItem(STORAGE.api)?"API 연결됨":"API 설정"}
function shuffle(array){const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function drawReferences(){
  const type=$("typeSelect").value;if(!type){state.references=[];renderReferences();return}
  const format=$("formatSelect").value,count=Number($("referenceCount").value),normalOnly=$("normalOnly").checked;
  let candidates=state.db.filter(x=>x.type===type&&(!normalOnly||x.status==="정상"));
  const preferred=format==="auto"?candidates:candidates.filter(x=>x.formatTags.includes(format));
  const first=shuffle(preferred),rest=shuffle(candidates.filter(x=>!first.some(y=>y.id===x.id)));
  const picked=[];for(const row of [...first,...rest]){if(picked.some(x=>x.id===row.id))continue;if(format==="auto"&&picked.length&&picked.every(x=>x.formatTags.join("|")===row.formatTags.join("|"))&&candidates.length>count)continue;picked.push({...row,excluded:false});if(picked.length===count)break}
  if(picked.length<count){for(const row of shuffle(candidates)){if(picked.some(x=>x.id===row.id))continue;picked.push({...row,excluded:false});if(picked.length===count)break}}
  state.references=picked;renderReferences();
}
function renderReferences(){const box=$("referenceList");if(!state.references.length){box.innerHTML='<div class="empty">유형을 선택해 주세요.</div>';return}box.replaceChildren(...state.references.map((row,index)=>{const btn=document.createElement("button");btn.type="button";btn.className=`reference-card${row.excluded?" excluded":""}`;btn.innerHTML=`<img alt="${escapeHtml(sourceText(row))} 문제" loading="lazy"><div><strong>${escapeHtml(sourceText(row))}</strong><p>${escapeHtml(row.prompt.slice(0,115))}</p>${row.formatTags.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`;const img=btn.querySelector("img");loadImage(img,row);btn.addEventListener("click",()=>{state.references[index].excluded=!state.references[index].excluded;renderReferences()});return btn}))}
function sourceText(row){const year=String(row.sourceYear||row.year).padStart(2,"0"),month=String(row.month).padStart(2,"0"),num=String(row.number).padStart(2,"0");return `${year} ${month} 고1 통합과학 ${num}번`}
function loadImage(img,row){const urls=[row.imageUrl,row.fallbackImageUrl].filter(Boolean);let i=0;img.onerror=()=>{i++;if(i<urls.length)img.src=urls[i];else img.style.visibility="hidden"};if(urls.length)img.src=urls[0]}
async function imagePart(row){for(const url of [row.imageUrl,row.fallbackImageUrl].filter(Boolean)){try{const res=await fetch(url);if(!res.ok)continue;const blob=await res.blob();const data=await blobToBase64(blob);return{inlineData:{mimeType:blob.type||"image/png",data}}}catch{}}return null}
function blobToBase64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(",")[1]);r.onerror=reject;r.readAsDataURL(blob)})}
function referenceText(row){return `출처: ${sourceText(row)}\n유형: ${row.type}\n발문:\n${row.prompt}\n보기:\n${row.view}\n선지:\n${row.choices.map((x,i)=>`${"①②③④⑤"[i]} ${x}`).join("\n")}\n정답: ${row.answer}\n해설:\n${row.explanation}`}
async function generate(){
  const api=localStorage.getItem(STORAGE.api),model=localStorage.getItem(STORAGE.model)||"gemini-3.5-flash",refs=state.references.filter(x=>!x.excluded);
  if(!api){$("apiDialog").showModal();return}if(!$("typeSelect").value){alert("문항 유형을 선택해 주세요.");return}if(refs.length<2){alert("참고 문항을 2개 이상 포함해 주세요.");return}
  saveRules();$("generateButton").disabled=true;$("progressBox").hidden=false;openTab("generate");
  try{
    progress(12,"1/3 참고 문항 분석","이미지와 원문을 함께 읽어 문항 구조를 분리하고 있습니다.");
    const fullRefs=await Promise.all(refs.map(hydrate));
    const imageParts=(await Promise.all(fullRefs.map(imagePart))).filter(Boolean);
    const analysis=await callGemini(api,model,[{text:`다음 ${fullRefs.length}개의 통합과학 문항을 분석하라. 새 문항은 아직 만들지 않는다. 공통 개념, 각 문항의 자료 형식, 수치·조건 구조, 난이도 요인, 결합 가능한 요소, 그대로 복제하면 안 되는 요소를 JSON으로 반환하라.\n\n${fullRefs.map(referenceText).join("\n\n---\n\n")}`},...imageParts],analysisSchema());
    progress(48,"2/3 변형 문항 생성","참고 구조를 결합해 새로운 문제와 해설을 만들고 있습니다.");
    const rules=collectRules(),generation=await callGemini(api,model,[{text:`평가원 형식의 고1 통합과학 문항 1개를 생성하라. 참고 문항을 단순 복제하지 말고 분석된 구조를 새 상황과 새 수치로 재구성하라.\n\n[목표]\n유형: ${$("typeSelect").value}\n문항 번호: ${$("questionNumber").value}\n난이도: ${$("difficulty").value}\n자료 형식: ${$("formatSelect").value}\n추가 지시: ${$("extraPrompt").value||"없음"}\n\n[규칙]\n${Object.values(rules).join("\n\n")}\n\n[참고 문항 분석]\n${JSON.stringify(analysis)}\n\n필요한 표는 visual.type=table과 headers/rows로 표현한다. 그래프나 그림은 visual.type=description으로 정확한 제작 명세를 description에 쓴다. JSON 스키마를 지켜라.`}],questionSchema());
    progress(78,"3/3 논리 검토·교정","정답을 독립적으로 다시 풀고 조건과 해설을 교정하고 있습니다.");
    const reviewed=await callGemini(api,model,[{text:`아래 생성 문항을 독립적으로 다시 풀어 검토하라. 정답 유일성, 조건 충분성, 각 보기의 참·거짓, 선택지 조합, 수치·단위, 표·그림과 본문의 일치, 통합과학 범위, 작성 규칙을 검사하라. 오류가 하나라도 있으면 직접 고쳐 correctedQuestion에 완성본을 넣어라. 오류가 없어도 correctedQuestion에 원문 전체를 그대로 넣어라.\n\n[작성 규칙]\n${Object.values(rules).join("\n\n")}\n\n[생성 문항]\n${JSON.stringify(generation)}`}],reviewSchema());
    state.result={...reviewed.correctedQuestion,review:reviewed.review,references:fullRefs.map(sourceText),number:$("questionNumber").value,difficulty:$("difficulty").value,type:$("typeSelect").value};renderResult();progress(100,"완료","검토와 교정이 끝났습니다.");openTab("result");
  }catch(e){console.error(e);progress(0,"생성 실패",e.message);alert(`문항 생성에 실패했습니다.\n${e.message}`)}finally{$("generateButton").disabled=false}
}
async function callGemini(api,model,parts,schema){const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(api)}`;const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{temperature:.55,responseMimeType:"application/json",responseSchema:schema}})});const payload=await res.json();if(!res.ok)throw new Error(payload?.error?.message||`Gemini API 오류 ${res.status}`);const text=payload?.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("");if(!text)throw new Error("Gemini가 응답 내용을 반환하지 않았습니다.");try{return JSON.parse(text)}catch{throw new Error("Gemini 응답을 JSON으로 해석하지 못했습니다.")}}
function analysisSchema(){return{type:"OBJECT",properties:{commonConcept:{type:"STRING"},referenceStructures:{type:"ARRAY",items:{type:"OBJECT",properties:{source:{type:"STRING"},format:{type:"STRING"},logic:{type:"STRING"},difficultyFactors:{type:"ARRAY",items:{type:"STRING"}}},required:["source","format","logic"]}},combinationPlan:{type:"STRING"},avoidCopying:{type:"ARRAY",items:{type:"STRING"}}},required:["commonConcept","referenceStructures","combinationPlan","avoidCopying"]}}
function questionFields(){return{title:{type:"STRING"},prompt:{type:"STRING"},view:{type:"STRING"},choices:{type:"ARRAY",items:{type:"STRING"},minItems:5,maxItems:5},answer:{type:"STRING"},analysis:{type:"STRING"},correctExplanation:{type:"STRING"},wrongExplanation:{type:"STRING"},visual:{type:"OBJECT",properties:{type:{type:"STRING",enum:["none","table","description"]},headers:{type:"ARRAY",items:{type:"STRING"}},rows:{type:"ARRAY",items:{type:"ARRAY",items:{type:"STRING"}}},description:{type:"STRING"}},required:["type"]}}}
function questionSchema(){return{type:"OBJECT",properties:questionFields(),required:["title","prompt","view","choices","answer","analysis","correctExplanation","wrongExplanation","visual"]}}
function reviewSchema(){return{type:"OBJECT",properties:{review:{type:"OBJECT",properties:{status:{type:"STRING",enum:["통과","수정됨","생성 실패"]},issues:{type:"ARRAY",items:{type:"STRING"}},changes:{type:"ARRAY",items:{type:"STRING"}},independentAnswer:{type:"STRING"}},required:["status","issues","changes","independentAnswer"]},correctedQuestion:questionSchema()},required:["review","correctedQuestion"]}}
function renderResult(){const r=state.result;if(!r)return;$("resultEmpty").hidden=true;$("resultContent").hidden=false;$("reviewDetails").hidden=false;const visual=renderVisual(r.visual);$("resultContent").innerHTML=`<h2>${escapeHtml(r.number)}번 답 ${escapeHtml(r.answer)}-${escapeHtml(r.type)}(${escapeHtml(r.difficulty)})</h2><div class="source">${r.references.map(escapeHtml).join(", ")} 참고</div><h3>(문제)</h3><div class="question-block">${formatText(r.prompt)}</div>${visual}${r.view?`<div class="view-box">${formatText(r.view)}</div>`:""}<div class="choice-list">${r.choices.map((x,i)=>`<div>${"①②③④⑤"[i]} ${formatText(x)}</div>`).join("")}</div><div class="solution"><h3>(해설)</h3><h3>[문제 분석]</h3>${formatText(r.analysis)}<h3>[정답 풀이]</h3>${formatText(r.correctExplanation)}<h3>[오답 풀이]</h3>${formatText(r.wrongExplanation)}</div>`;$("reviewContent").innerHTML=`<p><b>상태:</b> ${escapeHtml(r.review.status)} · <b>독립 풀이 정답:</b> ${escapeHtml(r.review.independentAnswer)}</p><p><b>발견 사항</b><br>${r.review.issues.map(escapeHtml).join("<br>")||"없음"}</p><p><b>수정 사항</b><br>${r.review.changes.map(escapeHtml).join("<br>")||"없음"}</p>`}
function renderVisual(v){if(!v||v.type==="none")return"";if(v.type==="table"&&v.rows?.length)return`<table class="generated-table"><thead><tr>${(v.headers||[]).map(x=>`<th>${formatText(x)}</th>`).join("")}</tr></thead><tbody>${v.rows.map(row=>`<tr>${row.map(x=>`<td>${formatText(x)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;return v.description?`<div class="view-box"><b>[그림 제작 명세]</b><br>${formatText(v.description)}</div>`:""}
function formatText(text){return escapeHtml(text||"").replace(/\n/g,"<br>").replace(/([A-Za-z][A-Za-z0-9()]*)\^([0-9]*[+−-])/g,"$1<sup>$2</sup>").replace(/([A-Za-z)])_([0-9]+)/g,"$1<sub>$2</sub>")}
function escapeHtml(value){return String(value??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function copyResult(all){if(!state.result)return;const source=$("resultContent").cloneNode(true);if(!all)source.querySelector(".solution")?.remove();const html=source.innerHTML,plain=source.innerText;try{await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([html],{type:"text/html"}),"text/plain":new Blob([plain],{type:"text/plain"})})]);flash(all?$("copyAll"):$("copyQuestion"),"복사됨")}catch{await navigator.clipboard.writeText(plain)}}
function progress(value,title,text){$("progressBar").style.width=`${value}%`;$("progressTitle").textContent=title;$("progressText").textContent=text}
function flash(button,text){const old=button.textContent;button.textContent=text;setTimeout(()=>button.textContent=old,900)}
