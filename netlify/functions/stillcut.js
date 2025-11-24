const { Client } = require("@notionhq/client");

exports.handler = async (event) => {
  if(event.httpMethod !== "POST"){
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const database_id = process.env.STILLCUT_DB_ID;

    const data = JSON.parse(event.body || "{}");

    // Notion property helper
    const title = (t)=>({ title:[{ text:{ content:String(t||"") } }] });
    const rich = (t)=>({ rich_text:[{ text:{ content:String(t||"") } }] });
    const select = (name)=> name ? ({ select:{ name:String(name) } }) : undefined;
    const date = (d)=> d ? ({ date:{ start:String(d) } }) : undefined;

    const props = {
      "ProjectTitle": title(data.projectTitle),
      "Phone": rich(data.phone),
      "Email": rich(data.email),
      "Video Type": select(data.videoType),
      "Runtime": rich(data.runtime),
      "Budget": select(data.budget),
      "Shoot Date": date(data.shootDate),
      "Location": rich(data.location),
      "Reference Link": rich(data.referenceLink || ""),
      "Images": rich(data.imagesMeta || ""),
      "Message": rich(data.message),
      "Status": select("Requested")
    };

    // undefined 제거
    Object.keys(props).forEach(k=> props[k]===undefined && delete props[k]);

    await notion.pages.create({
      parent: { database_id },
      properties: props
    });

    return {
      statusCode: 200,
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ok:true })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message:"Notion stillcut fetch error", details:e.message })
    };
  }
};