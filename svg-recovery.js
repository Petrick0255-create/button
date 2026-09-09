"use strict";
function recoverSvgText(raw){
  let s=String(raw||"").trim();
  if(s.startsWith('"')){try{s=JSON.parse(s);}catch{}}
  s=s.replace(/^```(?:svg|xml|html)?\s*/i,"").replace(/\s*```$/,"");
  // Only remove wrapping prose, never invent missing geometry or closing tags.
  const start=s.search(/<svg\b/i),end=s.toLowerCase().lastIndexOf("</svg>");
  if(start<0||end<start)return "";
  s=s.slice(start,end+6);
  if(/<!DOCTYPE|<!ENTITY/i.test(s))return "";
  s=s.replace(/&nbsp;/g,"&#160;").replace(/&minus;/g,"&#8722;").replace(/&times;/g,"&#215;");
  s=s.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/gi,"&amp;");
  // Escape literal comparison signs in text nodes without parsing as HTML.
  s=s.replace(/<(?=\s|[=\d])/g,"&lt;");
  if(!/<svg\b[^>]*\sxmlns\s*=/.test(s))s=s.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  return s;
}
function sanitizeRecoveredSvg(raw){
  const text=recoverSvgText(raw);if(!text)return "";
  const doc=new DOMParser().parseFromString(text,"image/svg+xml"),svg=doc.documentElement;
  if(svg.localName!=="svg"||doc.querySelector("parsererror")||svg.namespaceURI!=="http://www.w3.org/2000/svg")return "";
  const allowed=new Set(["svg","g","defs","marker","path","line","rect","circle","ellipse","polyline","polygon","text","tspan","title","desc","clipPath"]);
  for(const el of [...svg.querySelectorAll("*")])if(!allowed.has(el.localName)||el.namespaceURI!==svg.namespaceURI)el.remove();
  for(const el of [svg,...svg.querySelectorAll("*")])for(const a of [...el.attributes]){
    const n=a.name.toLowerCase(),v=a.value;
    if(n.startsWith("on")||n==="style"||n==="href"||n.endsWith(":href")||(/url\s*\(/i.test(v)&&!/^url\(#[\w-]+\)$/.test(v)))el.removeAttribute(a.name);
  }
  if(!svg.getAttribute("viewBox"))svg.setAttribute("viewBox",`0 0 ${parseFloat(svg.getAttribute("width"))||640} ${parseFloat(svg.getAttribute("height"))||360}`);
  return new XMLSerializer().serializeToString(svg);
}
function markFigureFailure(message){
  activeJob.figureError=message;saveJob();
  $("repairFigure").hidden=false;
  $("checkpointStatus").textContent="문항과 검토 결과는 저장했습니다. 이어서 검토는 로컬 그림 복구부터 시도합니다. 복구되지 않으면 ‘그림만 교정’으로 API 1회만 사용하세요.";
}
async function repairSavedFigure(){
  if($("generateButton").disabled)return;
  const job=activeJob||readJob();const review=job?.stages?.review;
  if(!review){alert("저장된 최종 검토 결과가 없습니다. 저장 문항 이어서 검토를 눌러 주세요.");return;}
  const api=localStorage.getItem(STORAGE.api);if(!api){$("apiDialog").showModal();return;}
  activeJob=job;$("repairFigure").disabled=true;$("generateButton").disabled=true;$("resumeJob").disabled=true;
  try{
    const q=review.correctedQuestion;
    // Retry the existing SVG locally first; this path never calls the API.
    let png=null;try{png=await prepareFigure(q);}catch{}
    if(!png){
      progress(85,"그림만 교정 · API 1회","본문·보기·선택지·정답·해설을 유지하고 SVG만 수정합니다.");
      const result=await callGemini(api,job.model,[{text:`다음 문항의 SVG만 수리하라. 문항 내용이나 수치를 변경하지 말고 축·단위·기호·표를 모두 보존하라. 잘못된 XML, 누락 태그, xmlns, 속성 따옴표, 특수문자를 바로잡아라. SVG 네임스페이스와 viewBox를 명시하고 완전한 SVG를 반환하라. 코드 펜스 금지. 텍스트 비교 기호 <는 &lt;, &는 &amp;로 이스케이프한다. 본문에 요구된 완성 그림과 표를 실제 도형과 텍스트로 표현한다.\n오류: ${job.figureError||"SVG 렌더링 실패"}\n문항: ${JSON.stringify(q)}`}],{type:"OBJECT",properties:{svg:{type:"STRING"}},required:["svg"]});
      q.visual={type:"svg",svg:result.svg};saveJob();
      png=await prepareFigure(q);
    }
    if(!png)throw new Error("SVG 그림이 없습니다.");
    delete job.figureError;saveJob();$("repairFigure").hidden=true;
    $("checkpointStatus").textContent="그림 렌더링 복구 완료. 저장 문항 이어서 검토를 누르면 저장된 결과를 불러옵니다. 추가 API 호출은 없습니다. 교정된 그림의 수치는 직접 확인해 주세요.";
  }catch(e){markFigureFailure(e.message);alert("그림 교정 미완료: "+e.message+"\n응답을 보관했습니다. 자동 재호출하지 않습니다.");}
  finally{$("repairFigure").disabled=false;$("generateButton").disabled=false;$("resumeJob").disabled=false;}
}
document.addEventListener("DOMContentLoaded",()=>{
  $("repairFigure").hidden=!readJob()?.stages?.review;
  $("repairFigure").addEventListener("click",repairSavedFigure);
});
