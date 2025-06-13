import { createUploadthing, type FileRouter } from "uploadthing/next"; 

const f = createUploadthing();
export const ourFileRouter: FileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata);
      console.log("file url", file.url);
      return {
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;