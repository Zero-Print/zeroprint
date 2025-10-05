import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filename = body?.filename || `export_${Date.now()}.csv`;
    const rows: string[][] = body?.rows || [["id","value"],["1","100"]];
    const csv = rows.map(r => r.map(v => String(v).replace(/"/g,'""')).join(',')).join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to generate CSV' }, { status: 500 });
  }
}


