// netlify/functions/stillcut-create.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_AI_STILLCUT_DB_ID;

function toNotionFiles(urls = []) {
  return urls
    .filter(Boolean)
    .map((url, i) => ({
      name: `reference_${i + 1}`,
      external: { url },
    }));
}

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
      title,
      clientName,
      contact,
      projectType,
      referenceLink,
      description,
      deadline, // "YYYY-MM-DD"
      preferredCrewIds = [], // crew page ids
      referenceImageUrls = [], // array of urls
    } = body;

    const properties = {
      Title: {
        title: [{ text: { content: title || "AI Stillcut Request" } }],
      },
      ClientName: {
        rich_text: [{ text: { content: clientName || "" } }],
      },
      Contact: {
        rich_text: [{ text: { content: contact || "" } }],
      },
      ProjectType: projectType
        ? { select: { name: projectType } }
        : undefined,
      ReferenceLink: referenceLink ? { url: referenceLink } : undefined,
      Description: {
        rich_text: [{ text: { content: description || "" } }],
      },
      Deadline: deadline ? { date: { start: deadline } } : undefined,
      PreferredCrew:
        preferredCrewIds.length > 0
          ? { relation: preferredCrewIds.map((id) => ({ id })) }
          : undefined,

      // 너가 추가한 컬럼
      UserImages:
        referenceImageUrls.length > 0
          ? { files: toNotionFiles(referenceImageUrls) }
          : undefined,
      AutoCreated: { checkbox: true },
      Status: { select: { name: "요청" } }, // 너 DB select 옵션에 "요청"이 있으면 딱 매칭됨
    };

    // undefined 제거
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
    console.error("stillcut-create error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        ok: false,
        message: "Stillcut create error",
        details: error?.body || error?.message,
      }),
    };
  }
};