import { NextRequest, NextResponse } from 'next/server';
import { createDriveFolder, uploadFileToDrive } from '@/lib/google-drive';

export const maxDuration = 60;

/**
 * Upload files to Google Drive (used by admin to upload personalized arts)
 * Automatically creates a subfolder inside the configured root folder.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folderId = formData.get('folderId') as string | null;
    const folderName = formData.get('folderName') as string | null;
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Use provided folder or create a new one inside the root folder
    let targetFolderId = folderId;
    if (!targetFolderId) {
      const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || undefined;
      const name = folderName || `Entrega_${Date.now()}`;
      targetFolderId = await createDriveFolder(name, rootFolderId);
    }

    const uploadedFiles = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadFileToDrive(
        targetFolderId,
        file.name,
        buffer,
        file.type || 'application/octet-stream'
      );
      uploadedFiles.push(result);
    }

    // Revalidar cache de artes
    try {
      const { revalidateTag } = await import('next/cache')
      revalidateTag('drive-arts', 'default')
    } catch (e) {
      // Ignora erro se não estiver em contexto de cache
    }

    return NextResponse.json({
      folderId: targetFolderId,
      files: uploadedFiles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
