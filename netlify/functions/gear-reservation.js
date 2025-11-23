// netlify/functions/stillcut-reserve.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const STILL_DB_ID =
  process.env.AI_STILLCUT_DB_ID ||
  process.env.STILLCUT_RESERVATION_DB_ID ||
  process.env.STILLCUT_DB_ID;

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    if (!STILL_DB_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "STILLCUT_DB_ID is missing" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { name, phone, email, projectTitle, referenceUrl, message } = body;

    if (!name || !phone || !projectTitle || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "필수 항목 누락" }),
      };
    }

    await notion.pages.create({
      parent: { database_id: STILL_DB_ID },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        Phone: { phone_number: phone },
        Email: email ? { email } : undefined,
        ProjectTitle: { rich_text: [{ text: { content: projectTitle } }] },
        ReferenceUrl: referenceUrl ? { url: referenceUrl } : undefined,
        Message: { rich_text: [{ text: { content: message } }] },
        Status: { select: { name: "Requested" } }, // DB에 Status select 있으면 자동 세팅
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Notion stillcut reservation error",
        details: err.message,
      }),
    };
  }
};