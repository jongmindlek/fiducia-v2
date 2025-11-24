import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const STILL_DB_ID = process.env.STILL_DB_ID;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    const imagesMeta = safeJSON(data.imagesMeta, []);

    const properties = {
      "ProjectTitle": { title: [{ text: { content: data.projectTitle || "Untitled" } }] },
      "Phone": { phone_number: data.phone || "" },
      "Email": { email: data.email || "" },
      "Video Type": data.videoType ? { select: { name: data.videoType } } : undefined,
      "Runtime": data.runtime ? { number: Number(data.runtime) } : undefined,
      "Budget": data.budget ? { select: { name: data.budget } } : undefined,
      "Shoot Date": data.shootDate ? { date: { start: data.shootDate } } : undefined,
      "Location": data.location ? { rich_text: [{ text: { content: data.location } }] } : undefined,
      "Reference Link": data.referenceLink ? { url: data.referenceLink } : undefined,
      "Images": imagesMeta.length
        ? { rich_text: [{ text: { content: imagesMeta.map(x=>x.name).join(", ") } }] }
        : { rich_text: [] },
      "Message": data.message
        ? { rich_text: [{ text: { content: data.message } }] }
        : { rich_text: [] },
      "Status": { select: { name: "New" } }
    };

    // undefined 제거
    Object.keys(properties).forEach(k => properties[k] === undefined && delete properties[k]);

    await notion.pages.create({
      parent: { database_id: STILL_DB_ID },
      properties
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ ok:true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ message:"Notion stillcut fetch error", details: err.message })
    };
  }
};

function safeJSON(str, fallback){
  try { return JSON.parse(str); } catch { return fallback; }
}