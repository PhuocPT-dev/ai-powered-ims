import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { messageApi, type Contact, type Message } from "../api/message.api";
import { io, Socket } from "socket.io-client";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ChatPage() {
    const { user } = useAuthStore();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [activeContact, setActiveContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoadingContacts, setIsLoadingContacts] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // 1. Tạo ref lưu activeContact mới nhất chống lỗi closure trong listener socket
    const activeContactRef = useRef<Contact | null>(null);

    // Cập nhật ref mỗi khi activeContact thay đổi
    useEffect(() => {
        activeContactRef.current = activeContact;
    }, [activeContact]);

    // 2. Tải danh sách liên hệ (Danh bạ)
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await messageApi.getContacts();
                if (res.status === "success") {
                    setContacts(res.data);
                }
            } catch (error) {
                toast.error("Không thể tải danh sách liên hệ!");
            } finally {
                setIsLoadingContacts(false);
            }
        };
        fetchContacts();
    }, []);

    // 3. Thiết lập kết nối Socket.io duy nhất (chỉ kết nối lại khi User thay đổi)
    useEffect(() => {
        if (!user) return;

        // Kết nối tới Socket Server ở cổng 5000 kèm Token xác thực JWT
        const token = useAuthStore.getState().token;
        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
        const socket = io(socketUrl, {
            withCredentials: true,
            auth: { token }
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("🔌 Đã kết nối WebSockets!");
        });

        // Lắng nghe sự kiện nhận tin nhắn mới từ Server gửi về
        socket.on("receive_message", (newMessage: Message) => {
            // Đọc đối tác chat hiện tại từ ref.current thay vì state để tránh closure bug
            const currentActiveContact = activeContactRef.current;

            setMessages((prev) => {
                const isFromActiveContact =
                    (newMessage.sender_id === currentActiveContact?.id && newMessage.receiver_id === user.id) ||
                    (newMessage.sender_id === user.id && newMessage.receiver_id === currentActiveContact?.id);

                if (isFromActiveContact) {
                    // Tránh trùng lặp tin nhắn do tự gửi nhận
                    if (prev.some(msg => msg.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                }
                return prev;
            });
        });

        return () => {
            console.log("🔌 Đóng kết nối WebSockets");
            socket.disconnect();

        };
    }, [user]); // 👈 Chỉ phụ thuộc vào user, không reconnect khi đổi đối tác chat

    // 4. Tải lịch sử chat khi chọn một người cụ thể trong danh bạ
    useEffect(() => {
        if (!activeContact) return;

        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const res = await messageApi.getChatHistory(activeContact.id);
                if (res.status === "success") {
                    setMessages(res.data);
                }
            } catch (error) {
                toast.error("Lỗi khi tải lịch sử tin nhắn!");
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [activeContact]);

    // 5. Cuộn khung chat xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 6. Gửi tin nhắn qua Socket
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeContact || !socketRef.current || !user) return;

        const payload = {
            receiver_id: activeContact.id,
            content: inputText.trim()
        };

        // Bắn sự kiện lên Socket Server để lưu DB và chuyển tiếp
        socketRef.current.emit("send_message", payload);
        setInputText("");
    };

    if (isLoadingContacts) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">Đang tải danh bạ trò chuyện...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">

            {/* CỘT TRÁI: DANH BẠ LIÊN HỆ */}
            <div className="w-80 border-r flex flex-col bg-gray-50">
                <div className="p-4 border-b bg-white">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        Danh Bạ Liên Lạc
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {contacts.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center p-4">Không tìm thấy liên hệ nào.</p>
                    ) : (
                        contacts.map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContact(contact)}
                                className={`w-full text-left p-3 rounded-lg flex flex-col transition-colors ${activeContact?.id === contact.id
                                    ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 text-sm">{contact.full_name}</span>
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                        {contact.role}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 truncate mt-0.5">{contact.email}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: KHUNG CHAT */}
            <div className="flex-1 flex flex-col bg-white">
                {activeContact ? (
                    <>
                        {/* Thanh thông tin người đang chat */}
                        <div className="p-4 border-b flex items-center justify-between shadow-sm bg-gray-50">
                            <div>
                                <h4 className="font-bold text-gray-800">{activeContact.full_name}</h4>
                                <p className="text-xs text-gray-500">Vai trò: {activeContact.role} | {activeContact.email}</p>
                            </div>
                        </div>

                        {/* Vùng hiển thị nội dung tin nhắn */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-100/50">
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <MessageSquare className="h-12 w-12 opacity-30 mb-2" />
                                    <p className="italic text-sm">Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                                }`}>
                                                <p className="break-words leading-relaxed">{msg.content}</p>
                                                <span className={`block text-[10px] text-right mt-1 opacity-70 ${isMe ? "text-blue-100" : "text-gray-400"
                                                    }`}>
                                                    {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Ô nhập tin nhắn */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2 bg-white">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                        <MessageSquare className="h-16 w-16 opacity-20 mb-3" />
                        <h4 className="font-bold text-gray-700">Trò chuyện trực tiếp</h4>
                        <p className="text-sm mt-1 max-w-sm text-center">Hãy chọn một người liên hệ từ danh sách bên trái để bắt đầu cuộc trò chuyện.</p>
                    </div>
                )}
            </div>
        </div>
    );
}