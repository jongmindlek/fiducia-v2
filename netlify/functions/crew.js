// netlify/functions/crew.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CREW_DB_ID =
  process.env.CREW_DB_ID ||
  process.env.NOTION_CREW_DB_ID ||
  process.env.CREW_DATABASE_ID;

function getText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.[0]?.plain_text || "";
  if (prop.type === "rich_text") return prop.rich_text?.[0]?.plain_text || "";
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "email") return prop.email || "";
  if (prop.type === "phone_number") return prop.phone_number || "";
  return "";
}
function getMulti(prop) {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select.map((x) => x.name);
}
function getSelect(prop) {
  if (!prop || prop.type !== "select") return "";
  return prop.select?.name || "";
}
function getCheckbox(prop) {
  if (!prop || prop.type !== "checkbox") return false;
  return !!prop.checkbox;
}
function getFilesUrl(prop) {
  if (!prop || prop.type !== "files") return "";
  const file = prop.files?.[0];
  if (!file) return "";
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return "";
}

exports.handler = async () => {
  try {
    if (!CREW_DB_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "CREW_DB_ID is missing" }),
      };
    }

    const query = await notion.databases.query({
      database_id: CREW_DB_ID,
      // ✅ Published 필터 제거
      sorts: [{ property: "Sort", direction: "ascending" }],
    });

    const items = query.results.map((page) => {
      const p = page.properties;

      const name =
        getText(p.Name) || getText(p.이름) || getText(p.Title) || "";

      const mainRole =
        getSelect(p.MainRole) ||
        getSelect(p.mainRole) ||
        getSelect(p.Role) ||
        getSelect(p.메인역할) ||
        "";

      const roles =
        getMulti(p.Roles) || getMulti(p.roles) || getMulti(p.역할) || [];

      const skills =
        getMulti(p.Skills) || getMulti(p.skills) || getMulti(p.스킬) || [];

      const bio =
        getText(p.Bio) || getText(p.bio) || getText(p.소개) || "";

      const instagram =
        getText(p.Instagram) || getText(p.instagram) || "";

      const phone =
        getText(p.Phone) || getText(p.phone) || "";

      const email =
        getText(p.Email) || getText(p.email) || "";

      const profileImageUrl =
        getFilesUrl(p.ProfileImage) ||
        getFilesUrl(p.ProfileImageUrl) ||
        getFilesUrl(p.profileImage) ||
        "";

      const verified =
        getCheckbox(p.Verified) || getCheckbox(p.verified) || false;

      return {
        id: page.id,
        name,
        mainRole,
        roles,
        skills,
        bio,
        instagram,
        phone,
        email,
        profileImageUrl,
        verified,
      };
    });

    return { statusCode: 200, body: JSON.stringify(items) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Notion crew fetch error",
        details: err.message,
      }),
    };
  }
};