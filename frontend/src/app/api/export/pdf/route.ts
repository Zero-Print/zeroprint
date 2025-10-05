import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filename = body?.filename || `report_${Date.now()}.pdf`;
    const title = body?.title || 'ZeroPrint Report';
    const summary = body?.summary || 'This is a mock PDF report.';

    // Simple PDF bytes (very minimal content for download testing)
    const content = `%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Count 1 /Kids [3 0 R] >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj\n4 0 obj<< /Length 70 >>stream\nBT /F1 18 Tf 72 720 Td (${title}) Tj T* /F1 12 Tf (${summary}) Tj ET\nendstream\nendobj\n5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000063 00000 n \n0000000126 00000 n \n0000000223 00000 n \n0000000375 00000 n \ntrailer<< /Size 6 /Root 1 0 R >>\nstartxref\n480\n%%EOF`;
    const bytes = new TextEncoder().encode(content);

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 });
  }
}


