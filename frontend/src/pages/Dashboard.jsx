import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, LogOut, Briefcase, ChevronRight, Trello } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useWorkspaceStore from '../store/workspaceStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import api from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuthStore();
    const { workspaces, fetchWorkspaces, createWorkspace, isLoading } = useWorkspaceStore();
    const navigate = useNavigate();

    const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newBoardName, setNewBoardName] = useState('');
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        try {
            await createWorkspace(newWorkspaceName);
            setNewWorkspaceName('');
            setIsWorkspaceModalOpen(false);
        } catch (error) {
            // Error handled in store
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!selectedWorkspaceId) {
            toast.error('Please select a workspace');
            return;
        }
        try {
            await api.post('/boards', {
                title: newBoardName,
                workspaceId: selectedWorkspaceId
            });
            toast.success('Board created successfully');
            setNewBoardName('');
            setIsBoardModalOpen(false);
            fetchWorkspaces(); // Refresh to show new board count or details
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create board');
        }
    };

    const openBoardModal = (workspaceId) => {
        setSelectedWorkspaceId(workspaceId);
        setIsBoardModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                            Project Management
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
                            <p className="text-gray-500 mt-1">Manage your projects and teams</p>
                        </div>
                        <button
                            onClick={() => setIsWorkspaceModalOpen(true)}
                            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Workspace
                        </button>
                    </div>

                    {isLoading && workspaces.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : workspaces.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workspaces yet</h3>
                            <p className="text-gray-500 mb-6">Create your first workspace to get started</p>
                            <button
                                onClick={() => setIsWorkspaceModalOpen(true)}
                                className="text-purple-600 font-medium hover:text-purple-700 hover:underline"
                            >
                                Create a workspace
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {workspaces.map((workspace) => (
                                <div key={workspace._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold text-purple-600">
                                                {workspace.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{workspace.name}</h3>
                                                <p className="text-sm text-gray-500">{workspace.description || 'No description'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openBoardModal(workspace._id)}
                                            className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            + New Board
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Boards</h4>
                                        {workspace.boards && workspace.boards.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {workspace.boards.map((board) => (
                                                    <Link
                                                        key={board._id}
                                                        to={`/board/${board._id}`}
                                                        className="group block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Trello className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" />
                                                        </div>
                                                        <h5 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                                            {board.title}
                                                        </h5>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No boards in this workspace yet.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Create Workspace Modal */}
            <Modal
                isOpen={isWorkspaceModalOpen}
                onClose={() => setIsWorkspaceModalOpen(false)}
                title="Create New Workspace"
            >
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                        <input
                            type="text"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            placeholder="e.g., Engineering Team"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsWorkspaceModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Workspace'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Board Modal */}
            <Modal
                isOpen={isBoardModalOpen}
                onClose={() => setIsBoardModalOpen(false)}
                title="Create New Board"
            >
                <form onSubmit={handleCreateBoard} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Board Title</label>
                        <input
                            type="text"
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            placeholder="e.g., Q4 Roadmap"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsBoardModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            Create Board
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
