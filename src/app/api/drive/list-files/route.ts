import { NextRequest, NextResponse } from 'next/server';
import { listDriveFiles } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  const folderId = request.nextUrl.searchParams.get('folderId');

  if (!folderId) {
    return NextResponse.json({ error: 'Missing folderId parameter' }, { status: 400 });
  }

  try {
    const files = await listDriveFiles(folderId);

    // Filter to only image files
    const imageFiles = files.filter(f =>
      f.mimeType.startsWith('image/') ||
      f.mimeType === 'application/pdf' ||
      f.name.match(/\.(png|jpg|jpeg|webp|svg|gif|psd|ai|pdf)$/i)
    );

    return NextResponse.json(
      { files: imageFiles },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
