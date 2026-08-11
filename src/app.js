import express from "express";
import authRouter from "./routes/auth.route.js"
import accountRouter from "./routes/account.routes.js"
import cookieParser from "cookie-parser";
import transactionRouter from "./routes/transaction.route.js"

const app = express();

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter)
app.use("/api/transaction", transactionRouter)

app.get("/", (req, res) => {
    res.send("Ledger Service is up and running")
})

export default app;
