// netlify/functions/works.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_WORKS_DB_ID;

function getText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.[0]?.plain_text || "";
  if (prop.type === "rich_text") return prop.rich_text?.[0]?.plain_text || "";
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "multi_select") return (prop.multi_select || []).map(v => v.name).join(", ");
  return "";
}

function getFileUrl(prop) {
  const f = prop?.files?.[0];
  if (!f) return "";
  return f.file?.url || f.external?.url || "";
}

function getRelationIds(prop){
  if(!prop || prop.type !== "relation") return [];
  return (prop.relation || []).map(r => r.id);
}

exports.handler = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
      sorts: [{ property: "Sort", direction: "ascending" }],
    });

    const works = response.results.map((page) => {
      const p = page.properties;

      // relation 컬럼 이름이 뭐든 최대한 찾아서 crewIds로
      const relationCandidates = ["Crew", "Creators", "Director", "Staff", "People"];
      let crewIds = [];
      for (const key of relationCandidates) {
        if (p[key]?.type === "relation") {
          crewIds = getRelationIds(p[key]);
          if (crewIds.length) break;
        }
      }

      return {
        id: page.id,
        title: getText(p.Title),
        subTitle: getText(p.SubTitle),
        roleLabel: getText(p.RoleLabel),
        roleName: getText(p.RoleName),
        thumbnailUrl: getFileUrl(p.ThumbnailUrl),
        crewIds, // <-- 상세페이지 필모 자동연결용
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(works),
    };
  } catch (error) {
    console.error("Notion works error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Notion works fetch error",
        details: error?.body || error?.message,
      }),
    };
  }
};