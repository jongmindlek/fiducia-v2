// netlify/functions/stillcut.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_AI_STILLCUT_DB_ID;

exports.handler = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      page_size: 50,
    });

    const stillcuts = response.results.map((page) => {
      const p = page.properties;

      const title = p.Title?.title?.[0]?.plain_text || "";
      const clientName = p.ClientName?.rich_text?.[0]?.plain_text || "";
      const contact = p.Contact?.rich_text?.[0]?.plain_text || "";
      const projectType = p.ProjectType?.select?.name || "";
      const referenceLink = p.ReferenceLink?.url || "";
      const description = p.Description?.rich_text?.[0]?.plain_text || "";
      const deadline = p.Deadline?.date || null;
      const status = p.Status?.select?.name || "";

      const preferredCrewIds = (p.PreferredCrew?.relation || []).map((r) => r.id);

      const referenceImages =
        (p.ReferenceImages?.files || [])
          .map((f) => f.file?.url || f.external?.url)
          .filter(Boolean);

      return {
        id: page.id,
        title,
        clientName,
        contact,
        projectType,
        referenceLink,
        referenceImages,
        description,
        preferredCrewIds,
        deadline,
        status,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(stillcuts),
    };
  } catch (error) {
    console.error("Notion stillcut error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Notion stillcut fetch error",
        details: error?.body || error?.message,
      }),
    };
  }
};