'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Clock, MessageSquare, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    assignee: string;
    comments: number;
    attachments: number;
    dueDate: string;
}

interface Column {
    title: string;
    items: Task[];
}

interface Columns {
    [key: string]: Column;
}

const initialColumns: Columns = {
    todo: {
        title: 'To Do',
        items: [
            {
                id: '1',
                title: 'Design System Updates',
                description: 'Update the design system with new components',
                priority: 'High',
                assignee: 'Sarah Chen',
                comments: 3,
                attachments: 2,
                dueDate: '2 days',
            },
            {
                id: '2',
                title: 'API Documentation',
                description: 'Write documentation for the new API endpoints',
                priority: 'Medium',
                assignee: 'Mike Wilson',
                comments: 1,
                attachments: 0,
                dueDate: '3 days',
            },
        ],
    },
    inProgress: {
        title: 'In Progress',
        items: [
            {
                id: '3',
                title: 'User Authentication',
                description: 'Implement OAuth2 authentication flow',
                priority: 'High',
                assignee: 'John Smith',
                comments: 5,
                attachments: 1,
                dueDate: '1 day',
            },
        ],
    },
    review: {
        title: 'Review',
        items: [
            {
                id: '4',
                title: 'Dashboard Analytics',
                description: 'Add analytics charts to the dashboard',
                priority: 'Medium',
                assignee: 'Anna Johnson',
                comments: 2,
                attachments: 3,
                dueDate: 'Today',
            },
        ],
    },
    done: {
        title: 'Done',
        items: [
            {
                id: '5',
                title: 'Email Templates',
                description: 'Create email templates for notifications',
                priority: 'Low',
                assignee: 'Tom Brown',
                comments: 4,
                attachments: 1,
                dueDate: 'Completed',
            },
        ],
    },
};

export default function ProjectsPage() {
    const [columns, setColumns] = useState<Columns>(initialColumns);
    const [draggingItem, setDraggingItem] = useState<Task | null>(null);
    const [draggingColumn, setDraggingColumn] = useState<string | null>(null);

    const handleDragStart = (item: Task, columnId: string) => {
        setDraggingItem(item);
        setDraggingColumn(columnId);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (!draggingItem || !draggingColumn || draggingColumn === columnId) return;

        const newColumns = { ...columns };
        const sourceItems = [...newColumns[draggingColumn].items];
        const destItems = [...newColumns[columnId].items];

        const [removedItem] = sourceItems.splice(
            sourceItems.findIndex((item) => item.id === draggingItem.id),
            1
        );
        destItems.push(removedItem);

        newColumns[draggingColumn].items = sourceItems;
        newColumns[columnId].items = destItems;

        setColumns(newColumns);
        setDraggingColumn(columnId);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Project Board</h1>
                    <p className="text-sm text-gray-500">Manage and track your project tasks.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus size={18} />
                    Add Task
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
                {Object.entries(columns).map(([columnId, column]) => (
                    <div
                        key={columnId}
                        className="flex-shrink-0 w-72 bg-gray-50 rounded-lg border border-gray-200"
                        onDragOver={(e) => handleDragOver(e, columnId)}
                    >
                        <div className="p-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">{column.title}</h3>
                                <span className="text-sm text-gray-500">{column.items.length}</span>
                            </div>
                        </div>
                        <div className="p-2 space-y-2">
                            {column.items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    draggable
                                    onDragStart={() => handleDragStart(item, columnId)}
                                    className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                                        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Clock size={12} />
                                            <span className="text-xs">{item.dueDate}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <MessageSquare size={12} />
                                            <span className="text-xs">{item.comments}</span>
                                        </div>
                                        {item.attachments > 0 && (
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Paperclip size={12} />
                                                <span className="text-xs">{item.attachments}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                                {item.assignee.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs text-gray-500 truncate max-w-[100px]">{item.assignee}</span>
                                        </div>
                                        <span
                                            className={`text-xs px-1.5 py-0.5 rounded-full ${item.priority === 'High'
                                                ? 'bg-red-100 text-red-700'
                                                : item.priority === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {item.priority}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 