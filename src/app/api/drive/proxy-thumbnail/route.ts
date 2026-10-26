import { NextRequest, NextResponse } from 'next/server';
import { getCachedDriveThumbnailBuffer } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');
  const size = request.nextUrl.searchParams.get('size') || '600';

  if (!fileId) {
    return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
  }

  try {
    const thumbnail = await getCachedDriveThumbnailBuffer(fileId, size);

    if (!thumbnail) {
      // Return a placeholder SVG if no thumbnail is available
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#1a1a2e"/>
        <text x="200" y="200" text-anchor="middle" fill="#555" font-size="48">🎨</text>
      </svg>`;
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    return new NextResponse(new Uint8Array(thumbnail.data), {
      headers: {
        'Content-Type': thumbnail.mimeType,
        'Cache-Control': 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=5184000',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load thumbnail' }, { status: 500 });
  }
}
