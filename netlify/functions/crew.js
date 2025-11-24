// netlify/functions/crew.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CREW_DB_ID = process.env.CREW_DB_ID;

// 안전하게 노션 property 읽기
function getTitle(prop) {
  if (!prop || prop.type !== "title") return "";
  return prop.title.map(t => t.plain_text).join("");
}
function getRichText(prop) {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text.map(t => t.plain_text).join("");
}
function getSelect(prop) {
  if (!prop || prop.type !== "select") return "";
  return prop.select ? prop.select.name : "";
}
function getMultiSelect(prop) {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map(s => s.name);
}
function getCheckbox(prop) {
  if (!prop || prop.type !== "checkbox") return false;
  return !!prop.checkbox;
}
function getUrl(prop) {
  if (!prop || prop.type !== "url") return "";
  return prop.url || "";
}
function getEmail(prop) {
  if (!prop || prop.type !== "email") return "";
  return prop.email || "";
}
function getPhone(prop) {
  if (!prop || prop.type !== "phone_number") return "";
  return prop.phone_number || "";
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const url = new URL(event.rawUrl);
    const verifiedOnly = url.searchParams.get("verifiedOnly") === "1";

    // ✅ Published 같은 존재 불확실한 필터 절대 쓰지 않음
    const queryPayload = {
      database_id: CREW_DB_ID,
      page_size: 100,
    };

    // VerifiedOnly=1일 때만 Verified 필터, 없으면 그냥 통과
    if (verifiedOnly) {
      queryPayload.filter = {
        property: "Verified",
        checkbox: { equals: true },
      };
    }

    const res = await notion.databases.query(queryPayload);

    const items = res.results.map(page => {
      const p = page.properties;

      return {
        id: page.id,
        name: getTitle(p.Name) || getTitle(p.Title) || getRichText(p.NameText),
        mainRole: getSelect(p["Main Role"]) || getSelect(p.Role) || getSelect(p.MainRole),
        roles: getMultiSelect(p.Roles) || getMultiSelect(p.RoleTags),
        skills: getMultiSelect(p.Skills),
        bio: getRichText(p.Bio),
        instagram: getUrl(p.Instagram),
        phone: getPhone(p.Phone),
        email: getEmail(p.Email),
        profileImageUrl: getUrl(p.ProfileImage) || getUrl(p.Image),
        verified: getCheckbox(p.Verified), // 화면에서 뱃지는 안 씀, 데이터만 유지
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Notion crew fetch error",
        details: err?.message || String(err),
      }),
    };
  }
};