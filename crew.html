<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link rel="stylesheet" href="./styles.css"/>
  <title>Crew | Fiducia Collective</title>
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <div class="brand">FIDUCIA COLLECTIVE</div>
      <div class="nav-links">
        <a class="tab" href="./index.html">메인</a>
        <a class="tab" href="./ai-stillcut.html">AI 스틸컷(예약)</a>
        <a class="tab" href="./gear.html">장비 예약</a>
        <a class="tab active" href="./crew.html">감독/스태프 리스트</a>
        <a class="tab" href="./crew.html#register">감독/스태프 등록</a>
      </div>
    </div>
  </nav>

  <main class="container section grid">
    <section class="card" style="grid-column: span 12;">
      <h2 style="margin:4px 0 10px">crew</h2>

      <div class="filters">
        <div>
          <label>이름/키워드 검색</label>
          <input id="q" placeholder="이름, 역할, 스킬 등 검색"/>
        </div>
        <div>
          <label>Skill</label>
          <select id="skill">
            <option value="">Skill 전체</option>
          </select>
        </div>
        <div>
          <label>Role</label>
          <select id="role">
            <option value="">Role 전체</option>
            <option value="director">감독</option>
            <option value="staff">스태프</option>
          </select>
        </div>
      </div>
      <!-- ✅ Verified 체크박스, 인증 뱃지 UI 삭제 -->
    </section>

    <section class="card" style="grid-column: span 12;">
      <h3>Directors</h3>
      <div id="directors" class="list" style="margin-top:10px"></div>
      <div id="directorsEmpty" class="small" style="display:none;margin-top:6px">Director 없음</div>
    </section>

    <section class="card" style="grid-column: span 12;">
      <h3>Staff</h3>
      <div id="staff" class="list" style="margin-top:10px"></div>
      <div id="staffEmpty" class="small" style="display:none;margin-top:6px">Staff 없음</div>
    </section>

    <section id="register" class="card" style="grid-column: span 12;">
      <h3>crew register</h3>
      <p class="help">
        감독/스태프 등록은 면접 후 “Verified” 처리된 분만 리스트에 노출됩니다.<br/>
        아래 버튼으로 지원 정보를 **개인 카톡**으로 보내주세요.
      </p>
      <button id="kakaoBtn" class="btn" type="button">카톡으로 지원정보 보내기</button>
      <div class="notice" style="margin-top:10px">
        보내야 할 정보: 이름 / 역할(감독 or 스태프) / 스킬 / 포폴 링크 / 연락처 / 간단 소개
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">© Fiducia Collective</div>
  </footer>

  <script type="module">
    const directorsEl = document.querySelector("#directors");
    const staffEl = document.querySelector("#staff");
    const dirEmptyEl = document.querySelector("#directorsEmpty");
    const staffEmptyEl = document.querySelector("#staffEmpty");
    const qEl = document.querySelector("#q");
    const skillEl = document.querySelector("#skill");
    const roleEl = document.querySelector("#role");

    let allCrew = [];

    const thumb = (url) => url
      ? `<img src="${url}" alt="profile" loading="lazy"/>`
      : `<div class="thumb">no image</div>`;

    function renderList(list, targetEl, emptyEl){
      targetEl.innerHTML = "";
      if(list.length === 0){
        emptyEl.style.display="block";
        return;
      }
      emptyEl.style.display="none";

      list.forEach(c=>{
        const a = document.createElement("a");
        a.className="person";
        a.href = c.profileUrl ? `./crew-detail.html?id=${c.id}` : "#";
        a.innerHTML = `
          <div class="thumb">${thumb(c.profileImageUrl)}</div>
          <div class="name">${c.name || "No name"}</div>
          <div class="small">${c.bio || ""}</div>
          <div class="tags">
            ${(c.roles||[]).map(r=>`<span class="tag">${r}</span>`).join("")}
            ${(c.skills||[]).map(s=>`<span class="tag">${s}</span>`).join("")}
          </div>
        `;
        targetEl.appendChild(a);
      });
    }

    function applyFilters(){
      const q = qEl.value.trim().toLowerCase();
      const skill = skillEl.value;
      const role = roleEl.value;

      let filtered = allCrew.filter(c=>{
        const hay = [
          c.name, c.mainRole, (c.roles||[]).join(" "),
          (c.skills||[]).join(" "), c.bio
        ].join(" ").toLowerCase();

        if(q && !hay.includes(q)) return false;
        if(skill && !(c.skills||[]).includes(skill)) return false;
        if(role && c.mainRole !== role) return false;
        return true;
      });

      const dirs = filtered.filter(c=>c.mainRole==="director");
      const staffs = filtered.filter(c=>c.mainRole==="staff");

      renderList(dirs, directorsEl, dirEmptyEl);
      renderList(staffs, staffEl, staffEmptyEl);
    }

    async function loadCrew(){
      directorsEl.innerHTML = staffEl.innerHTML = "";
      dirEmptyEl.style.display = staffEmptyEl.style.display = "none";

      try{
        const res = await fetch("/api/crew");
        if(!res.ok) throw new Error("crew fetch failed");
        const data = await res.json();
        allCrew = Array.isArray(data) ? data : [];

        // 스킬 옵션 채우기
        const skills = new Set();
        allCrew.forEach(c => (c.skills||[]).forEach(s => skills.add(s)));
        [...skills].sort().forEach(s=>{
          const opt = document.createElement("option");
          opt.value = s; opt.textContent = s;
          skillEl.appendChild(opt);
        });

        applyFilters();
      }catch(e){
        dirEmptyEl.style.display="block";
        staffEmptyEl.style.display="block";
        dirEmptyEl.textContent="crew 불러오기 실패";
        staffEmptyEl.textContent="crew 불러오기 실패";
        console.error(e);
      }
    }

    qEl.addEventListener("input", applyFilters);
    skillEl.addEventListener("change", applyFilters);
    roleEl.addEventListener("change", applyFilters);

    // ✅ 개인 카톡 보내기 (링크만 열어줌)
    document.querySelector("#kakaoBtn").addEventListener("click", ()=>{
      const text = encodeURIComponent(
        "[Fiducia Crew 지원]\n이름:\n역할(감독/스태프):\n스킬:\n포폴 링크:\n연락처:\n간단 소개:"
      );
      // 너 개인 카톡 '나에게 보내기'는 웹에서 직접 열 수 없으니,
      // 카카오톡 공유용 링크(채팅방 선택 화면)를 열어주는 방식.
      window.open(`https://share.kakao.com/?text=${text}`, "_blank");
    });

    loadCrew();
  </script>
</body>
</html>