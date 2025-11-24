// ===============================
//  AI STILLCUT RESERVATION JS
// ===============================

console.log("stillcut.js loaded");

// 폼 요소들
const form = document.querySelector("#form");
const statusEl = document.querySelector("#status");
const imagesInput = document.querySelector("#images");
const fileNamesEl = document.querySelector("#fileNames");

// -------------------------------
// 이미지 선택 시 메타정보 업데이트
// -------------------------------
imagesInput.addEventListener("change", () => {
  const files = [...imagesInput.files].slice(0, 5);

  fileNamesEl.innerHTML = files
    .map((f) => `• ${f.name} (${Math.round(f.size / 1024)}KB)`)
    .join("<br/>");

  if (imagesInput.files.length > 5) {
    statusEl.textContent = "이미지는 최대 5개까지 선택 가능해요.";
  } else {
    statusEl.textContent = "";
  }
});

// -------------------------------
// 폼 제출 처리
// -------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "예약 전송 중...";

  const fd = new FormData(form);
  const files = [...imagesInput.files].slice(0, 5);

  // JSON 형태로 변환
  const payload = {
    projectTitle: fd.get("projectTitle"),
    phone: fd.get("phone"),
    email: fd.get("email"),
    videoType: fd.get("videoType"),
    runtime: fd.get("runtime"),
    budgetRange: fd.get("budgetRange"),
    shootDate: fd.get("shootDate"),
    location: fd.get("location"),
    referenceLink: fd.get("referenceLink"),
    message: fd.get("message"),
    images: files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })),
  };

  try {
    const res = await fetch("/api/stillcut-reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const out = await res.json();

    if (!res.ok) throw new Error(out?.message || "예약 실패");

    // 성공 UI 처리
    statusEl.textContent = "예약 완료! 확인 후 연락드릴게요.";

    form.reset();
    imagesInput.value = "";
    fileNamesEl.innerHTML = "";
  } catch (err) {
    statusEl.textContent = "예약 실패: " + err.message;
  }
});