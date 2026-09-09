"use strict";
const JOB_KEY="jbExamCheckpointV1";
let activeJob=null;
function readJob(){try{return JSON.parse(localStorage.getItem(JOB_KEY)||"null");}catch{return null;}}
function saveJob(){try{localStorage.setItem(JOB_KEY,JSON.stringify(activeJob));}catch{progress(0,"브라우저 저장 공간 부족","이 탭에서는 이어서 진행할 수 있습니다. 새로고침하지 마세요.");}}
function beginJob(model,refs){
  const settings=Object.fromEntries(["typeSelect","questionNumber","difficulty","formatSelect","extraPrompt"].map(id=>[id,$(id).value]));
  const rules=collectRules(),key=JSON.stringify({model,ids:refs.map(x=>x.id),settings,rules});
  const saved=activeJob||readJob();
  activeJob=saved?.key===key&&!saved.complete?saved:{key,model,refs,settings,rules,stages:{},complete:false};saveJob();
}
async function stageCall(stage,api,model,parts,schema){
  if(activeJob.stages[stage])return activeJob.stages[stage];
  const result=await callGemini(api,model,parts,schema);activeJob.stages[stage]=result;saveJob();return result;
}
function keepCorrection(reviewed,issues){
  activeJob.stages.generation=reviewed.correctedQuestion;
  delete activeJob.stages.review;activeJob.issues=issues;saveJob();
  $("resumeJob").hidden=false;$("checkpointStatus").textContent="초안을 보관했습니다. ‘저장 문항 이어서 검토’를 누르면 분석·생성을 반복하지 않고 검토 1회만 호출합니다.";
}
async function resumeJob(){
  const job=activeJob||readJob();if(!job||job.complete)return;
  activeJob=job;for(const [id,value] of Object.entries(job.settings))$(id).value=value;
  for(const [id,value] of Object.entries(job.rules))if($(id))$(id).value=value;
  state.references=job.refs;renderReferences();await generate();
}
document.addEventListener("DOMContentLoaded",()=>{
  const job=readJob();$("resumeJob").hidden=!job||job.complete;
  $("resumeJob").addEventListener("click",resumeJob);
  $("checkpointStatus").textContent=job&&!job.complete?"이전 작업이 저장되어 있습니다. 이어서 검토하면 완료된 단계는 다시 결제하지 않습니다.":"완료된 단계는 브라우저에 저장합니다. 오류가 나면 같은 설정으로 이어서 진행합니다.";
});
