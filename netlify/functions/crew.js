// netlify/functions/crew.js
import fetch from "node-fetch";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const CREW_DB_ID = process.env.NOTION_CREW_DB_ID;

function prop(page, name) {
  return page.properties?.[name];
}

function textProp(page, name) {
  const p = prop(page, name);
  if (!p) return "";
  if (p.type === "title") return p.title?.[0]?.plain_text || "";
  if (p.type === "rich_text") return p.rich_text?.[0]?.plain_text || "";
  return "";
}

function multiSelectProp(page, name) {
  const p = prop(page, name);
  if (!p || p.type !== "multi_select") return [];
  return p.multi_select.map(x => x.name);
}

function selectProp(page, name) {
  const p = prop(page, name);
  if (!p || p.type !== "select") return "";
  return p.select?.name || "";
}

function checkboxProp(page, name) {
  const p = prop(page, name);
  if (!p || p.type !== "checkbox") return false;
  return !!p.checkbox;
}

function urlProp(page, name) {
  const p = prop(page, name);
  if (!p || p.type !== "url") return "";
  return p.url || "";
}

function filesProp(page, name) {
  const p = prop(page, name);
  if (!p || p.type !== "files") return "";
  const f = p.files?.[0];
  if (!f) return "";
  if (f.type === "external") return f.external?.url || "";
  if (f.type === "file") return f.file?.url || "";
  return "";
}

export const handler = async () => {
  try {
    if (!NOTION_TOKEN || !CREW_DB_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Missing NOTION_TOKEN or NOTION_CREW_DB_ID",
        }),
      };
    }

    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${CREW_DB_ID}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
          sorts: [
            { property: "Name", direction: "ascending" },
          ],
        }),
      }
    );

    const json = await notionRes.json();

    if (!notionRes.ok) {
      return {
        statusCode: notionRes.status,
        body: JSON.stringify({
          message: "Notion crew fetch error",
          details: json,
        }),
      };
    }

    const results = (json.results || []).map((page) => {
      return {
        id: page.id,
        name: textProp(page, "Name") || textProp(page, "Title"),
        mainRole: selectProp(page, "MainRole") || selectProp(page, "Role") || "staff",
        roles: multiSelectProp(page, "Roles"),
        skills: multiSelectProp(page, "Skills"),
        bio: textProp(page, "Bio"),
        instagram: urlProp(page, "Instagram"),
        phone: textProp(page, "Phone"),
        email: textProp(page, "Email"),
        profileImageUrl: filesProp(page, "ProfileImage") || filesProp(page, "Profile Image"),
        // verified 값은 남겨두되 UI에서는 안 씀
        verified: checkboxProp(page, "Verified"),
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };

  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Server error",
        details: e.message,
      }),
    };
  }
};