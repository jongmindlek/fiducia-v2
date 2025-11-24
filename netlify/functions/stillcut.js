const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// 안전하게 둘 다 지원(혹시 env 이름 다르게 넣었을 때 대비)
const DB_ID = process.env.STILLCUT_DB_ID || process.env.STILL_DB_ID;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    const imagesMeta = Array.isArray(data.images)
      ? data.images
          .slice(0,5)
          .map(f => `${f.name} (${Math.round(f.size/1024)}KB)`)
          .join(", ")
      : "";

    const props = {
      "ProjectTitle": {
        title: [{ text: { content: data.projectTitle || "AI Stillcut" } }]
      },
      "Phone": data.phone
        ? { phone_number: data.phone }
        : undefined,
      "Email": data.email
        ? { email: data.email }
        : undefined,
      "Video Type": data.videoType
        ? { select: { name: data.videoType } }
        : undefined,
      "Runtime": data.runtime
        ? { rich_text: [{ text: { content: String(data.runtime) } }] }
        : undefined,
      "Budget": data.budgetRange
        ? { select: { name: data.budgetRange } }
        : undefined,
      "Shoot Date": data.shootDate
        ? { date: { start: data.shootDate } }
        : undefined,
      "Location": data.location
        ? { rich_text: [{ text: { content: data.location } }] }
        : undefined,
      "Reference Link": data.referenceLink
        ? { url: data.referenceLink }
        : undefined,
      "Images": imagesMeta
        ? { rich_text: [{ text: { content: imagesMeta } }] }
        : undefined,
      "Message": data.message
        ? { rich_text: [{ text: { content: data.message } }] }
        : undefined,
      "Status": { select: { name: "New" } }
    };

    Object.keys(props).forEach(k => props[k] === undefined && delete props[k]);

    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: props
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        message: "Notion stillcut error",
        details: e.message
      })
    };
  }
};