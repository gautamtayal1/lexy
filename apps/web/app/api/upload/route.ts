import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getAuth } from "@clerk/nextjs/server";

export const runtime = "edge";

// Configure DO Spaces client
const s3Client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadResults = [];

    for (const file of files) {
      // Validate file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is 4MB.` 
        }, { status: 400 });
      }

      // Validate file type (images only for now)
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: `File ${file.name} is not an image.` 
        }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `uploads/${userId}/${crypto.randomUUID()}-${file.name}`;

      try {
        const result = await s3Client.send(new PutObjectCommand({
          Bucket: process.env.DO_SPACES_BUCKET!,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          ACL: 'public-read',
        }));

        const fileUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileName}`;

        uploadResults.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          key: fileName,
        });

      } catch (error) {
        console.error('Failed to upload file to DO Spaces:', error);
        return NextResponse.json({ 
          error: `Failed to upload ${file.name}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ files: uploadResults });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
} 