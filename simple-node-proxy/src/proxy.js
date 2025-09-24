import fetch from 'node-fetch';
import { rewriteHtml } from './utils.js';
import { URL } from 'url';

export async function proxyHandler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type') || '';

    // HTML の場合は書き換え、それ以外はそのまま転送
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const rewritten = rewriteHtml(html, targetUrl);
      res.setHeader('Content-Type', 'text/html');
      res.send(rewritten);
    } else {
      // 画像・CSS・JSなどはそのままpipe
      res.setHeader('Content-Type', contentType);
      response.body.pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching the target URL.');
  }
}
