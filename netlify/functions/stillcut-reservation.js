// netlify/functions/stillcut.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const STILLCUT_DB_ID = process.env.STILLCUT_DB_ID;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      const res = await notion.databases.query({
        database_id: STILLCUT_DB_ID,
        page_size: 50,
        sorts: [{ property: "Shoot Date", direction: "ascending" }],
      });

      const items = res.results.map(page => {
        const p = page.properties;
        const title = p.Title?.title?.[0]?.plain_text || "";
        return {
          id: page.id,
          title,
        };
      });

      return json(200, items);
    }

    if (event.httpMethod !== "POST") {
      return json(405, { message: "Method Not Allowed" });
    }

    const data = JSON.parse(event.body || "{}");

    const {
      title,
      phone,
      email,
      projectTitle,
      videoType,
      runtime,
      budget,
      shootDate,
      location,
      referenceLink,
      imagesMeta, // 배열(or 문자열)
      message,
    } = data;

    const imagesText = Array.isArray(imagesMeta)
      ? imagesMeta.join(", ")
      : (imagesMeta || "");

    const createRes = await notion.pages.create({
      parent: { database_id: STILLCUT_DB_ID },
      properties: {
        // ✅ DB에 있는 이름 그대로
        "Title": { title: [{ text: { content: title || "AI Stillcut Request" } }] },
        "Phone": phone ? { phone_number: phone } : undefined,
        "Email": email ? { email: email } : undefined,
        "ProjectTitle": projectTitle
          ? { rich_text: [{ text: { content: projectTitle } }] }
          : undefined,

        "Video Type": videoType
          ? { select: { name: videoType } }
          : undefined,

        "Runtime": (runtime !== null && runtime !== undefined && runtime !== "")
          ? { number: Number(runtime) }
          : undefined,

        "Budget": budget
          ? { select: { name: budget } }
          : undefined,

        "Shoot Date": shootDate
          ? { date: { start: shootDate } }
          : undefined,

        "Location": location
          ? { rich_text: [{ text: { content: location } }] }
          : undefined,

        "Reference Link": referenceLink
          ? { url: referenceLink }
          : undefined,

        "Images": imagesText
          ? { rich_text: [{ text: { content: imagesText } }] }
          : undefined,

        "Message": message
          ? { rich_text: [{ text: { content: message } }] }
          : undefined,

        "Status": { select: { name: "Requested" } },
      },
    });

    return json(200, { ok: true, id: createRes.id });
  } catch (err) {
    return json(500, {
      message: "Notion stillcut error",
      details: err?.message || String(err),
    });
  }
};