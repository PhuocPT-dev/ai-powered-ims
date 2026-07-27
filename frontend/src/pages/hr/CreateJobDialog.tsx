import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jobApi } from "@/api/job.api";

export function CreateJobDialog({ refreshJobs }: { refreshJobs?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        salary: "",
        description: ""
    });

    // 1. Dùng useMutation để xử lý hành động Tạo tin tuyển dụng mới (POST API)
    const createJobMutation = useMutation({
        mutationFn: (data: typeof formData) => jobApi.createJob(data),
        onSuccess: (response) => {
            if (response.status === "success") {
                toast.success("Đăng tin tuyển dụng thành công!");
                setIsOpen(false);
                setFormData({ title: "", location: "", salary: "", description: "" });
            }
            // Tự động làm mới cache danh sách việc làm 'jobs'
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            if (refreshJobs) refreshJobs();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi đăng tin!");
        }
    });

    const handleSubmit = () => {
        if (!formData.title || !formData.description) {
            toast.error("Vui lòng nhập Tên công việc và Mô tả!");
            return;
        }
        createJobMutation.mutate(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    + Đăng Tin Mới
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Đăng Tin Tuyển Dụng</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin chi tiết để tìm kiếm ứng viên tài năng.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Tên Công Việc (*)</Label>
                        <Input
                            placeholder="Vd: Backend Developer Intern"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Địa Điểm</Label>
                            <Input
                                placeholder="Vd: Hà Nội"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Mức Lương</Label>
                            <Input
                                placeholder="Vd: 3000000"
                                type="number"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Mô Tả Chi Tiết (*)</Label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Yêu cầu công việc, quyền lợi..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white" 
                        onClick={handleSubmit} 
                        disabled={createJobMutation.isPending}
                    >
                        {createJobMutation.isPending ? "Đang đăng..." : "Đăng Tin Ngay"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}