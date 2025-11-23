// netlify/functions/stillcut.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// 너 노션 DB ID를 Netlify env에 넣어둔 그 키 이름으로 맞춰줬어
const DB_ID = process.env.STILLCUT_DB_ID;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      clientName,
      clientKakao,
      runtimeMin,
      videoType,
      budgetRange,
      shootDate,
      location,
      referenceUrl,
      imageFiles,
      request,
    } = body;

    // 기본 검증
    if (!clientName || !clientKakao || !runtimeMin || !videoType || !budgetRange || !shootDate || !location || !request) {
      return { statusCode: 400, body: JSON.stringify({ message: "필수 입력값 누락" }) };
    }

    // 이미지 메타 문자열로
    const imageMetaText = Array.isArray(imageFiles)
      ? imageFiles.map(f => `${f.name} (${Math.round(f.size/1024)}KB)`).join(", ")
      : "";

    // ⚠️ 여기 property 이름은 "노션 DB 컬럼명"이랑 1:1로 맞아야 함!
    // 네 DB가 영어로 돼있다고 했으니까 영어로 만들어 둠.
    // 만약 컬럼명이 다르면 이 부분만 이름 수정해주면 됨.
    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        Title: {
          title: [{ text: { content: clientName } }]
        },
        ClientKakao: {
          rich_text: [{ text: { content: clientKakao } }]
        },
        RuntimeMin: {
          number: Number(runtimeMin)
        },
        VideoType: {
          select: { name: String(videoType) }
        },
        BudgetRange: {
          select: { name: String(budgetRange) }
        },
        ShootDate: {
          date: { start: shootDate }
        },
        Location: {
          rich_text: [{ text: { content: location } }]
        },
        ReferenceUrl: referenceUrl
          ? { url: referenceUrl }
          : { url: null },
        ImageFiles: {
          rich_text: [{ text: { content: imageMetaText || "없음" } }]
        },
        Request: {
          rich_text: [{ text: { content: request } }]
        },
        Status: {
          select: { name: "New" }
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Notion stillcut fetch error",
        details: err.message
      })
    };
  }
};