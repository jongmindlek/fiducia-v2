const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CREW_DB_ID = process.env.CREW_DB_ID;

function getText(p){
  if(!p) return "";
  if(p.type === "title") return p.title?.map(t=>t.plain_text).join("") || "";
  if(p.type === "rich_text") return p.rich_text?.map(t=>t.plain_text).join("") || "";
  return "";
}
function getSelect(p){
  return p?.select?.name || "";
}
function getMulti(p){
  return p?.multi_select?.map(x=>x.name) || [];
}
function getCheckbox(p){
  return !!p?.checkbox;
}
function getFilesFirst(p){
  const f = p?.files?.[0];
  return f?.file?.url || f?.external?.url || "";
}

exports.handler = async () => {
  try{
    const res = await notion.databases.query({
      database_id: CREW_DB_ID,
      page_size: 100
      // ✅ filter 제거: Published 없어도 OK
    });

    const crews = (res.results || []).map(page=>{
      const props = page.properties || {};

      const mainRoleRaw =
        getSelect(props.MainRole) ||
        getText(props.MainRole) ||
        getSelect(props.Role) ||
        "";

      const mainRole = mainRoleRaw.toLowerCase().includes("staff")
        ? "staff"
        : "director";

      return {
        id: page.id,
        name: getText(props.Name) || getText(props.Title),
        bio: getText(props.Bio),
        mainRole,
        roles: getMulti(props.Roles),
        skills: getMulti(props.Skills),
        verified: getCheckbox(props.Verified),
        profileImageUrl:
          getFilesFirst(props.ProfileImage) ||
          (props.ProfileImageUrl?.url || "")
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(crews)
    };
  }catch(e){
    return {
      statusCode: 500,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        message: "Notion crew fetch error",
        details: e.message
      })
    };
  }
};