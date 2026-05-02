import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary env vars are missing');
  }

  return { cloudName, apiKey, apiSecret };
}

export async function POST(request: Request) {
  try {
    const session = (await cookies()).get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { folder } = await request.json().catch(() => ({ folder: undefined }));
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const uploadFolder = typeof folder === 'string' && folder.trim() ? folder.trim() : 'diadiemhot/blog';
    const paramsToSign = `folder=${uploadFolder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      folder: uploadFolder,
      signature,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Cloudinary signature failed' }, { status: 500 });
  }
}
