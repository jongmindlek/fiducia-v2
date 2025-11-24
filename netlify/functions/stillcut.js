const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.STILLCUT_DB_ID;

exports.handler = async function(event){
  if(event.httpMethod !== "POST"){
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try{
    const data = JSON.parse(event.body || "{}");

    const imagesMeta = (data.images || [])
      .slice(0,5)
      .map(f=>`${f.name} (${Math.round(f.size/1024)}KB)`)
      .join(", ");

    const props = {
      // Notion 기본 Title (필수)
      "Title": {
        title: [{ text: { content: data.projectTitle || "AI Stillcut Reservation" } }]
      },

      // 스샷에서 보이는 프로퍼티들
      "Phone": data.phone ? { phone_number: data.phone } : undefined,
      "Email": data.email ? { email: data.email } : undefined,
      "ProjectTitle": data.projectTitle
        ? { rich_text: [{ text: { content: data.projectTitle } }] }
        : undefined,

      "Video Type": data.videoType
        ? { select: { name: data.videoType } }
        : undefined,

      "Runtime": data.runtime
        ? { rich_text: [{ text: { content: data.runtime } }] }
        : undefined,

      "Budget": data.budget
        ? { select: { name: data.budget } }
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

      // 상태 기본값(있으면)
      "Status": { select: { name: "New" } }
    };

    // undefined 프로퍼티 제거
    Object.keys(props).forEach(k => props[k] === undefined && delete props[k]);

    const created = await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: props
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ ok:true, id: created.id })
    };
  }catch(e){
    return {
      statusCode: 500,
      body: JSON.stringify({ message:"Notion stillcut fetch error", details:e.message })
    };
  }
};