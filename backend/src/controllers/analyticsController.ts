import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AnalyticsService } from "../service/analyticsService";

export class AnalyticsController {
    static getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await AnalyticsService.getDashboardStats();
        
        const completionRate = stats.totalTasks === 0 ? 0 : (stats.completedTasks / stats.totalTasks) * 100;

        res.json({
            status: "success",
            data: {
                total_interns: stats.totalInterns,
                tasks: {
                    total: stats.totalTasks,
                    completed: stats.completedTasks,
                    completion_rate_percent: completionRate
                },
                top_interns: stats.topInterns
            }
        });
    });
} 