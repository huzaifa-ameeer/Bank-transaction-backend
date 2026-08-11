import express from "express"
import authController from "../controllers/auth.controller.js"

const router = express.Router()


/* POST /api/auth/register */
router.post("/register", authController.userRegister)


/* POST /api/auth/login */
router.post("/login", authController.userLogin)

/**
 * - POST /api/auth/logout
 */
router.post("/logout", authController.userLogout)



export default router