// netlify/functions/crew.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_CREW_DB_ID;

exports.handler = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ property: "Sort", direction: "ascending" }],
    });

    const crew = response.results.map((page) => {
      const p = page.properties;

      const name = p.Name?.title?.[0]?.plain_text || "";
      const mainRole = p.MainRole?.select?.name || "";
      const roles = (p.Roles?.multi_select || []).map((o) => o.name);
      const skills = (p.Skills?.multi_select || []).map((o) => o.name);
      const bio = p.Bio?.rich_text?.[0]?.plain_text || "";

      const instagram = p.Instagram?.url || "";
      const phone = p.Phone?.phone_number || "";
      const email = p.Email?.email || "";

      let profileImageUrl = "";
      if (p.ProfileImage?.files?.[0]) {
        const file = p.ProfileImage.files[0];
        profileImageUrl = file.file?.url || file.external?.url || "";
      }

      return {
        id: page.id,
        name,
        mainRole,
        roles,
        skills,
        bio,
        instagram,
        phone,
        email,
        profileImageUrl,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(crew),
    };
  } catch (error) {
    console.error("Notion crew error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Notion crew fetch error",
        details: error?.body || error?.message,
      }),
    };
  }
};