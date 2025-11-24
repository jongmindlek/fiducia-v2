import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CREW_DB_ID = process.env.CREW_DB_ID;

export const handler = async () => {
  try {
    const res = await notion.databases.query({
      database_id: CREW_DB_ID,
      filter: {
        property: "Published",   // ✅ Crew DB에 이 체크박스가 꼭 있어야 함
        checkbox: { equals: true }
      },
      sorts: [{ property: "Name", direction: "ascending" }]
    });

    const people = res.results.map(page => {
      const props = page.properties;

      const getText = (p) =>
        p?.title?.[0]?.plain_text ||
        p?.rich_text?.[0]?.plain_text ||
        "";

      return {
        id: page.id,
        name: getText(props.Name),
        mainRole: props.MainRole?.select?.name?.toLowerCase() || "",
        roles: props.Roles?.multi_select?.map(x=>x.name) || [],
        skills: props.Skills?.multi_select?.map(x=>x.name) || [],
        bio: getText(props.Bio),
        instagram: props.Instagram?.url || "",
        phone: props.Phone?.phone_number || "",
        email: props.Email?.email || "",
        profileImageUrl: props.ProfileImageUrl?.url || "",
        verified: props.Verified?.checkbox || false,
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(people)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ message:"Notion crew fetch error", details: err.message })
    };
  }
};