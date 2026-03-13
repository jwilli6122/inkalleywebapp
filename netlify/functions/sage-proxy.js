const https = require('https');

const SAGE_ENDPOINT_HOST = 'www.promoplace.com';
const SAGE_ENDPOINT_PATH = '/ws/ws.dll/ConnectAPI';
const SAGE_ACCT  = 256432;
const SAGE_LOGIN = 'JacobWilliams';
const SAGE_KEY   = '467b867cecf0dd6e2aaba25543aeafe9';

function httpsPost(host, path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: host,
      path:     path,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Accept':         'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

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
    const result = await httpsPost(SAGE_ENDPOINT_HOST, SAGE_ENDPOINT_PATH, payload);
    return {
      statusCode: result.status,
      headers: { 'Content-Type': 'application/json' },
      body: result.body
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
};
