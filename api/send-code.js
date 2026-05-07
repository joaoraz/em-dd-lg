export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { nome, empresa, email, cargo, telefone, segmento, entregas, code } = req.body;

    if (!email || !nome || !code) {
      return res.status(400).json({ error: 'nome, email e code são obrigatórios' });
    }

    const RESEND_KEY = process.env.RESEND_API_KEY;
    const NOTIFY_TO = process.env.NOTIFY_EMAIL || 'comercial@emiteai.com.br';
    const FROM = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const DASH_URL = process.env.DASHBOARD_URL || 'https://em-dd-lg.vercel.app/dashboard.html';
    const firstName = nome.split(' ')[0];

    // ── EMAIL PRO LEAD ──
    const leadEmail = {
      from: FROM,
      to: [email],
      subject: `${code} — Seu acesso ao Raio-X da Logística Brasileira`,
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F7F6FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6FB;padding:32px 16px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#1E1B4B 0%,#4338CA 100%);padding:36px 32px;border-radius:16px 16px 0 0;text-align:center">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <!-- Pink cube icon -->
      <div style="width:48px;height:48px;margin:0 auto 16px;background:#F472B6;border-radius:10px;transform:rotate(45deg)"></div>
      <h1 style="color:#FFFFFF;font-size:20px;font-weight:800;margin:0;letter-spacing:-0.02em">Raio-X da Logística Brasileira</h1>
      <p style="color:#C4BDE8;font-size:13px;margin:8px 0 0;font-weight:500">Seu código de acesso exclusivo</p>
    </td></tr></table>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#FFFFFF;padding:36px 32px">
    <p style="font-size:16px;color:#1E1B4B;line-height:1.6;margin:0">
      Olá, <strong>${firstName}</strong>!
    </p>
    <p style="font-size:14px;color:#4B4580;line-height:1.7;margin:16px 0 0">
      O dashboard interativo com dados de frota, transportadores, e-commerce, custos de frete e oportunidade de digitalização no Brasil está pronto para você.
    </p>

    <!-- CODE BOX -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0">
    <tr><td style="background:#F7F6FB;border:2px dashed #E5E2F0;border-radius:12px;padding:24px;text-align:center">
      <p style="font-size:11px;font-weight:700;color:#8B85B1;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Código de acesso</p>
      <p style="font-size:32px;font-weight:800;color:#4338CA;letter-spacing:0.15em;font-family:'Courier New',monospace;margin:0">${code}</p>
      <p style="font-size:12px;color:#8B85B1;margin:8px 0 0">Vinculado a: ${email}</p>
    </td></tr>
    </table>

    <!-- CTA BUTTON -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:8px 0 24px">
      <a href="${DASH_URL}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#4338CA,#7C3AED);color:#FFFFFF;text-decoration:none;border-radius:28px;font-weight:700;font-size:15px">
        Abrir o Dashboard →
      </a>
    </td></tr>
    </table>

    <!-- INSTRUCTIONS -->
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="background:#FDF2F8;border:1px solid #FBCFE8;border-radius:8px;padding:16px 20px">
      <p style="font-size:13px;color:#4B4580;line-height:1.7;margin:0">
        <strong style="color:#4338CA">Como acessar:</strong><br>
        1. Clique no botão acima<br>
        2. Informe seu <strong>e-mail</strong> e o <strong>código acima</strong><br>
        3. Explore o dashboard completo
      </p>
    </td></tr>
    </table>

    <p style="font-size:12px;color:#8B85B1;margin:24px 0 0;text-align:center;line-height:1.6">
      Guarde este e-mail — você vai precisar do código para acessar novamente.
    </p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#F7F6FB;padding:24px 32px;border-radius:0 0 16px 16px;text-align:center">
    <p style="font-size:11px;color:#8B85B1;margin:0;line-height:1.6">
      Fontes: ANTT · ABComm · Edenred IFR · ANP · Receita Federal · SENATRAN · CNT<br>
      Dados públicos agregados · Abril 2026
    </p>
    <p style="font-size:11px;color:#8B85B1;margin:12px 0 0">
      © 2026 <strong>Emiteaí</strong> — Plataforma de Gestão de Transporte<br>
      <a href="https://emiteai.com.br" style="color:#4338CA;text-decoration:none">emiteai.com.br</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`,
    };

    // ── EMAIL PRO TIME COMERCIAL ──
    const notifyEmail = {
      from: FROM,
      to: [NOTIFY_TO],
      subject: `[Lead Raio-X] ${nome} — ${empresa}`,
      html: `
<body style="font-family:-apple-system,sans-serif;margin:0;padding:0;background:#F7F6FB">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#F7F6FB">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden">
  <tr><td style="background:#1E1B4B;padding:20px 24px">
    <h2 style="color:#FFFFFF;font-size:16px;margin:0;font-weight:700">Novo lead — Raio-X da Logística</h2>
  </td></tr>
  <tr><td style="padding:24px">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
      <tr><td style="padding:8px 0;color:#8B85B1;width:110px">Nome</td><td style="padding:8px 0;color:#1E1B4B;font-weight:600">${nome}</td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">Empresa</td><td style="padding:8px 0;color:#1E1B4B;font-weight:600">${empresa}</td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">Cargo</td><td style="padding:8px 0;color:#1E1B4B">${cargo || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">E-mail</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#4338CA">${email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">Telefone</td><td style="padding:8px 0;color:#1E1B4B">${telefone || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">Segmento</td><td style="padding:8px 0;color:#1E1B4B">${segmento || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">Entregas/mês</td><td style="padding:8px 0;color:#1E1B4B">${entregas || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">Código</td><td style="padding:8px 0;color:#4338CA;font-weight:700;font-family:monospace;letter-spacing:0.1em">${code}</td></tr>
      <tr><td style="padding:8px 0;color:#8B85B1">Data</td><td style="padding:8px 0;color:#1E1B4B">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body>`,
    };

    // Send both emails
    const results = await Promise.allSettled([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(leadEmail),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(notifyEmail),
      }),
    ]);

    const leadResult = results[0].status === 'fulfilled' ? await results[0].value.json() : { error: results[0].reason };

    return res.status(200).json({ ok: true, emailId: leadResult.id || null });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
