import { Router } from "express";
import { authMiddleware, authSystemUserMiddleware } from "../middlewares/auth.middleware.js";
import transactionController from "../controllers/transaction.controller.js";

const transactionRoutes = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

transactionRoutes.post("/", authMiddleware, transactionController.createTransaction)


/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post("/system/initial-funds", authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

export default transactionRoutes