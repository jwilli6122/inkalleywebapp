const SAGE_ENDPOINT = 'https://www.promoplace.com/ws/ws.dll/ConnectAPI';
const SAGE_ACCT  = 256432;
const SAGE_LOGIN = 'JacobWilliams';
const SAGE_KEY   = '467b867cecf0dd6e2aaba25543aeafe9';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Inject SAGE auth credentials server-side
  const payload = {
    acctId:  SAGE_ACCT,
    loginId: SAGE_LOGIN,
    key:     SAGE_KEY,
    ...body
  };

  try {
    const res = await fetch(SAGE_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
};
