// stillcutReservation.js
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const RES_DB_ID = process.env.NOTION_STILLCUT_RES_DB_ID;

exports.handler = async (event) => {
  if(event.httpMethod!=="POST"){
    return { statusCode:405, body:"Method Not Allowed" };
  }
  try{
    const data = JSON.parse(event.body||"{}");

    await notion.pages.create({
      parent:{ database_id: RES_DB_ID },
      properties:{
        Title:{ title:[{ text:{ content: data.name || "Stillcut Reservation" } }] },
        Name:{ rich_text:[{ text:{ content: data.name||"" } }] },
        Phone:{ rich_text:[{ text:{ content: data.phone||"" } }] },
        Email:{ rich_text:[{ text:{ content: data.email||"" } }] },
        Note:{ rich_text:[{ text:{ content: data.note||"" } }] },
      }
    });

    return { statusCode:200, body: JSON.stringify({ ok:true }) };
  }catch(err){
    return { statusCode:500, body: JSON.stringify({ message:"Stillcut reservation error", details:String(err) }) };
  }
};