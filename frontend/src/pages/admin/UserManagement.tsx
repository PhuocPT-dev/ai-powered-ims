import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, Key, Lock, Unlock, UserPlus, Edit3 } from "lucide-react";
import { adminApi } from "@/api/admin.api";
import { toast } from "sonner";

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    is_active: number;
    created_at: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // States for Create User
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'HR' });
    const [isCreating, setIsCreating] = useState(false);

    // States for Edit Role
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await adminApi.getAllUsers();
            if (res.status === 'success') {
                setUsers(res.data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách Người dùng!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async () => {
        if (!newUser.full_name || !newUser.email) return toast.error("Vui lòng điền đủ thông tin!");
        setIsCreating(true);
        try {
            const res = await adminApi.createUser(newUser);
            toast.success(`Tạo thành công! Mật khẩu tạm: ${res.data.tempPassword}`, { duration: 10000 });
            setIsCreateOpen(false);
            setNewUser({ full_name: '', email: '', role: 'HR' });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi tạo user!");
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleStatus = async (userId: number, currentStatus: number) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await adminApi.toggleUserStatus(userId, newStatus);
            toast.success(newStatus === 1 ? "Đã MỞ KHÓA tài khoản" : "Đã KHÓA tài khoản");
            fetchUsers();
        } catch (error) {
            toast.error("Lỗi khi cập nhật trạng thái!");
        }
    };

    const handleResetPassword = async (userId: number) => {
        if (!confirm("Bạn có chắc muốn Reset mật khẩu người này?")) return;
        try {
            const res = await adminApi.resetPassword(userId);
            toast.success(`Reset thành công! Mật khẩu mới: ${res.newPassword}`, { duration: 10000 });
        } catch (error) {
            toast.error("Lỗi khi reset mật khẩu!");
        }
    };

    const handleUpdateRole = async () => {
        if (!editingUser || !newRole) return;
        try {
            await adminApi.updateRole(editingUser.id, newRole);
            toast.success(`Đã đổi Role thành ${newRole}`);
            setIsEditRoleOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error("Lỗi khi đổi Role!");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
                <p className="text-gray-500">Đang tải danh sách User...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Quản Trị Hệ Thống (Admin Panel)
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý tài khoản, phân quyền và bảo mật</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                            <UserPlus className="h-4 w-4" /> Cấp Tài Khoản Mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo Tài Khoản Nội Bộ</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Họ và Tên</label>
                                <Input value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} placeholder="Nguyễn Văn A" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="hr@company.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phân Quyền (Role)</label>
                                <Select value={newUser.role} onValueChange={(val) => setNewUser({...newUser, role: val})}>
                                    <SelectTrigger><SelectValue placeholder="Chọn Role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HR">HR (Tuyển dụng)</SelectItem>
                                        <SelectItem value="MENTOR">Mentor (Người hướng dẫn)</SelectItem>
                                        <SelectItem value="COORDINATOR">Coordinator (Điều phối viên)</SelectItem>
                                        <SelectItem value="ADMIN">Admin (Quản trị viên)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreateUser} disabled={isCreating} className="w-full bg-red-600 hover:bg-red-700 text-white">
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Xác nhận Tạo
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Thông tin</TableHead>
                                <TableHead>Vai trò (Role)</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động bảo mật</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium text-gray-600">#{u.id}</TableCell>
                                    <TableCell>
                                        <p className="font-bold text-gray-900">{u.full_name}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-zinc-100 cursor-pointer hover:bg-zinc-200" onClick={() => { setEditingUser(u); setNewRole(u.role); setIsEditRoleOpen(true); }}>
                                            {u.role} <Edit3 className="ml-2 h-3 w-3 inline" />
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.is_active === 1 ? 'default' : 'destructive'} className={u.is_active === 1 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                                            {u.is_active === 1 ? 'Hoạt động' : 'Bị Khóa'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleToggleStatus(u.id, u.is_active)} className={u.is_active === 1 ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}>
                                            {u.is_active === 1 ? <><Lock className="h-4 w-4 mr-1"/> Khóa</> : <><Unlock className="h-4 w-4 mr-1"/> Mở</>}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleResetPassword(u.id)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                            <Key className="h-4 w-4 mr-1" /> Cấp lại Pass
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog Edit Role */}
            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chuyển Đổi Vai Trò</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-gray-600">Đổi Role cho <strong>{editingUser?.full_name}</strong> ({editingUser?.email})</p>
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger><SelectValue placeholder="Chọn Role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INTERN">INTERN (Thực tập sinh)</SelectItem>
                                <SelectItem value="HR">HR (Tuyển dụng)</SelectItem>
                                <SelectItem value="MENTOR">MENTOR (Người hướng dẫn)</SelectItem>
                                <SelectItem value="COORDINATOR">COORDINATOR (Điều phối viên)</SelectItem>
                                <SelectItem value="ADMIN">ADMIN (Quản trị viên)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleUpdateRole} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Lưu Thay Đổi</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
