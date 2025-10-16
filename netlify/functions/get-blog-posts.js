// netlify/functions/get-blog-posts.js
 
const fetch = require('node-fetch');
 
exports.handler = async (event, context) => {
  const { API_KEY } = process.env;
  const { SERVICE_DOMAIN } = event.queryStringParameters;
 
  // サービスドメインが指定されていない場合はエラーを返す
  if (!serviceDomain) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Service domain is required.' }),
    };
  }
 
  const url = `https://${serviceDomain}.microcms.io/api/v1/blogs`;
 
  try {
    const response = await fetch(url, {
      headers: {
        'X-MICROCMS-API-KEY': MICROCMS_API_KEY,
      },
    });
 
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch data from microCMS' }),
      };
    }
 
    const data = await response.json();
 
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
