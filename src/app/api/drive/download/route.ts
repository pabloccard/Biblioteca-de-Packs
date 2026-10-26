import { NextRequest, NextResponse } from 'next/server';
import { downloadDriveFile, listDriveFiles } from '@/lib/google-drive';

export const maxDuration = 60;

/**
 * Download a single file or all files from folders as ZIP
 */
export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');
  const folderId = request.nextUrl.searchParams.get('folderId');
  const feedFolderId = request.nextUrl.searchParams.get('feedFolderId');
  const storiesFolderId = request.nextUrl.searchParams.get('storiesFolderId');
  const packNameParam = request.nextUrl.searchParams.get('packName');
  const zip = request.nextUrl.searchParams.get('zip');

  try {
    // Single file download
    if (fileId && !zip) {
      const file = await downloadDriveFile(fileId);
      return new NextResponse(new Uint8Array(file.data), {
        headers: {
          'Content-Type': file.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
          'Cache-Control': 'private, max-age=300',
        },
      });
    }

    // ZIP download of folders
    const isMultiFolderZip = zip === 'true' && (feedFolderId || storiesFolderId);
    const isSingleFolderZip = zip === 'true' && folderId;

    if (isMultiFolderZip || isSingleFolderZip) {
      const { Readable } = await import('stream');
      // Dynamic import of archiver supporting both v8 (ZipArchive class) and legacy functions
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const archiverModule = require('archiver');
      const archive = archiverModule.ZipArchive
        ? new archiverModule.ZipArchive({ zlib: { level: 5 } })
        : typeof archiverModule === 'function'
          ? archiverModule('zip', { zlib: { level: 5 } })
          : archiverModule.default('zip', { zlib: { level: 5 } });

      const safePackName = packNameParam
        ? packNameParam.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-')
        : 'artes';
      const zipFilename = `${safePackName}-personalizado.zip`;

      // Helper to batch download files in parallel
      async function addFolderFilesToArchive(
        targetFolderId: string,
        archivePathPrefix: string = ''
      ) {
        try {
          const files = await listDriveFiles(targetFolderId);
          // Only image files or documents
          const validFiles = files.filter(f =>
            f.mimeType?.startsWith('image/') ||
            f.mimeType === 'application/pdf' ||
            f.name?.match(/\.(png|jpg|jpeg|webp|svg|gif|psd|ai|pdf)$/i)
          );

          // Batch downloading in parallel batches of 6
          const batchSize = 6;
          for (let i = 0; i < validFiles.length; i += batchSize) {
            const batch = validFiles.slice(i, i + batchSize);
            const results = await Promise.allSettled(
              batch.map(file => downloadDriveFile(file.id))
            );

            for (const res of results) {
              if (res.status === 'fulfilled') {
                const downloaded = res.value;
                const entryName = archivePathPrefix
                  ? `${archivePathPrefix}/${downloaded.name}`
                  : downloaded.name;
                archive.append(Buffer.from(downloaded.data), { name: entryName });
              }
            }
          }
        } catch (err) {
          console.error(`Error archiving folder ${targetFolderId}:`, err);
        }
      }

      // Convert archive to progressive Web ReadableStream
      const webStream = Readable.toWeb(archive as any);

      // Execute background archiving into the stream
      (async () => {
        try {
          if (feedFolderId && storiesFolderId) {
            await Promise.all([
              addFolderFilesToArchive(feedFolderId, 'Feed (1080x1440)'),
              addFolderFilesToArchive(storiesFolderId, 'Stories (1080x1920)'),
            ]);
          } else if (feedFolderId) {
            await addFolderFilesToArchive(feedFolderId, 'Feed (1080x1440)');
          } else if (storiesFolderId) {
            await addFolderFilesToArchive(storiesFolderId, 'Stories (1080x1920)');
          } else if (folderId) {
            await addFolderFilesToArchive(folderId, '');
          }
          await archive.finalize();
        } catch (streamErr) {
          console.error('Error during streaming zip generation:', streamErr);
          try {
            archive.abort();
          } catch {
            // ignore
          }
        }
      })();

      return new Response(webStream as any, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${zipFilename}"`,
          'Cache-Control': 'private, no-cache',
        },
      });
    }

    return NextResponse.json({ error: 'Missing fileId, folderId or feed/storiesFolderId parameter' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
