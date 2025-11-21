// netlify/functions/gear-reservation.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_GEAR_RESERVATION_DB_ID;

exports.handler = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      page_size: 50,
    });

    const reservations = response.results.map((page) => {
      const p = page.properties;

      const title = p.Title?.title?.[0]?.plain_text || "";
      const renterName = p.RenterName?.rich_text?.[0]?.plain_text || "";
      const projectName = p.ProjectName?.rich_text?.[0]?.plain_text || "";
      const contact = p.Contact?.rich_text?.[0]?.plain_text || "";
      const status = p.Status?.select?.name || "";
      const memo = p.Memo?.rich_text?.[0]?.plain_text || "";

      const date = p.Date?.date || null; // {start, end}

      const gearIds = (p.Gear?.relation || []).map((r) => r.id);

      return {
        id: page.id,
        title,
        gearIds,
        renterName,
        projectName,
        contact,
        date,
        status,
        memo,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(reservations),
    };
  } catch (error) {
    console.error("Notion gear reservation error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Notion gear reservation fetch error",
        details: error?.body || error?.message,
      }),
    };
  }
};