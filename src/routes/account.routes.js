import express from "express"
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router()

router.post("/", authMiddleware.authMiddleware)

export default router;