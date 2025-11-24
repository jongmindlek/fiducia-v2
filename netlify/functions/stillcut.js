// stillcut.js (public root)

// 요소 참조
const form = document.querySelector("#stillcutForm");
const fileInput = document.querySelector("#images");
const fileListEl = document.querySelector("#fileList");
const statusEl = document.querySelector("#submitStatus");

// 파일 리스트 UI
const renderFiles = () => {
  fileListEl.innerHTML = "";
  const files = Array.from(fileInput.files || []);
  if (files.length === 0) return;

  files.slice(0, 5).forEach(f => {
    const li = document.createElement("li");
    li.textContent = `${f.name} (${Math.round(f.size/1024)}KB)`;
    fileListEl.appendChild(li);
  });
};

fileInput?.addEventListener("change", renderFiles);

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "예약 전송 중...";

  const fd = new FormData(form);

  const payload = {
    title: fd.get("title")?.toString().trim(),
    phone: fd.get("phone")?.toString().trim(),
    email: fd.get("email")?.toString().trim(),
    projectTitle: fd.get("projectTitle")?.toString().trim(),
    videoType: fd.get("videoType")?.toString(),
    runtime: fd.get("runtime")?.toString(),
    budget: fd.get("budget")?.toString(),
    shootDate: fd.get("shootDate")?.toString(),
    location: fd.get("location")?.toString().trim(),
    referenceLink: fd.get("referenceLink")?.toString().trim(),
    message: fd.get("message")?.toString().trim(),
    imagesMeta: Array.from(fileInput.files || [])
      .slice(0, 5)
      .map(f => `${f.name}:${Math.round(f.size/1024)}KB`)
  };

  try {
    const res = await fetch("/api/stillcut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const out = await res.json();
    if (!res.ok) throw new Error(out?.details || out?.message || "unknown");

    form.reset();
    renderFiles();

    statusEl.textContent = "예약 완료! 곧 카톡/메일로 안내드릴게요.";
  } catch (err) {
    statusEl.textContent = `예약 실패: ${err.message}`;
  }
});