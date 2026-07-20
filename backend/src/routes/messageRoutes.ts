import { Router } from "express";
import { MessageController } from "../controllers/messageController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

//API lấy danh bạ chat
router.get("/contacts", authenticateJWT, MessageController.getContacts);

// API lấy lịch sử chat
router.get("/history/:partnerId", authenticateJWT, MessageController.getChatHistory);

export default router;
