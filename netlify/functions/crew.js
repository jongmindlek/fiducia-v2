const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CREW_DB_ID = process.env.NOTION_CREW_DB_ID;

function pickText(prop){
  if(!prop) return "";
  if(prop.type==="title") return prop.title?.[0]?.plain_text || "";
  if(prop.type==="rich_text") return prop.rich_text?.[0]?.plain_text || "";
  if(prop.type==="select") return prop.select?.name || "";
  if(prop.type==="multi_select") return (prop.multi_select||[]).map(x=>x.name);
  if(prop.type==="url") return prop.url || "";
  if(prop.type==="checkbox") return !!prop.checkbox;
  return "";
}
function pickFileUrl(prop){
  if(!prop || prop.type!=="files") return "";
  const f = prop.files?.[0];
  if(!f) return "";
  return f.type==="external" ? f.external.url : f.file.url;
}

exports.handler = async (event) => {
  try{
    const id = event.queryStringParameters?.id;

    if(id){
      const page = await notion.pages.retrieve({ page_id: id });
      const p = page.properties;
      const crew = {
        id: page.id,
        name: pickText(p.Name || p.이름),
        mainRole: pickText(p.MainRole),
        roles: pickText(p.Roles) || [],
        skills: pickText(p.Skills) || [],
        bio: pickText(p.Bio),
        instagram: pickText(p.Instagram),
        phone: pickText(p.Phone),
        email: pickText(p.Email),
        profileImageUrl: pickFileUrl(p.ProfileImage),
        verified: pickText(p.Verified)
      };
      return { statusCode:200, body: JSON.stringify(crew) };
    }

    const resp = await notion.databases.query({
      database_id: CREW_DB_ID,
      sorts:[{property:"Sort", direction:"ascending"}],
      filter:{ property:"Published", checkbox:{ equals:true } }
    });

    const crews = resp.results.map(page=>{
      const p = page.properties;
      return {
        id: page.id,
        name: pickText(p.Name || p.이름),
        mainRole: pickText(p.MainRole),
        roles: pickText(p.Roles) || [],
        skills: pickText(p.Skills) || [],
        bio: pickText(p.Bio),
        instagram: pickText(p.Instagram),
        phone: pickText(p.Phone),
        email: pickText(p.Email),
        profileImageUrl: pickFileUrl(p.ProfileImage),
        verified: pickText(p.Verified)
      };
    });

    return { statusCode:200, body: JSON.stringify(crews) };
  }catch(err){
    return { statusCode:500, body: JSON.stringify({ message:"Notion crew fetch error", details:String(err) }) };
  }
};