// netlify/functions/gear-reservation-create.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_GEAR_RESERVATION_DB_ID;

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      gearId, // relation target id (gear page id)
      renterName,
      projectName,
      contact,
      startDate, // "YYYY-MM-DD"
      endDate,   // "YYYY-MM-DD" or ""
      memo,
    } = body;

    const properties = {
      Title: {
        title: [
          {
            text: {
              content: projectName
                ? `${projectName} / 장비예약`
                : "Gear Reservation",
            },
          },
        ],
      },
      RenterName: {
        rich_text: [{ text: { content: renterName || "" } }],
      },
      ProjectName: {
        rich_text: [{ text: { content: projectName || "" } }],
      },
      Contact: {
        rich_text: [{ text: { content: contact || "" } }],
      },
      Date: startDate
        ? {
            date: {
              start: startDate,
              end: endDate || null,
            },
          }
        : undefined,
      Gear: gearId ? { relation: [{ id: gearId }] } : undefined,
      Memo: {
        rich_text: [{ text: { content: memo || "" } }],
      },

      AutoCreated: { checkbox: true },
      Status: { select: { name: "요청" } },
    };

    Object.keys(properties).forEach(
      (k) => properties[k] === undefined && delete properties[k]
    );

    const created = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ ok: true, id: created.id }),
    };
  } catch (error) {
    console.error("gear-reservation-create error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        ok: false,
        message: "Gear reservation create error",
        details: error?.body || error?.message,
      }),
    };
  }
};