/** Escapes user-provided text before it is placed in an email body. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** A link styled as a button. `url` must come from our own config, never from user input. */
export function emailButton(label: string, url: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#c93a1e;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">${escapeHtml(label)}</a></p>`;
}

/** Shared wrapper so every email looks the same. `bodyHtml` must already be safe HTML. */
export function emailLayout(appName: string, title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f1e7;font-family:Helvetica,Arial,sans-serif;color:#1a1714;line-height:1.5">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:2px solid #1a1714;border-radius:12px;padding:32px">
      <h1 style="font-size:22px;margin:0 0 16px">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <p style="text-align:center;color:#5c554d;font-size:12px;margin-top:16px">Sent by ${escapeHtml(appName)}</p>
  </body>
</html>`;
}
