// netlify/functions/crew.js
const { Client } = require("@notionhq/client");

exports.handler = async () => {
  try{
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const database_id = process.env.NOTION_CREW_DB_ID;

    const pages = [];
    let cursor = undefined;

    while(true){
      const res = await notion.databases.query({
        database_id,
        start_cursor: cursor,
        page_size: 100,
      });
      pages.push(...res.results);
      if(!res.has_more) break;
      cursor = res.next_cursor;
    }

    const pickText = (prop) => {
      if(!prop) return "";
      const t = prop.title || prop.rich_text;
      if(!t || !t[0]) return "";
      return t.map(x=>x.plain_text).join("");
    };
    const pickSelect = (prop) => prop?.select?.name || "";
    const pickMulti = (prop) => (prop?.multi_select || []).map(x=>x.name);
    const pickCheckbox = (prop) => !!prop?.checkbox;
    const pickUrl = (prop) => prop?.url || "";
    const pickFiles = (prop) => {
      const f = prop?.files || [];
      const first = f[0];
      if(!first) return "";
      return first.type === "external" ? first.external.url : first.file.url;
    };

    const crew = pages.map(p => {
      const props = p.properties || {};
      return {
        id: p.id,
        name: pickText(props.Name) || pickText(props.Title),
        mainRole: pickSelect(props.MainRole) || pickSelect(props.Role) || "staff",
        roles: pickMulti(props.Roles),
        skills: pickMulti(props.Skills),
        bio: pickText(props.Bio),
        instagram: pickUrl(props.Instagram),
        phone: pickText(props.Phone),
        email: pickText(props.Email),
        profileImageUrl: pickFiles(props.ProfileImage) || pickUrl(props.ProfileImageUrl),
        verified: pickCheckbox(props.Verified),
        profileUrl: pickUrl(props.ProfileUrl),
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(crew),
    };
  }catch(e){
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:"Notion crew fetch error",
        details: e.message
      })
    };
  }
};