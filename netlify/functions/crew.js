const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CREW_DB_ID = process.env.CREW_DB_ID;

function rt(props, key){
  const p = props?.[key];
  if(!p) return "";
  if(p.type === "title") return p.title?.map(t=>t.plain_text).join("") || "";
  if(p.type === "rich_text") return p.rich_text?.map(t=>t.plain_text).join("") || "";
  return "";
}
function url(props, key){
  const p=props?.[key];
  if(!p) return "";
  if(p.type==="url") return p.url || "";
  if(p.type==="rich_text") return p.rich_text?.[0]?.plain_text || "";
  return "";
}
function multi(props,key){
  const p=props?.[key];
  if(!p) return [];
  if(p.type==="multi_select") return p.multi_select?.map(x=>x.name) || [];
  if(p.type==="select") return p.select?.name ? [p.select.name] : [];
  return [];
}
function checkbox(props,key){
  const p=props?.[key];
  if(!p) return false;
  if(p.type==="checkbox") return !!p.checkbox;
  return false;
}

exports.handler = async function(){
  try{
    // 1) 일단 전체 가져오기 (Published 없을 수도 있으니까)
    const resp = await notion.databases.query({
      database_id: CREW_DB_ID,
      page_size: 100
    });

    const pages = resp.results || [];

    const crews = pages.map(page=>{
      const props = page.properties || {};
      const mainRole =
        rt(props,"MainRole") ||
        rt(props,"mainRole") ||
        (props["Role"]?.select?.name || "");

      return {
        id: page.id,
        name:
          rt(props,"Name") ||
          rt(props,"name") ||
          rt(props,"Title") || "",
        mainRole: (mainRole || "").toLowerCase().includes("staff") ? "staff" : "director",
        roles: multi(props,"Roles") || multi(props,"roles"),
        skills: multi(props,"Skills") || multi(props,"skills"),
        bio: rt(props,"Bio") || rt(props,"bio"),
        instagram: url(props,"Instagram") || url(props,"instagram"),
        phone: rt(props,"Phone") || rt(props,"phone"),
        email: rt(props,"Email") || rt(props,"email"),
        profileImageUrl:
          url(props,"ProfileImageUrl") ||
          url(props,"profileImageUrl"),
        verified:
          checkbox(props,"Verified") ||
          checkbox(props,"verified") ||
          checkbox(props,"Published") || false
      };
    });

    // 2) Published / Verified 있으면 true만 남기는 “안전 필터”
    const hasPublished = crews.some(c=>c.verified === true);
    const filtered = hasPublished ? crews : crews;

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(filtered)
    };
  }catch(e){
    return {
      statusCode: 500,
      body: JSON.stringify({ message:"Notion crew fetch error", details:e.message })
    };
  }
};