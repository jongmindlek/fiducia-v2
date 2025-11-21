// netlify/functions/crew.js
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_CREW_DB_ID;

exports.handler = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        { property: 'Sort', direction: 'ascending' }
      ]
    });

    const crew = response.results.map((page) => {
      const props = page.properties;

      const name = props.Name?.title?.[0]?.plain_text || '';
      const mainRole = props.MainRole?.select?.name || '';
      const roles = (props.Roles?.multi_select || []).map(o => o.name);
      const skills = (props.Skills?.multi_select || []).map(o => o.name);
      const bio = props.Bio?.rich_text?.[0]?.plain_text || '';
      const instagram = props.Instagram?.url || '';
      const phone = props.Phone?.phone_number || '';
      const email = props.Email?.email || '';

      let profileImageUrl = '';
      if (props.ProfileImage?.files?.[0]) {
        const file = props.ProfileImage.files[0];
        profileImageUrl =
          file.file?.url ||
          file.external?.url ||
          '';
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
        profileImageUrl
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(crew)
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Notion crew fetch error' })
    };
  }
};