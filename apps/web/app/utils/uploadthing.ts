import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { OurFileRouter } from "~/app/api/uploadthing/core";

type UploadButtonComponent = ReturnType<
  typeof generateUploadButton<OurFileRouter>
>;
type UploadDropzoneComponent = ReturnType<
  typeof generateUploadDropzone<OurFileRouter>
>;

export const UploadButton: UploadButtonComponent =
  generateUploadButton<OurFileRouter>();

export const UploadDropzone: UploadDropzoneComponent =
  generateUploadDropzone<OurFileRouter>();
