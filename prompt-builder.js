"use strict";
const TYPE_GUIDANCE={
  "과학의 기본량":"기본량과 유도량, 단위 관계를 자료에서 구분하고 측정값 해석에 적용한다. 단위 암기만 묻지 않는다.",
  "측정 표준과 정보":"측정 기준 또는 신호 변환 과정을 비교한다. 측정 대상·시간 간격·변환 단계가 무엇인지 명확히 한다.",
  "우주의 시작과 원소의 생성":"우주 초기 사건의 선후 관계와 입자 구성 자료를 연결한다. 원자와 원자핵을 구분한다.",
  "지구와 생명체를 구성하는 원소의 생성":"별의 진화 과정과 원소 생성 조건을 연결한다. 서로 다른 질량의 별을 같은 진화 경로로 취급하지 않는다.",
  "원소의 규칙성":"원소의 위치·전자 배치·성질에 대한 조건으로 미지 원소를 추론한다. 후보가 유일하게 결정되는지 확인한다.",
  "화학 결합과 물질의 성질":"입자 구성과 결합 모형을 물질의 상태별 성질에 연결한다. 원자·이온·분자를 구분하고 전하가 보존되는지 확인한다.",
  "지각과 생명체 구성 물질의 규칙성":"규산염 광물 또는 생명체 구성 물질의 단위체와 결합 규칙을 자료에서 추론한다. 교육과정 밖의 구조 암기를 요구하지 않는다.",
  "물질의 전기적 성질":"동일한 전압·온도·시료 길이·단면적 등의 조건에서 전도성 자료를 비교한다. 자유 전자 수 비교에는 시료의 양이나 단위 부피 기준을 명시한다. 규소를 충전 케이블 재료로 억지로 설정하지 않는다.",
  "중력의 작용":"같은 시간의 운동 상태와 중력에 의한 변화 관계를 비교한다. 초기 속도·높이·공기 저항 조건을 명시한다.",
  "운동과 충돌":"운동량 변화와 힘-시간 자료를 연결해 미지량 또는 대소 관계를 추론한다. 양의 방향, 충돌 전후 속도 부호, 평균 힘과 순간 힘을 구분한다.",
  "지구 시스템의 구성과 상호작용":"권역 사이 물질 이동과 에너지 흐름을 자료와 연결한다. 이동 주체·출발 권역·도착 권역을 명확히 한다.",
  "지권의 변화와 영향":"판 경계의 운동과 지형·지진·화산 자료를 결합한다. 상대 운동 방향과 단면도의 방향을 일치시킨다.",
  "생명 시스템과 세포":"세포 구조와 물질 출입 자료를 기능에 연결한다. 세포 유형과 막 안팎의 조건을 명확히 한다.",
  "생명 시스템에서 일어나는 화학 반응":"효소 또는 물질대사 실험의 변인과 결과를 해석한다. 대조군·온도·pH·기질량 등 필요한 통제 조건을 명시한다.",
  "생명 시스템에서 정보의 흐름":"DNA·RNA·단백질 사이 정보 관계를 자료로 추론한다. 염기와 아미노산을 구분하고 필요한 대응표와 읽는 방향을 제시한다.",
  "지질 시대의 환경과 생물 변화":"화석과 환경 변화 자료를 연결해 시기와 사건의 관계를 추론한다. 시대별 특징을 과도하게 일반화하지 않는다.",
  "진화와 생물 다양성":"변이·선택·세대별 빈도 변화 자료를 연결한다. 개체의 필요 때문에 유리한 변이가 생긴다고 설명하지 않는다.",
  "산화와 환원":"전자 이동과 반응 전후 입자 수를 연결한다. 원자 수·전하량 보존 및 반응의 완결 조건을 확인한다.",
  "산, 염기와 중화 반응":"혼합 전후 이온 종류·수와 용액 성질을 연결한다. 부피·농도·온도 조건과 구경꾼 이온을 구분한다.",
  "물질 변화에서 에너지의 출입":"온도 변화와 계·주위의 에너지 이동을 연결한다. 측정 대상과 열 출입 조건을 명시한다.",
  "생태계의 구성과 환경":"생물·비생물 요소의 상호작용을 실험 또는 관측 자료로 추론한다. 개체군과 군집을 구분한다.",
  "생태계 평형":"먹이 관계와 개체 수 변화 자료를 연결한다. 화살표가 에너지 이동 방향인지 명시하고 단일 원인으로 단정하지 않는다.",
  "지구 환경 변화와 인간 생활":"기후·해양 자료의 시간·지역별 차이를 해석한다. 관측값과 편차, 해빙과 육상 빙하를 구분하고 상관관계를 인과로 단정하지 않는다.",
  "태양 에너지의 생성과 전환":"태양에서 생성된 에너지와 지구에서의 전환 경로를 연결한다. 핵융합과 화학 반응을 구분한다.",
  "전기 에너지의 생산":"발전 과정과 에너지 전환 또는 전자기 유도 자료를 연결한다. 상대 운동과 전류 방향의 기준을 명시한다.",
  "에너지 효율과 신재생 에너지":"입력·유용한 출력·손실 에너지를 비교한다. 효율의 분모와 같은 시간 또는 같은 에너지 기준을 명시한다.",
  "과학 기술의 활용":"감염병 진단·빅데이터 등 기술의 원리와 자료 해석을 연결한다. 실제 자료인지 모의 자료인지 구분하고 2015 전용 신소재 암기 문항을 만들지 않는다.",
  "과학 기술의 발전과 쟁점":"기술의 유용성과 한계를 주어진 근거로 판단한다. 가치 판단을 과학적 사실로 단정하거나 근거 없는 찬반을 정답으로 삼지 않는다."
};
function buildExamPrompt({type,keywords,difficulty,format}){
  if(!type||!TYPE_GUIDANCE[type])throw new Error("기존 유형 목록에서 유형을 선택해 주세요.");
  const words=[...new Set(String(keywords).split(/[,，\n]+/).map(x=>x.trim()).filter(Boolean))];
  if(!words.length)throw new Error("핵심 개념이나 사용할 자료를 키워드로 입력해 주세요.");
  const topic=words.join(", ");
  const hints=[];
  if(/그래프|곡선|시간/.test(topic))hints.push("그래프는 축 이름·단위·눈금과 구간 경계를 표시한다. 기울기와 면적 중 물리적 의미가 있는 관계만 활용한다.");
  if(/표|비교|데이터|자료/.test(topic))hints.push("표의 각 행·열에서 무엇을 비교하는지와 단위를 명시하고 다른 자료와 연결되는 공통 변수를 둔다.");
  if(/실험|센서|측정/.test(topic))hints.push("실험 과정은 (가), (나), (다)로 구분한다. 조작·통제·종속 변인과 측정 시점을 명확히 한다.");
  if(/충돌|운동량|충격량/.test(topic))hints.push("힘-시간 그래프의 면적과 운동량 변화가 일치하는지 계산한다. 반발 여부와 방향 기준을 명시한다.");
  if(/빙하|해빙|기온|이산화\s*탄소|빅데이터/.test(topic))hints.push("관측 기간·지역·단위를 통일한다. 제공받은 실제 수치가 없으면 교육용 모의 자료로 명시하며 관측 기관이나 출처를 꾸며내지 않는다.");
  const level=Number(difficulty)>=2.5?"고난도: 여러 조건을 연결해 미지 관계를 결정하고 다른 상황에 적용한다. 계산량과 교육과정 밖 지식으로 난도를 올리지 않는다.":Number(difficulty)<=1.5?"기본~중간 난도: 핵심 관계를 자료에서 읽고 한 번 적용한다. 불필요한 조건을 늘리지 않는다.":"중상 난도: 두 자료에서 관계를 추론한 뒤 다른 조건에 적용하는 2단계 추론을 요구한다.";
  const autoFormat=/그래프|곡선/.test(topic)&&/표/.test(topic)?"그래프와 표를 (가), (나)로 함께 구성":/그래프|곡선/.test(topic)?"그래프 중심":/실험|센서/.test(topic)?"실험 장치와 결과 자료":/표|데이터/.test(topic)?"표 중심":"추론에 필요한 최소한의 자료를 선택";
  return `[출제 목표]\n2028 수능 대비 통합과학 문항 1개를 출제하라. 범위는 2022 개정 통합과학1·2이다.\n기존 유형명: ${type}\n핵심 키워드: ${topic}\n목표 난이도: ${difficulty} (배점이 아닌 난도 설정)\n${level}\n자료 구성: ${format==="auto"?autoFormat:format}\n\n[유형별 설계 기준]\n${TYPE_GUIDANCE[type]}\n키워드는 이 유형의 추론에 필요한 역할로 사용한다. 유형과 맞지 않거나 교육과정 밖인 키워드는 억지로 결합하지 말고 검토 기록에 사유를 밝힌다.\n${hints.join("\n")}\n\n[참고 문항 활용]\n참고 문항 2개 이상에서 조건 제시 방식과 자료 해석 요소를 각각 가져와 일관된 문제로 결합한다. 이름과 숫자만 바꾸지 않는다. 자료를 읽지 않고 용어 암기만으로 풀리면 재설계한다.\n\n[출력 구조]\nprompt에는 도입·조건·질문만, view에는 ㄱ. ㄴ. ㄷ. 보기만, choices에는 번호 없는 선택지 내용 5개만 넣는다. 보기마다 서로 다른 판단을 요구하고 선택지 조합은 중복되지 않게 한다.\n필요한 표·그림을 실제 완성된 자료로 제공한다. 그림과 표가 함께 필요하면 하나의 흑백 SVG에 (가), (나)로 배치한다. 본문과 기호·수치·단위를 일치시키고 겹침을 피한다. SVG에는 xmlns와 viewBox를 명시하고 태그를 닫는다. <와 &는 XML에 맞게 이스케이프하며 코드 펜스와 제작 명세를 넣지 않는다.\n\n[해설]\n미지 기호의 실제 대상을 먼저 밝힌 뒤 기호와 대상을 함께 표기한다. 옳은 보기는 기호별로 설명하고 틀린 보기는 [오답 풀이]로 구분한다. 모든 판단에 사용한 자료와 조건을 밝히고 문제에 없는 가정이나 수치를 추가하지 않는다. 규칙 입력 탭의 작성 규칙을 함께 적용한다.\n\n[최종 검토]\n수정된 최종 문항을 독립적으로 다시 풀어 정답 유일성, 조건 충분성, 선택지 중복, 계산과 그림의 일치를 확인한다. 단순 표기 차이와 실제 논리 오류를 구분한다. 해결하지 못한 오류는 통과시키지 않는다.`;
}
document.addEventListener("DOMContentLoaded",()=>{
  let built=null;
  const output=$("builtPrompt"),message=$("promptBuilderStatus");
  const sync=()=>{const value=$("promptType").value;$("promptType").replaceChildren(...[...$("typeSelect").options].map(x=>new Option(x.text,x.value)));$("promptType").value=value;};
  sync();new MutationObserver(sync).observe($("typeSelect"),{childList:true});
  function invalidate(){built=null;$("applyPrompt").disabled=true;$("copyPrompt").disabled=true;message.textContent="입력 변경됨 · 프롬프트 만들기를 눌러 주세요.";}
  for(const id of ["promptType","promptKeywords","promptDifficulty","promptFormat"])$(id).addEventListener("input",invalidate);
  $("buildPrompt").addEventListener("click",()=>{
    try{built={type:$("promptType").value,keywords:$("promptKeywords").value,difficulty:$("promptDifficulty").value,format:$("promptFormat").value};output.value=buildExamPrompt(built);$("applyPrompt").disabled=false;$("copyPrompt").disabled=false;message.textContent="생성 완료 · API 호출 0회 · 아래 문구는 직접 수정할 수 있습니다.";}
    catch(e){built=null;message.textContent=e.message;}
  });
  $("copyPrompt").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(output.value);message.textContent="프롬프트를 복사했습니다.";}catch{output.focus();output.select();message.textContent="복사가 제한되어 전체 선택했습니다. Ctrl+C로 복사하세요.";}});
  $("applyPrompt").addEventListener("click",()=>{
    if(!built||!output.value.trim())return;
    if($("extraPrompt").value.trim()&&$("extraPrompt").value!==output.value&&!confirm("문제 생성 탭의 기존 추가 지시를 이 프롬프트로 바꿀까요?"))return;
    $("typeSelect").value=built.type;$("difficulty").value=built.difficulty;
    $("formatSelect").value=({"표":"표·자료","그래프":"그래프","그림":"그림","실험·탐구":"실험·탐구"})[built.format]||"auto";
    $("extraPrompt").value=output.value;drawReferences();openTab("generate");
  });
});
