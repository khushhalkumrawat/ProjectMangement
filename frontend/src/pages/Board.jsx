import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, Calendar, Paperclip, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/Modal';
import socketService from '../services/socket';
import CardModal from '../components/CardModal';

// --- Components ---

const Card = ({ card, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: card._id, data: { type: 'Card', card } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(card)}
            className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 cursor-pointer hover:shadow-md transition-all group ${isDragging ? 'ring-2 ring-purple-500 rotate-2' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-gray-800 leading-tight">{card.title}</h4>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {card.labels.map((label, index) => (
                        <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                            {label}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                <div className="flex items-center gap-3">
                    {card.dueDate && (
                        <div className="flex items-center gap-1 hover:text-red-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                        </div>
                    )}
                    {card.attachments?.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{card.attachments.length}</span>
                        </div>
                    )}
                    {card.comments?.length > 0 && (
                        <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{card.comments.length}</span>
                        </div>
                    )}
                </div>

                {card.assignees && card.assignees.length > 0 && (
                    <div className="flex -space-x-1">
                        {card.assignees.map((assignee, i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] font-bold text-gray-600" title={assignee.name}>
                                {assignee.name?.charAt(0)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Column = ({ column, cards, onAddCard, onCardClick, onDeleteColumn }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: column._id, data: { type: 'Column', column } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex-shrink-0 w-72 flex flex-col max-h-full bg-gray-100/50 rounded-xl border border-gray-200/60"
        >
            {/* Column Header */}
            <div
                {...attributes}
                {...listeners}
                className="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        {column.title}
                    </h3>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {cards.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onAddCard(column._id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDeleteColumn(column._id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
                <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 min-h-[10px]">
                        {cards.map(card => (
                            <Card key={card._id} card={card} onClick={onCardClick} />
                        ))}
                    </div>
                </SortableContext>
            </div>

            {/* Add Card Button */}
            <div className="p-2 pt-0">
                <button
                    onClick={() => onAddCard(column._id)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Card
                </button>
            </div>
        </div>
    );
};

// --- Main Board Component ---

const Board = () => {
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeDragItem, setActiveDragItem] = useState(null);

    // Modal States
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newCardTitle, setNewCardTitle] = useState('');
    const [selectedColumnId, setSelectedColumnId] = useState(null);

    // Card Details Modal State
    const [selectedCardId, setSelectedCardId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Enable click on cards without dragging
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchBoardData();

        // Connect to socket
        socketService.connect();
        if (boardId) {
            socketService.joinBoard(boardId);
        }

        // Listen for events
        socketService.on('card:created', ({ card }) => {
            setCards(prev => [...prev, card]);
        });

        socketService.on('card:moved', ({ cardId, columnId, position }) => {
            setCards(prev => {
                return prev.map(c => {
                    if (c._id === cardId) {
                        return { ...c, column: columnId, position };
                    }
                    return c;
                });
            });
        });

        socketService.on('card:updated', ({ cardId, updates }) => {
            setCards(prev => prev.map(c => c._id === cardId ? { ...c, ...updates } : c));
        });

        socketService.on('card:deleted', ({ cardId }) => {
            setCards(prev => prev.filter(c => c._id !== cardId));
        });

        socketService.on('column:created', ({ column }) => {
            setColumns(prev => [...prev, column]);
        });

        socketService.on('column:deleted', ({ columnId }) => {
            setColumns(prev => prev.filter(c => c._id !== columnId));
        });

        return () => {
            if (boardId) {
                socketService.leaveBoard(boardId);
            }
            socketService.disconnect();
        };
    }, [boardId]);

    const fetchBoardData = async () => {
        try {
            setIsLoading(true);
            // Fetch board details
            const boardRes = await api.get(`/boards/${boardId}`);
            setBoard(boardRes.data.data.board);

            // Fetch columns
            const columnsRes = await api.get(`/columns?boardId=${boardId}`);
            setColumns(columnsRes.data.data.columns);

            // Fetch cards
            const cardsRes = await api.get(`/cards?boardId=${boardId}`);
            setCards(cardsRes.data.data.cards);
        } catch (error) {
            toast.error('Failed to load board data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateColumn = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/columns', {
                title: newColumnTitle,
                boardId,
                position: (columns.length + 1) * 1000
            });
            setColumns([...columns, response.data.data.column]);
            setNewColumnTitle('');
            setIsColumnModalOpen(false);
            toast.success('List added');
        } catch (error) {
            toast.error('Failed to add list');
        }
    };

    const handleCreateCard = async (e) => {
        e.preventDefault();
        try {
            const columnCards = cards.filter(c => c.column === selectedColumnId);
            const response = await api.post('/cards', {
                title: newCardTitle,
                columnId: selectedColumnId,
                boardId,
                position: (columnCards.length + 1) * 1000
            });
            setCards([...cards, response.data.data.card]);
            setNewCardTitle('');
            setIsCardModalOpen(false);
            toast.success('Card added');
        } catch (error) {
            toast.error('Failed to add card');
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (!window.confirm('Are you sure you want to delete this list? All cards in it will be deleted.')) return;
        try {
            await api.delete(`/columns/${columnId}`);
            setColumns(prev => prev.filter(c => c._id !== columnId));
            toast.success('List deleted');
        } catch (error) {
            toast.error('Failed to delete list');
        }
    };

    const openCardModal = (columnId) => {
        setSelectedColumnId(columnId);
        setIsCardModalOpen(true);
    };

    const handleCardClick = (card) => {
        setSelectedCardId(card._id);
    };

    const handleCardUpdate = (updatedCard, deletedCardId) => {
        if (deletedCardId) {
            setCards(prev => prev.filter(c => c._id !== deletedCardId));
        } else if (updatedCard) {
            setCards(prev => prev.map(c => c._id === updatedCard._id ? updatedCard : c));
        }
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const type = active.data.current?.type;
        const item = active.data.current?.card || active.data.current?.column;
        setActiveDragItem({ type, item });
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveACard = active.data.current?.type === 'Card';
        const isOverACard = over.data.current?.type === 'Card';
        const isOverAColumn = over.data.current?.type === 'Column';

        if (!isActiveACard) return;

        // Dragging a card over another card
        if (isActiveACard && isOverACard) {
            setCards((cards) => {
                const activeIndex = cards.findIndex((c) => c._id === activeId);
                const overIndex = cards.findIndex((c) => c._id === overId);

                if (cards[activeIndex].column !== cards[overIndex].column) {
                    cards[activeIndex].column = cards[overIndex].column;
                    return arrayMove(cards, activeIndex, overIndex - 1);
                }

                return arrayMove(cards, activeIndex, overIndex);
            });
        }

        // Dragging a card over a column
        if (isActiveACard && isOverAColumn) {
            setCards((cards) => {
                const activeIndex = cards.findIndex((c) => c._id === activeId);
                cards[activeIndex].column = overId;
                return arrayMove(cards, activeIndex, activeIndex);
            });
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        const type = active.data.current?.type;

        if (type === 'Column') {
            if (activeId !== overId) {
                setColumns((columns) => {
                    const oldIndex = columns.findIndex((c) => c._id === activeId);
                    const newIndex = columns.findIndex((c) => c._id === overId);
                    return arrayMove(columns, oldIndex, newIndex);
                });
                // TODO: API call to update column order
            }
        } else if (type === 'Card') {
            // Card movement logic is mostly handled in DragOver for visual smoothness
            // Here we just persist the final state
            const card = cards.find(c => c._id === activeId);
            if (card) {
                try {
                    // Find the new index
                    const columnCards = cards.filter(c => c.column === card.column);
                    const newIndex = columnCards.findIndex(c => c._id === activeId);
                    const position = newIndex * 1000 + 1000; // Simple positioning logic

                    await api.put(`/cards/${activeId}/move`, {
                        columnId: card.column,
                        position
                    });
                } catch (error) {
                    toast.error('Failed to save card position');
                    // Revert state on error (would need previous state)
                }
            }
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="h-screen flex flex-col bg-cover bg-center"
            style={{
                backgroundImage: board?.background?.type === 'image'
                    ? `url(${board.background.value})`
                    : board?.background?.value || 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)'
            }}
        >
            {/* Board Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-900">{board?.title}</h1>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {board?.workspace?.name}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {board?.members?.map((member, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold" title={member.user?.name}>
                                {member.user?.name?.charAt(0)}
                            </div>
                        ))}
                        <button className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-6 w-px bg-gray-300 mx-2" />
                    <button className="btn-secondary text-sm py-1.5">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="ml-2">Menu</span>
                    </button>
                </div>
            </header>

            {/* Board Canvas */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="h-full flex px-6 py-6 gap-6">
                        <SortableContext
                            items={columns.map(c => c._id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {columns.map(column => (
                                <Column
                                    key={column._id}
                                    column={column}
                                    cards={cards.filter(c => c.column === column._id)}
                                    onAddCard={openCardModal}
                                    onCardClick={handleCardClick}
                                    onDeleteColumn={handleDeleteColumn}
                                />
                            ))}
                        </SortableContext>

                        {/* Add Column Button */}
                        <div className="flex-shrink-0 w-72">
                            <button
                                onClick={() => setIsColumnModalOpen(true)}
                                className="w-full bg-white/50 hover:bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300/50 hover:border-purple-400 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-600 font-medium transition-all group"
                            >
                                <Plus className="w-5 h-5 group-hover:text-purple-600" />
                                Add another list
                            </button>
                        </div>
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeDragItem ? (
                        activeDragItem.type === 'Column' ? (
                            <Column
                                column={activeDragItem.item}
                                cards={cards.filter(c => c.column === activeDragItem.item._id)}
                                onAddCard={() => { }}
                                onCardClick={() => { }}
                                onDeleteColumn={() => { }}
                            />
                        ) : (
                            <Card card={activeDragItem.item} onClick={() => { }} />
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Create Column Modal */}
            <Modal
                isOpen={isColumnModalOpen}
                onClose={() => setIsColumnModalOpen(false)}
                title="Add List"
            >
                <form onSubmit={handleCreateColumn} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">List Title</label>
                        <input
                            type="text"
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            placeholder="e.g., To Do"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsColumnModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            Add List
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Card Modal */}
            <Modal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                title="Add Card"
            >
                <form onSubmit={handleCreateCard} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Title</label>
                        <input
                            type="text"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            placeholder="e.g., Fix login bug"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsCardModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            Add Card
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Card Details Modal */}
            <CardModal
                cardId={selectedCardId}
                isOpen={!!selectedCardId}
                onClose={() => setSelectedCardId(null)}
                onUpdate={handleCardUpdate}
            />
        </div>
    );
};

export default Board;
