import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, type Task } from '../../api/task.api';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

const COLUMNS = [
    { id: 'TODO', title: 'CẦN LÀM', dotColor: 'bg-red-500', bgColor: 'bg-gray-200 border-gray-300', titleColor: 'text-gray-700' },
    { id: 'IN_PROGRESS', title: 'ĐANG LÀM', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50 border-blue-200', titleColor: 'text-blue-700' },
    { id: 'DONE', title: 'CHỜ CHẤM ĐIỂM', dotColor: 'bg-green-500', bgColor: 'bg-green-50 border-green-200', titleColor: 'text-green-700' },
    { id: 'EVALUATED', title: 'ĐÃ CHẤM ĐIỂM', dotColor: 'bg-purple-500', bgColor: 'bg-purple-50 border-purple-200', titleColor: 'text-purple-700' }
];

export default function TaskBoard() {
    const queryClient = useQueryClient();

    // 1. Dùng useQuery lấy danh sách Task của Intern (thay thế useState + useEffect fetchTasks)
    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ['my-tasks'],
        queryFn: async () => {
            const res = await taskApi.getMyTasks();
            return res.data;
        }
    });

    // 2. Mutation cập nhật trạng thái khi kéo thả Kanban
    const updateStatusMutation = useMutation({
        mutationFn: ({ taskId, newStatus }: { taskId: number; newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE' }) =>
            taskApi.updateStatus(taskId, newStatus),
        onSuccess: () => {
            toast.success("Đã báo cáo tiến độ thành công!");
            // Cập nhật lại dữ liệu Kanban từ server
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
            // Tải lại dữ liệu ban đầu nếu bị lỗi
            queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
        }
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // Nếu thả ra ngoài cột, hoặc thả lại vị trí cũ
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskId = Number(draggableId);
        const newStatus = destination.droppableId;

        // Không cho phép kéo vào EVALUATED hoặc kéo từ EVALUATED đi
        if (newStatus === 'EVALUATED' || source.droppableId === 'EVALUATED') {
            toast.error("Không thể thay đổi trạng thái của Task đã chấm điểm!");
            return;
        }

        // Kích hoạt mutation gửi trạng thái mới lên server
        updateStatusMutation.mutate({
            taskId,
            newStatus: newStatus as 'TODO' | 'IN_PROGRESS' | 'DONE'
        });
    };

    const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500 font-medium">Đang tải bảng công việc...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">📌 Bảng Công Việc (Kanban Board)</h1>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {COLUMNS.map(col => {
                        const colTasks = getTasksByStatus(col.id);
                        const isDroppable = col.id !== 'EVALUATED'; // Không cho thả vào EVALUATED

                        return (
                            <Droppable key={col.id} droppableId={col.id} isDropDisabled={!isDroppable}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`${col.bgColor} rounded-xl p-4 min-h-[500px] border transition-colors ${
                                            snapshot.isDraggingOver ? 'ring-2 ring-indigo-400 opacity-90' : ''
                                        }`}
                                    >
                                        <h2 className={`font-bold ${col.titleColor} mb-4 flex items-center gap-2`}>
                                            <span className={`w-3 h-3 ${col.dotColor} rounded-full`}></span> 
                                            {col.title} ({colTasks.length})
                                        </h2>
                                        
                                        <div className="space-y-4">
                                            {colTasks.map((task, index) => {
                                                const isDraggable = task.status !== 'EVALUATED';
                                                
                                                return (
                                                    <Draggable key={task.id} draggableId={String(task.id)} index={index} isDragDisabled={!isDraggable}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all ${
                                                                    snapshot.isDragging ? 'shadow-xl scale-105 rotate-2 z-50 ring-1 ring-indigo-300' : 'hover:shadow-md'
                                                                } ${!isDraggable ? 'opacity-80 cursor-not-allowed' : ''}`}
                                                            >
                                                                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                                                
                                                                {task.status === 'TODO' && (
                                                                    <p className="text-xs text-red-500 mt-3 font-medium">Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}</p>
                                                                )}
                                                                
                                                                {task.status === 'DONE' && (
                                                                    <span className="inline-block mt-3 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                                                        Đang chờ Mentor chấm ⏳
                                                                    </span>
                                                                )}

                                                                {task.status === 'EVALUATED' && (
                                                                    <div className="mt-3 p-2 bg-gray-50 rounded border flex justify-between items-center">
                                                                        <span className="text-sm font-medium text-gray-600">Điểm số:</span>
                                                                        <span className={`text-xl font-bold ${task.score && task.score >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                                                                            {task.score}/100
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
