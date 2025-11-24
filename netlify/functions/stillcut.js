// stillcut.js

const form = document.querySelector("#stillcutForm");
const statusEl = document.querySelector("#status");
const submitBtn = document.querySelector("#submitBtn");
const fileHint = document.querySelector("#fileHint");
const fileInput = form.querySelector('input[name="images"]');

function setStatus(msg, isError=false){
  statusEl.textContent = msg || "";
  statusEl.style.color = isError ? "#ff9a9a" : "#b8c7ff";
}

function getFileMeta(files){
  return [...files].slice(0,5).map(f => ({
    name: f.name,
    sizeKB: Math.round(f.size/1024),
    type: f.type
  }));
}

fileInput.addEventListener("change", ()=>{
  const files = fileInput.files || [];
  const meta = getFileMeta(files);
  if(meta.length === 0){
    fileHint.textContent = "";
    return;
  }
  fileHint.innerHTML = `
    선택된 파일(${meta.length}/5):
    <ul style="margin:6px 0 0 16px; padding:0;">
      ${meta.map(m=>`<li>${m.name} (${m.sizeKB}KB)</li>`).join("")}
    </ul>
  `;
});

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  setStatus("");

  const fd = new FormData(form);
  const payload = {
    projectTitle: fd.get("projectTitle")?.toString().trim(),
    phone: fd.get("phone")?.toString().trim(),
    email: fd.get("email")?.toString().trim(),
    videoType: fd.get("videoType")?.toString(),
    runtime: Number(fd.get("runtime")),
    budget: fd.get("budget")?.toString(),
    shootDate: fd.get("shootDate")?.toString(),
    location: fd.get("location")?.toString().trim(),
    referenceLink: fd.get("referenceLink")?.toString().trim(),
    imagesMeta: getFileMeta(fileInput.files || []),
    message: fd.get("message")?.toString().trim(),
  };

  // 기본 검증
  if(!payload.projectTitle || !payload.phone || !payload.email || !payload.videoType ||
     !payload.runtime || !payload.budget || !payload.shootDate || !payload.location || !payload.message){
    setStatus("필수 항목을 확인해줘!", true);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "전송 중...";

  try{
    const res = await fetch("/api/stillcut", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=> ({}));

    if(!res.ok){
      throw new Error(data?.details || data?.message || "Notion stillcut error");
    }

    setStatus("예약 완료! 곧 연락할게요 🙂");
    form.reset();
    fileHint.textContent = "";
  }catch(err){
    console.error(err);
    setStatus("예약 실패: " + err.message, true);
  }finally{
    submitBtn.disabled = false;
    submitBtn.textContent = "예약 제출";
  }
});