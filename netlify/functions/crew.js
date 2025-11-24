const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const database_id = process.env.CREW_DB_ID;

    // ✅ Published 필터 제거: DB에 Published 속성이 없어서 에러났던 부분
    const res = await notion.databases.query({
      database_id
      // filter 없음 = 전체 가져오기
    });

    const crew = res.results.map(page => {
      const p = page.properties || {};

      const getText = (key) =>
        (p[key]?.title?.[0]?.plain_text) ||
        (p[key]?.rich_text?.[0]?.plain_text) ||
        "";

      const getMulti = (key) =>
        (p[key]?.multi_select || []).map(x=>x.name);

      const getSelect = (key) =>
        p[key]?.select?.name || "";

      const getCheckbox = (key) =>
        !!p[key]?.checkbox;

      const getFiles = (key) =>
        (p[key]?.files || [])
          .map(f => f?.file?.url || f?.external?.url)
          .filter(Boolean)[0] || "";

      return {
        id: page.id,
        name: getText("Name") || getText("이름"),
        bio: getText("Bio") || getText("소개"),
        instagram: getText("Instagram"),
        phone: getText("Phone"),
        email: getText("Email"),
        mainRole: (getSelect("MainRole") || getSelect("Role") || "").toLowerCase(),
        roles: getMulti("Roles"),
        skills: getMulti("Skills"),
        profileImageUrl: getFiles("ProfileImage") || getFiles("profileImageUrl"),
        verified: getCheckbox("Verified") || getCheckbox("verified") || false
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(crew)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ message:"Notion crew fetch error", details:e.message })
    };
  }
};