export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, organisation, email, tier, notes } = req.body;

  if (!name || !email || !organisation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DARC Certification <hello@darcstandard.org>',
        to: ['hello@darcstandard.org'],
        reply_to: email,
        subject: `New Certification Application — ${organisation}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #c9a84c;">New DARC Certification Application</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0;"><strong>${name}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Organisation</td><td style="padding: 8px 0;"><strong>${organisation}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Tier</td><td style="padding: 8px 0;">${tier || 'Not specified'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Notes</td><td style="padding: 8px 0;">${notes || '—'}</td></tr>
            </table>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
