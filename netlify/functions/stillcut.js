// netlify/functions/stillcut.js
const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  if(event.httpMethod !== "POST"){
    return { statusCode:405, body:"Method Not Allowed" };
  }

  try{
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const database_id = process.env.NOTION_STILLCUT_DB_ID;

    const data = JSON.parse(event.body || "{}");

    const {
      projectTitle, phone, email,
      videoType, runtime, budget,
      shootDate, location,
      referenceLink, imagesMeta,
      message
    } = data;

    const imagesText = Array.isArray(imagesMeta) && imagesMeta.length
      ? imagesMeta.map(m=>`${m.name} (${m.sizeKB}KB)`).join("\n")
      : "";

    const page = await notion.pages.create({
      parent: { database_id },
      properties: {
        // Title (title)
        Title: { title: [{ text: { content: projectTitle || "AI Stillcut Request" } }] },

        Phone: phone ? { rich_text: [{ text: { content: phone } }] } : undefined,
        Email: email ? { rich_text: [{ text: { content: email } }] } : undefined,
        ProjectTitle: projectTitle ? { rich_text: [{ text: { content: projectTitle } }] } : undefined,

        "Video Type": videoType ? { select: { name: videoType } } : undefined,
        Runtime: (runtime!=null && runtime!=="") ? { number: Number(runtime) } : undefined,
        Budget: budget ? { select: { name: budget } } : undefined,
        "Shoot Date": shootDate ? { date: { start: shootDate } } : undefined,

        Location: location ? { rich_text: [{ text: { content: location } }] } : undefined,
        "Reference Link": referenceLink ? { url: referenceLink } : undefined,

        // Images 컬럼이 '텍스트' 타입이라 메타만 저장
        Images: imagesText
          ? { rich_text: [{ text: { content: imagesText } }] }
          : undefined,

        Message: message ? { rich_text: [{ text: { content: message } }] } : undefined,

        // Status는 있으면 기본값 "Requested"로
        Status: { select: { name: "Requested" } },
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ ok:true, id: page.id }),
    };
  }catch(e){
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:"Notion stillcut error",
        details: e.message
      })
    };
  }
};