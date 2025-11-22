import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isValidUrl, isValidShortCode, generateRandomShortCode } from '@/lib/validation';

export async function GET() {
  try {
    const result = await query(
      'SELECT id, short_code, original_url, created_at, total_clicks, last_clicked_at FROM links ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { originalUrl, customCode } = body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    let shortCode = customCode;

    if (!shortCode) {
      shortCode = generateRandomShortCode();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await query('SELECT 1 FROM links WHERE short_code = $1', [shortCode]);
        if (!existing.rows || existing.rows.length === 0) break;
        shortCode = generateRandomShortCode();
        attempts++;
      }
    } else {
      if (!isValidShortCode(shortCode)) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
      }
      const existing = await query('SELECT 1 FROM links WHERE short_code = $1', [shortCode]);
      if (existing.rows && existing.rows.length > 0) {
        return NextResponse.json({ error: 'Code exists' }, { status: 409 });
      }
    }

    const result = await query(
      'INSERT INTO links (short_code, original_url) VALUES ($1, $2) RETURNING id, short_code, original_url, created_at, total_clicks, last_clicked_at',
      [shortCode, originalUrl]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
