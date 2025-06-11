import express from "express";
import cors from "cors";
import { initTRPC } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express"

const t = initTRPC.create();

const appRouter = t.router({

})

const app = express()

app.use(cors())
app.use("/", createExpressMiddleware({ router: appRouter }))

app.listen(8080)