// netlify/functions/works.js
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_WORKS_DB_ID;

exports.handler = async () => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: { equals: true }
      },
      sorts: [
        { property: 'Sort', direction: 'ascending' }
      ]
    });

    const works = response.results.map((page) => {
      const props = page.properties;

      const title = props.Title?.title?.[0]?.plain_text || '';
      const subTitle = props.SubTitle?.rich_text?.[0]?.plain_text || '';
      const roleLabel = props.RoleLabel?.rich_text?.[0]?.plain_text || '';
      const roleName = props.RoleName?.rich_text?.[0]?.plain_text || '';

      // 파일 방식 Thumbnail
      let thumbnailUrl = '';
      if (props.ThumbnailUrl?.files?.[0]) {
        const file = props.ThumbnailUrl.files[0];
        thumbnailUrl =
          file.file?.url ||
          file.external?.url ||
          '';
      }

      return {
        id: page.id,
        title,
        subTitle,
        roleLabel,
        roleName,
        thumbnailUrl
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(works)
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Notion works fetch error' })
    };
  }
};