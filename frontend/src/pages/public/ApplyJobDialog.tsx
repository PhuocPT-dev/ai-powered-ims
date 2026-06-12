import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jobApi } from "@/api/job.api";

export function ApplyJobDialog({ job }: { job: any }) {
    const [cvLink, setCvLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {
        if (!cvLink) {
            toast.error("Khoan đã, bạn quên chưa dán link cv kìa!");
            return
        }
        setIsSubmitting(true)
        try {
            const response = await jobApi.applyJob(job.id, cvLink)
            if (response.status === 'success') {
                toast.success(response.message || "Nộp CV thành công")
                setIsOpen(false)
                setCvLink("")
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message;
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("Bạn phải Đăng nhập bằng tài khoản Ứng viên (CANDIDATE) thì mới được nộp CV!");
            } else {
                toast.error(errorMessage || "Lỗi khi nộp CV!")
            }
        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} >
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors mt-auto">
                    Xem chi tiết & Ứng tuyển
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ứng tuyển: {job.title}</DialogTitle>
                    <DialogDescription>
                        Điền đường link CV (PDF) để Giám đốc AI của chúng tôi phân tích nhé.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cvLink">Đường link CV (Google Drive)</Label>
                        <Input
                            id="cvLink"
                            placeholder="Dán link CV công khai vào đây..."
                            value={cvLink}
                            onChange={(e) => setCvLink(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">*Đảm bảo link đã được cấp quyền "Bất kỳ ai có liên kết đều có thể xem".</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang gửi và đợi AI chấm..." : "Nộp Hồ Sơ Ngay"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}