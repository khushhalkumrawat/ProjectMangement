import { useState, useEffect } from 'react';
import { X, Calendar, Tag, User, AlignLeft, CheckSquare, Clock, Trash2 } from 'lucide-react';
import Modal from './Modal'; // Reuse the generic modal wrapper if possible, or build custom
import api from '../services/api';
import toast from 'react-hot-toast';

const CardModal = ({ cardId, isOpen, onClose, onUpdate }) => {
    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (isOpen && cardId) {
            fetchCardDetails();
        }
    }, [isOpen, cardId]);

    const fetchCardDetails = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/cards/${cardId}`);
            const cardData = response.data.data.card; // Adjust based on actual API response structure
            setCard(cardData);
            setTitle(cardData.title);
            setDescription(cardData.description || '');
        } catch (error) {
            toast.error('Failed to load card details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await api.put(`/cards/${cardId}`, {
                title,
                description
            });
            setCard(response.data.data.card);
            onUpdate(response.data.data.card); // Notify parent to update local state
            toast.success('Card updated');
        } catch (error) {
            toast.error('Failed to update card');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this card?')) return;
        try {
            await api.delete(`/cards/${cardId}`);
            onUpdate(null, cardId); // Notify parent to remove card
            onClose();
            toast.success('Card deleted');
        } catch (error) {
            toast.error('Failed to delete card');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : card ? (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-full mr-4">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleSave}
                                    className="text-2xl font-bold text-gray-900 w-full border-none focus:ring-0 p-0 bg-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    in list <span className="font-medium text-gray-700 underline">To Do</span>
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Main Content */}
                            <div className="md:col-span-3 space-y-6">
                                {/* Description */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-gray-700 font-semibold">
                                        <AlignLeft className="w-5 h-5" />
                                        <h3>Description</h3>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onBlur={handleSave}
                                        placeholder="Add a more detailed description..."
                                        className="w-full min-h-[120px] p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-y"
                                    />
                                </div>

                                {/* Activity/Comments Placeholder */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
                                        <AlignLeft className="w-5 h-5" />
                                        <h3>Activity</h3>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                            YO
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Actions */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add to card</h4>
                                <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    <User className="w-4 h-4" /> Members
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    <Tag className="w-4 h-4" /> Labels
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    <CheckSquare className="w-4 h-4" /> Checklist
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    <Clock className="w-4 h-4" /> Dates
                                </button>

                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Actions</h4>
                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">Card not found</div>
                )}
            </div>
        </div>
    );
};

export default CardModal;
