import { GoogleAuth } from 'google-auth-library';
import { getPersonalGoogleAccessToken } from './google-oauth';

// =====================
// Google Drive API Client
// =====================

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

let serviceAccountAuthClient: InstanceType<typeof GoogleAuth> | null = null;

async function getAuthToken(): Promise<string> {
  // 1. Prioridade: Se houver conta pessoal conectada via OAuth, usa o token da conta pessoal!
  // Isso garante que os uploads usem a cota de armazenamento da conta pessoal do usuário.
  try {
    const personal = await getPersonalGoogleAccessToken();
    if (personal?.token) {
      return personal.token;
    }
  } catch (oauthErr) {
    console.warn('Erro ao verificar token pessoal do Google, tentando Service Account:', oauthErr);
  }

  // 2. Fallback: Service Account configurada no .env.local
  if (!serviceAccountAuthClient) {
    serviceAccountAuthClient = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
  }
  const client = await serviceAccountAuthClient.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) throw new Error('Falha ao obter token de autenticação do Google Drive');
  return tokenResponse.token;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
}

/**
 * List all image/design files in a Google Drive folder
 */
export async function listDriveFiles(folderId: string): Promise<DriveFile[]> {
  const token = await getAuthToken();
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent('files(id,name,mimeType,thumbnailLink,size)');

  const response = await fetch(
    `${DRIVE_API_BASE}/files?q=${query}&fields=${fields}&orderBy=name&pageSize=200`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Drive API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return (data.files || []) as DriveFile[];
}

/**
 * Get a fresh thumbnail for a Drive file (proxied through our server)
 */
export async function getDriveFileThumbnail(
  fileId: string,
  size: number | string = 600
): Promise<{ data: Buffer; mimeType: string } | null> {
  const token = await getAuthToken();

  // Get fresh thumbnailLink
  const metaResponse = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?fields=thumbnailLink`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!metaResponse.ok) return null;
  const meta = await metaResponse.json();

  if (!meta.thumbnailLink) return null;

  // Custom thumbnail size (default is s600, or s1600 / s0 for full quality)
  const sizeParam = size === 'full' || size === '0' ? '=s0' : `=s${size}`;
  const thumbnailUrl = meta.thumbnailLink.replace(/=s\d+$/, sizeParam);

  const thumbResponse = await fetch(thumbnailUrl);
  if (!thumbResponse.ok) return null;

  const arrayBuffer = await thumbResponse.arrayBuffer();
  return { data: Buffer.from(arrayBuffer), mimeType: 'image/png' };
}

/**
 * Download a file from Google Drive
 */
export async function downloadDriveFile(fileId: string): Promise<{ data: Buffer; name: string; mimeType: string }> {
  const token = await getAuthToken();

  // Get metadata
  const metaResponse = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?fields=name,mimeType`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!metaResponse.ok) throw new Error('Failed to get file metadata');
  const meta = await metaResponse.json();

  // Download content
  const dataResponse = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!dataResponse.ok) throw new Error('Failed to download file');

  const arrayBuffer = await dataResponse.arrayBuffer();
  return { data: Buffer.from(arrayBuffer), name: meta.name, mimeType: meta.mimeType };
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(name: string, parentFolderId?: string): Promise<string> {
  const token = await getAuthToken();

  const metadata: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create folder: ${error}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Upload a file to a Google Drive folder
 */
export async function uploadFileToDrive(
  folderId: string,
  fileName: string,
  fileData: Buffer,
  mimeType: string
): Promise<{ id: string; name: string; thumbnailLink?: string }> {
  const token = await getAuthToken();

  // Use multipart upload for simplicity
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const boundary = 'boundary_' + Date.now();
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      metadata + '\r\n' +
      `--${boundary}\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    ),
    fileData,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,thumbnailLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${error}`);
  }

  const uploaded = await response.json();

  // Make the uploaded file public for direct viewing / downloading
  try {
    await makeDriveItemPublic(uploaded.id);
  } catch (permErr) {
    console.warn(`Could not set public permission on uploaded file ${uploaded.id}:`, permErr);
  }

  return uploaded;
}

/**
 * Make a Google Drive file or folder accessible by anyone with the link (reader role)
 */
export async function makeDriveItemPublic(fileOrFolderId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileOrFolderId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.warn(`Could not set public permission for ${fileOrFolderId}:`, error);
  }
}

/**
 * Delete a file or folder from Google Drive
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to delete Drive file: ${error}`);
  }
}

/**
 * Extract a Drive Folder ID from a URL or raw ID
 */
export function extractDriveFolderId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // If it's already an ID (no slashes, length >= 20)
  if (!trimmed.includes('/') && trimmed.length >= 20) {
    return trimmed;
  }

  // If it's a URL like https://drive.google.com/drive/folders/1abc...
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // If it's a URL like https://drive.google.com/open?id=1abc...
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
}

/**
 * Automatically creates the folder structure for a customization order:
 * Root Folder -> "[Client Name] - [Pack Name]" ->
 *    ├── "[Pack Name] - Feed (1080x1440)"
 *    └── "[Pack Name] - Stories (1080x1920)"
 *
 * All folders are set to public reader permission.
 */
export async function createCustomizationFolders(clientName: string, packName: string) {
  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootId) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID não está configurado nas variáveis de ambiente');
  }

  const safeClient = clientName.trim() || 'Cliente';
  const safePack = packName.trim() || 'Pack';

  // 1. Criar pasta principal do cliente
  const clientFolderName = `${safeClient} - ${safePack}`;
  const clientFolderId = await createDriveFolder(clientFolderName, rootId);
  await makeDriveItemPublic(clientFolderId);

  // 2. Criar subpasta Feed
  const feedFolderName = `${safePack} - Feed (1080x1440)`;
  const feedFolderId = await createDriveFolder(feedFolderName, clientFolderId);
  await makeDriveItemPublic(feedFolderId);

  // 3. Criar subpasta Stories
  const storiesFolderName = `${safePack} - Stories (1080x1920)`;
  const storiesFolderId = await createDriveFolder(storiesFolderName, clientFolderId);
  await makeDriveItemPublic(storiesFolderId);

  return {
    clientFolderId,
    clientFolderUrl: `https://drive.google.com/drive/folders/${clientFolderId}`,
    feedFolderId,
    feedFolderUrl: `https://drive.google.com/drive/folders/${feedFolderId}`,
    storiesFolderId,
    storiesFolderUrl: `https://drive.google.com/drive/folders/${storiesFolderId}`,
  };
}

/**
 * Automatically creates a folder for pack sample/preview arts:
 * Root Folder -> "[Pack Name] - Amostras"
 * Set to public reader permission.
 */
export async function createPackArtsFolder(packName: string): Promise<{ folderId: string; folderUrl: string }> {
  const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootId) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID não está configurado nas variáveis de ambiente');
  }

  const safePack = packName.trim() || 'Pack';
  const folderName = `${safePack} - Amostras`;
  const folderId = await createDriveFolder(folderName, rootId);
  await makeDriveItemPublic(folderId);

  return {
    folderId,
    folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
  };
}


