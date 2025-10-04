export function getIgEnv() {
  const mock = process.env.MOCK_MODE === 'true';
  return {
    mock,
    appId: process.env.FB_APP_ID || '',
    appSecret: process.env.FB_APP_SECRET || '',
    userToken: process.env.FB_USER_ACCESS_TOKEN || '',
    igUserId: process.env.IG_USER_ID || '',
    version: process.env.IG_GRAPH_API_VERSION || 'v19.0',
  };
}



