import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jobApi } from "@/api/job.api";

// Lần này ta truyền thêm hàm refreshJobs từ ngoài vào Hộp thoại.
// Để chi? Để khi đăng tin xong, hộp thoại này gọi hàm đó, bắt cái Bảng ngoài kia phải tải lại dữ liệu mới!
export function CreateJobDialog({ refreshJobs }: { refreshJobs: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        salary: "",
        description: ""
    })

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            toast.error("Vui lòng nhập Tên công việc và Mô tả!");
            return;
        }
        setIsLoading(true);
        try {
            const response = await jobApi.createJob(formData);
            if (response.status === "success") {
                toast.success("Đang tin tuyển dunng thành công!");
                setIsOpen(false);
                setFormData({ title: "", location: "", salary: "", description: "" })
            }
            refreshJobs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi đăng tin!");
        } finally {
            setIsLoading(false);
        }
    }

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
                        {/* Dùng thẻ textarea mặc định của HTML cho nhanh */}
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
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Đang đăng..." : "Đăng Tin Ngay"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}