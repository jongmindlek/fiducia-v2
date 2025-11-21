// netlify/functions/gear.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_GEAR_DB_ID;

exports.handler = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ property: "Sort", direction: "ascending" }],
    });

    const gear = response.results.map((page) => {
      const p = page.properties;

      const name = p.Name?.title?.[0]?.plain_text || "";
      const category = p.Category?.select?.name || "";
      const brandModel = p.BrandModel?.rich_text?.[0]?.plain_text || "";
      const dayRate = p.DayRate?.number ?? null;
      const status = p.Status?.select?.name || "";
      const serialNumber = p.SerialNumber?.rich_text?.[0]?.plain_text || "";

      let thumbnailUrl = "";
      if (p.Thumbnail?.files?.[0]) {
        const file = p.Thumbnail.files[0];
        thumbnailUrl = file.file?.url || file.external?.url || "";
      }

      return {
        id: page.id,
        name,
        category,
        brandModel,
        dayRate,
        status,
        serialNumber,
        thumbnailUrl,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(gear),
    };
  } catch (error) {
    console.error("Notion gear error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Notion gear fetch error",
        details: error?.body || error?.message,
      }),
    };
  }
};