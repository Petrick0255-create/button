"use strict";
const QUALITY_RULES = `2028 수능 대비 통합과학1·2 평가원 문항을 작성한다. 고1 내신 수준으로 제한하지 않는다.
단순한 용어 대응만으로 풀리는 문항을 피하고 두 자료의 관계 또는 조건을 이용한 추론을 설계한다. 난이도 숫자를 배점으로 해석하지 않는다.
상황의 현실성을 검증한다. 충전 케이블의 재료로 구리·규소·고무를 억지로 대응시키지 않는다. 전도성 비교 실험은 동일 전압, 길이, 단면적, 온도를 명시한다. 전자 수를 비교하려면 단위 부피 등 비교 기준과 필요한 조건을 명시한다.
prompt에는 도입·조건·질문만, view에는 ㄱ. ㄴ. ㄷ. 보기만 넣는다. choices에는 번호 없이 선택지 내용만 넣는다. 그림 설명을 별도 문단으로 반복하지 않는다.
그림과 표가 함께 필요하면 하나의 SVG에 (가), (나) 패널로 완성한다. SVG에는 실제 선·도형·눈금·축·단위가 있어야 한다. 제작 명세나 설명문으로 대체하지 않는다.
정답뿐 아니라 각 보기의 근거와 조건 충분성을 검증한다. 해결하지 못한 오류가 있으면 검토 상태는 생성 실패로 반환한다.`;
function normalizeQuestion(q){
  if(!q||typeof q!=="object")throw new Error("문항 응답이 없습니다.");
  return {...q,choices:(q.choices||[]).map(x=>String(x).replace(/^(?:\s*[①②③④⑤]\s*)+/,"").trim()),answer:String(q.answer||"").trim()};
}
function validateQuestion(q){
  const errors=[];
  if(!q.prompt?.trim())errors.push("발문 누락");
  if(q.choices?.length!==5||q.choices.some(x=>!x.trim())||new Set(q.choices).size!==5)errors.push("선택지는 서로 다른 5개여야 합니다");
  if(!/^[①②③④⑤]$/.test(q.answer))errors.push("정답 번호 오류");
  if(/<보기>|〈보기〉/.test(q.prompt)&&/ㄱ\s*[.．]/.test(q.prompt))errors.push("발문에 보기가 섞여 있습니다");
  if(q.view&&!/^\s*ㄱ\s*[.．]/.test(q.view))errors.push("보기 칸에 그림 설명 등 다른 내용이 있습니다");
  const v=q.visual;
  if(!v||!["none","table","svg"].includes(v.type))errors.push("시각 자료 형식 오류");
  if(v?.type==="none"&&/그림|그래프|표는|표 \(/.test(q.prompt))errors.push("본문에 언급한 시각 자료가 없습니다");
  if(v?.type==="table"&&(!v.headers?.length||!v.rows?.length||v.rows.some(r=>r.length!==v.headers.length)))errors.push("표의 행·열이 불완전합니다");
  if(v?.type==="svg"&&(!v.svg||!/<(?:path|line|rect|circle|ellipse|polyline|polygon)\b/.test(v.svg)))errors.push("완성된 그림이 없습니다");
  return errors;
}
async function prepareFigure(q){
  if(q.visual?.type!=="svg")return null;
  const clean=sanitizeSvg(q.visual.svg);
  if(!clean)throw new Error("SVG가 손상되었습니다. 완성본으로 출력하지 않습니다.");
  const svg=new DOMParser().parseFromString(clean,"image/svg+xml").documentElement;
  const box=svg.getAttribute("viewBox").split(/[ ,]+/).map(Number);
  if(box.length!==4||!box.every(Number.isFinite)||box[2]<=0||box[3]<=0||box[3]/box[2]>5)throw new Error("그림 크기가 잘못되었습니다.");
  const width=1600,height=Math.round(width*box[3]/box[2]);
  svg.setAttribute("width",width);svg.setAttribute("height",height);
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:"image/svg+xml"}));
  try{
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error("그림 렌더링 실패"));img.src=url;});
    const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext("2d");ctx.fillStyle="white";ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
    return canvas.toDataURL("image/png");
  }finally{URL.revokeObjectURL(url);}
}
async function copyFinished(all){
  if(!state.result)return;
  const node=$("resultContent").cloneNode(true);if(!all)node.querySelector(".solution")?.remove();
  const html=node.innerHTML,plain=node.textContent;
  try{await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([html],{type:"text/html"}),"text/plain":new Blob([plain],{type:"text/plain"})})]);flash(all?$("copyAll"):$("copyQuestion"),"복사됨");}
  catch{const url=URL.createObjectURL(new Blob(['<!doctype html><meta charset="utf-8">'+html],{type:"text/html"}));const a=document.createElement("a");a.href=url;a.download="문항.html";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);alert("서식 복사가 허용되지 않아 그림을 포함한 HTML을 저장했습니다. 브라우저에서 열어 복사해 주세요.");}
}
