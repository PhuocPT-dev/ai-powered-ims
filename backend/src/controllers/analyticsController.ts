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

    static getMonthlyStats = asyncHandler(async (req: Request, res: Response) => {
        const data = await AnalyticsService.getMonthlyStats();
        res.status(200).json({ status: "success", data });
    });

    static getTrainingStats = asyncHandler(async (req: Request, res: Response) => {
        const data = await AnalyticsService.getTrainingStats();
        res.status(200).json({ status: "success", data });
    });

    static getInternKPI = asyncHandler(async (req: Request, res: Response) => {
        const internId = req.params.id as string;
        const data = await AnalyticsService.getInternKPI(internId);
        
        const completionRate = data.total_tasks === 0 ? 0 : (data.completed_tasks / data.total_tasks) * 100;
        
        res.status(200).json({ 
            status: "success", 
            data: {
                ...data,
                completion_rate_percent: completionRate
            } 
        });
    });
} 