const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const GEAR_DB_ID = process.env.NOTION_GEAR_DB_ID;

function pickText(prop){
  if(!prop) return "";
  if(prop.type==="title") return prop.title?.[0]?.plain_text || "";
  if(prop.type==="rich_text") return prop.rich_text?.[0]?.plain_text || "";
  if(prop.type==="select") return prop.select?.name || "";
  if(prop.type==="number") return prop.number;
  if(prop.type==="url") return prop.url || "";
  return "";
}
function pickFileUrl(prop){
  if(!prop || prop.type!=="files") return "";
  const f = prop.files?.[0];
  if(!f) return "";
  return f.type==="external" ? f.external.url : f.file.url;
}

exports.handler = async () => {
  try{
    const resp = await notion.databases.query({
      database_id: GEAR_DB_ID,
      sorts:[{property:"Sort", direction:"ascending"}],
      filter:{ property:"Published", checkbox:{ equals:true } }
    });
    const gears = resp.results.map(page=>{
      const p = page.properties;
      return {
        id: page.id,
        name: pickText(p.Name),
        category: pickText(p.Category),
        brandModel: pickText(p.BrandModel),
        dayRate: pickText(p.DayRate),
        status: pickText(p.Status),
        serialNumber: pickText(p.SerialNumber),
        thumbnailUrl: pickFileUrl(p.ThumbnailUrl)
      };
    });
    return { statusCode:200, body: JSON.stringify(gears) };
  }catch(err){
    return { statusCode:500, body: JSON.stringify({ message:"Notion gear fetch error", details:String(err) }) };
  }
};