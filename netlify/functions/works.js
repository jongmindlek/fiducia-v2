const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const WORKS_DB_ID = process.env.NOTION_WORKS_DB_ID;

function pickText(prop){
  if(!prop) return "";
  if(prop.type==="title") return prop.title?.[0]?.plain_text || "";
  if(prop.type==="rich_text") return prop.rich_text?.[0]?.plain_text || "";
  if(prop.type==="select") return prop.select?.name || "";
  if(prop.type==="url") return prop.url || "";
  if(prop.type==="multi_select") return (prop.multi_select||[]).map(x=>x.name);
  return "";
}
function pickFileUrl(prop){
  if(!prop || prop.type!=="files") return "";
  const f = prop.files?.[0];
  if(!f) return "";
  return f.type==="external" ? f.external.url : f.file.url;
}
function pickRelationIds(prop){
  if(!prop || prop.type!=="relation") return [];
  return (prop.relation||[]).map(r=>r.id);
}

exports.handler = async (event) => {
  try{
    const crewId = event.queryStringParameters?.crewId;

    const filterBase = { property:"Published", checkbox:{ equals:true } };

    const filter = crewId ? {
      and: [
        filterBase,
        { property:"CrewIds", relation:{ contains: crewId } }
      ]
    } : filterBase;

    const resp = await notion.databases.query({
      database_id: WORKS_DB_ID,
      sorts:[{property:"Sort", direction:"ascending"}],
      filter
    });

    const works = resp.results.map(page=>{
      const p = page.properties;
      return {
        id: page.id,
        title: pickText(p.Title),
        subTitle: pickText(p.SubTitle),
        roleLabel: pickText(p.RoleLabel),
        roleName: pickText(p.RoleName),
        thumbnailUrl: pickFileUrl(p.ThumbnailUrl),
        url: pickText(p.Url) || pickText(p.URL),
        crewIds: pickRelationIds(p.CrewIds)
      };
    });

    return { statusCode:200, body: JSON.stringify(works) };
  }catch(err){
    return { statusCode:500, body: JSON.stringify({ message:"Notion works fetch error", details:String(err) }) };
  }
};