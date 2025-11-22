// gearReservation.js
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const RES_DB_ID = process.env.NOTION_GEAR_RES_DB_ID;

exports.handler = async (event) => {
  if(event.httpMethod!=="POST"){
    return { statusCode:405, body:"Method Not Allowed" };
  }
  try{
    const data = JSON.parse(event.body||"{}");

    await notion.pages.create({
      parent:{ database_id: RES_DB_ID },
      properties:{
        Title:{ title:[{ text:{ content: data.name || "Gear Reservation" } }] },
        Name:{ rich_text:[{ text:{ content: data.name||"" } }] },
        Phone:{ rich_text:[{ text:{ content: data.phone||"" } }] },
        From:{ date: data.from ? { start: data.from } : null },
        To:{ date: data.to ? { start: data.to } : null },
        Note:{ rich_text:[{ text:{ content: data.note||"" } }] },
        GearIds: data.gearId ? { relation:[{ id:data.gearId }] } : { relation:[] }
      }
    });

    return { statusCode:200, body: JSON.stringify({ ok:true }) };
  }catch(err){
    return { statusCode:500, body: JSON.stringify({ message:"Gear reservation error", details:String(err) }) };
  }
};