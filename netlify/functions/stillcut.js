// stillcut.js (AI Stillcut Reservation Page)

const $ = (sel) => document.querySelector(sel);

const form =
  $("#stillcutForm") ||
  $("form[data-form='stillcut']") ||
  $("form");

const statusEl =
  $("#status") ||
  $("#formStatus") ||
  (() => {
    const d = document.createElement("div");
    d.id = "status";
    d.className = "small";
    form?.appendChild(d);
    return d;
  })();

const fileInput =
  $("#images") ||
  $("#imageFiles") ||
  $("input[type='file'][name='images']") ||
  $("input[type='file']");

const fileListEl =
  $("#fileList") ||
  (() => {
    const d = document.createElement("div");
    d.id = "fileList";
    d.className = "small";
    fileInput?.parentElement?.appendChild(d);
    return d;
  })();

const MAX_FILES = 5;

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#ff8b8b" : "#b6ffcc";
}

function getValue(id, fallbackName) {
  const el = $("#" + id) || (fallbackName ? $(`[name='${fallbackName}']`) : null);
  return el ? el.value.trim() : "";
}

function getFiles() {
  if (!fileInput?.files) return [];
  return Array.from(fileInput.files);
}

function renderFileList(files) {
  if (!files.length) {
    fileListEl.textContent = "";
    return;
  }
  fileListEl.innerHTML = files
    .map((f) => `• ${f.name} (${Math.round(f.size / 1024)}KB)`)
    .join("<br/>");
}

fileInput?.addEventListener("change", () => {
  let files = getFiles();
  if (files.length > MAX_FILES) {
    files = files.slice(0, MAX_FILES);

    // 강제로 잘라내기(브라우저 제한 때문에 새 FileList 만들기)
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    fileInput.files = dt.files;

    setStatus(`이미지는 최대 ${MAX_FILES}개까지만 가능해!`, true);
  } else {
    setStatus("");
  }
  renderFileList(files);
});

function validate(payload) {
  const required = [
    ["ProjectTitle", payload.ProjectTitle],
    ["Phone", payload.Phone],
    ["Email", payload.Email],
    ["VideoType", payload.VideoType],
    ["Runtime", payload.Runtime],
    ["Budget", payload.Budget],
    ["ShootDate", payload.ShootDate],
    ["Location", payload.Location],
    ["Message", payload.Message],
  ];

  const missing = required.filter(([, v]) => !v);
  if (missing.length) {
    const names = missing.map(([k]) => k).join(", ");
    return `필수 항목 비어있음: ${names}`;
  }
  return null;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("예약 제출 중...");

  // Notion DB 컬럼명에 맞춘 payload
  const payload = {
    ProjectTitle: getValue("projectTitle", "projectTitle"),
    Phone: getValue("phone", "phone"),
    Email: getValue("email", "email"),
    VideoType: getValue("videoType", "videoType"),
    Runtime: getValue("runtime", "runtime"), // 숫자/텍스트 둘 다 OK
    Budget: getValue("budget", "budget"),   // select 값
    ShootDate: getValue("shootDate", "shootDate"), // YYYY-MM-DD
    Location: getValue("location", "location"),
    ReferenceLink: getValue("referenceLink", "referenceLink"),
    Message: getValue("message", "message"),
    Images: getFiles().map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
    })),
    Status: "Requested",
  };

  const err = validate(payload);
  if (err) {
    setStatus(err, true);
    return;
  }

  try {
    const res = await fetch("/api/stillcut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.details || data?.message || "Notion stillcut error");
    }

    setStatus("예약 완료! 곧 카톡/메일로 안내할게요.");
    form.reset();
    renderFileList([]);
  } catch (error) {
    console.error(error);
    setStatus(`예약 실패: ${error.message}`, true);
  }
});