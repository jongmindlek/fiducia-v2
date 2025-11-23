// netlify/functions/stillcut.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_STILLCUT_DB_ID;

const rt = (v="") => [{ type: "text", text: { content: v } }];

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    if (!DB_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Missing NOTION_STILLCUT_DB_ID" }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    const props = {
      "Title": { title: rt(body.title || "AI Stillcut Reservation") },
      "ProjectTitle": { rich_text: rt(body.projectTitle || "") },
      "Phone": { phone_number: body.phone || "" },
      "Email": { email: body.email || "" },
      "Video Type": body.videoType
        ? { select: { name: body.videoType } }
        : undefined,
      "Runtime": { rich_text: rt(body.runtime || "") },
      "Budget": body.budget
        ? { select: { name: body.budget } }
        : undefined,
      "Shoot Date": body.shootDate
        ? { date: { start: body.shootDate } }
        : undefined,
      "Location": { rich_text: rt(body.location || "") },
      "Reference Link": body.referenceLink
        ? { url: body.referenceLink }
        : undefined,
      "Images": { rich_text: rt(body.imagesMeta || "") }, // Images는 Text로!
      "Message": { rich_text: rt(body.message || "") },
      "Status": { select: { name: "New" } },
    };

    // undefined 제거
    Object.keys(props).forEach(k => props[k] === undefined && delete props[k]);

    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: props,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Notion stillcut fetch error",
        details: err?.message || String(err),
      }),
    };
  }
};