// netlify/functions/crew.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CREW_DB_ID = process.env.NOTION_CREW_DB_ID;

function getTitle(prop) {
  if (!prop?.title) return "";
  return prop.title.map(t => t.plain_text).join("");
}

function getText(prop) {
  if (!prop?.rich_text) return "";
  return prop.rich_text.map(t => t.plain_text).join("");
}

function getSelect(prop) {
  return prop?.select?.name || "";
}

function getMulti(prop) {
  return (prop?.multi_select || []).map(x => x.name);
}

function getUrl(prop) {
  return prop?.url || "";
}

function getPhone(prop) {
  return prop?.phone_number || "";
}

function getEmail(prop) {
  return prop?.email || "";
}

function getCheckbox(prop) {
  return !!prop?.checkbox;
}

function getFiles(prop) {
  const files = prop?.files || [];
  if (!files.length) return "";
  const f = files[0];
  if (f.type === "external") return f.external.url;
  if (f.type === "file") return f.file.url;
  return "";
}

exports.handler = async () => {
  try {
    if (!CREW_DB_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Missing NOTION_CREW_DB_ID" }),
      };
    }

    const res = await notion.databases.query({
      database_id: CREW_DB_ID,
      sorts: [{ property: "Name", direction: "ascending" }],
    });

    const items = res.results.map(page => {
      const p = page.properties;

      return {
        id: page.id,
        name: getTitle(p["Name"]),
        mainRole: getSelect(p["MainRole"]),
        roles: getMulti(p["Roles"]),
        skills: getMulti(p["Skills"]),
        bio: getText(p["Bio"]),
        instagram: getUrl(p["Instagram"]) || getText(p["Instagram"]),
        phone: getPhone(p["Phone"]),
        email: getEmail(p["Email"]),
        profileImageUrl: getFiles(p["ProfileImage"]),
        verified: getCheckbox(p["Verified"]),
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Notion crew fetch error",
        details: err?.message || String(err),
      }),
    };
  }
};