import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const result = await query(
      'UPDATE links SET total_clicks = total_clicks + 1, last_clicked_at = CURRENT_TIMESTAMP WHERE short_code = $1 RETURNING original_url',
      [code]
    );
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.redirect(result.rows[0].original_url, { status: 302 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
