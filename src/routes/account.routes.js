import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import accountController from "../controllers/account.controller.js"


const router = express.Router()



/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */
router.post("/", authMiddleware, accountController.createAccount)


/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/", authMiddleware, accountController.getUserAccounts)


/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", authMiddleware, accountController.getAccountBalance)



export default router