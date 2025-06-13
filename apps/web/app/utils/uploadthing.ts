import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type UploadButtonComponent = ReturnType<
  typeof generateUploadButton<OurFileRouter>
>;

export const UploadButton: UploadButtonComponent =
  generateUploadButton<OurFileRouter>();

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();