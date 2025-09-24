import fetch from 'node-fetch';
import { rewriteHtml } from './utils.js';
import { URL } from 'url';

export async function proxyHandler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  const options = {
    method: req.method, // GETまたはPOST
    headers: req.headers, // クライアントから送られたヘッダを転送
    body: req.method === 'POST' ? req.body : null, // POSTリクエストの場合はbodyを転送
  };

  try {
    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const html = await response.text();
      const rewritten = rewriteHtml(html, targetUrl);
      res.setHeader('Content-Type', 'text/html');
      res.send(rewritten);
    } else {
      res.setHeader('Content-Type', contentType);
      response.body.pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching the target URL.');
  }
}
