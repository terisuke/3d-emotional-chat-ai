import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const calendarUrl = process.env.VITE_GOOGLE_CALENDAR_ICAL_URL || process.env.GOOGLE_CALENDAR_ICAL_URL;

  if (!calendarUrl) {
    res.status(400).json({ error: 'Calendar URL not configured' });
    return;
  }

  try {
    const response = await fetch(calendarUrl);
    
    if (!response.ok) {
      throw new Error(`Calendar fetch failed: ${response.status}`);
    }

    const icalData = await response.text();
    
    res.setHeader('Content-Type', 'text/calendar');
    res.status(200).send(icalData);

  } catch (error) {
    console.error('Calendar proxy error:', error);
    const message = (error instanceof Error && error.message) ? error.message : "Unknown error";
    res.status(500).json({ error: `Calendar service error: ${message}` });
  }
}