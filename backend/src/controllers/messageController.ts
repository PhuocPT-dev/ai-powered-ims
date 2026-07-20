import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { MessageService } from "../service/messageService";

export class MessageController {
    // API lấy lịch sử chat
    static getChatHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
        const myId = req.user?.id;
        const partnerId = Number(req.params.partnerId);

        if (!myId) throw new AppError("Không xác định được danh tính người dùng", 401);
        if (isNaN(partnerId)) throw new AppError("ID đối tác không hợp lệ!", 400);

        const history = await MessageService.getChatHistory(myId, partnerId);
        res.status(200).json({ status: "success", data: history });
    });

    //API lấy danh bạ chat
    static getContacts = asyncHandler(async (req: AuthRequest, res: Response) => {
        const myId = req.user?.id;
        const role = req.user?.role;

        if (!myId || !role) throw new AppError("Không xác định được danh tính", 401);
        const contacts = await MessageService.getContacts(myId, role);
        res.status(200).json({ status: "success", data: contacts });
    })
}