import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    logLevel: "Debug",
    callbackUrl: "http://localhost:3000/api/uploadthing?slug=imageUploader",
  },
});
