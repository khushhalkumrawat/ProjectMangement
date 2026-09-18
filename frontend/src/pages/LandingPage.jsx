import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowRight,
    CheckCircle2,
    Layout,
    Zap,
    Users,
    BarChart3,
    GripVertical
} from 'lucide-react';

// Sortable Item Component
const SortableItem = ({ id, content }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 flex items-center gap-3 group hover:shadow-md transition-all ${isDragging ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-purple-600"
            >
                <GripVertical className="w-5 h-5" />
            </div>
            <span className="text-gray-700 font-medium">{content}</span>
        </div>
    );
};

const LandingPage = () => {
    const [items, setItems] = useState([
        '🚀 Launch new website',
        '🎨 Design system update',
        '📱 Mobile app prototype',
        '📝 Content strategy'
    ]);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Layout className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                            Project Management
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="bg-purple-600 text-white px-5 py-2 rounded-full font-medium hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-500/30"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >

                        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Manage projects with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                Superpowers
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            The most advanced Kanban system for modern teams.
                            AI-powered automation, real-time collaboration, and
                            beautiful design in one powerful workspace.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-500/30 group"
                            >
                                Start for free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/*<button className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:border-gray-300">
                                View Demo
                            </button> */}
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>14-day free trial</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content - Interactive Demo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl transform rotate-3 opacity-10 blur-xl" />
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-2xl relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Try dragging tasks! 👇</h3>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-purple-${i * 100 + 300}`} />
                                    ))}
                                </div>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={items}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <SortableItem key={item} id={item} content={item} />
                                        ))}
                                    </div>
                                </SortableContext>
                                <DragOverlay>
                                    {activeId ? (
                                        <div className="bg-white p-4 rounded-xl shadow-xl border border-purple-200 ring-2 ring-purple-500 opacity-90 cursor-grabbing">
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="w-5 h-5 text-purple-600" />
                                                <span className="text-gray-900 font-medium">{activeId}</span>
                                            </div>
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>

                            {/* Fake Columns Background */}
                            <div className="mt-6 grid grid-cols-3 gap-4 opacity-30 pointer-events-none">
                                <div className="h-32 bg-gray-200 rounded-xl border-2 border-dashed border-gray-300" />
                                <div className="h-32 bg-gray-200 rounded-xl border-2 border-dashed border-gray-300" />
                                <div className="h-32 bg-gray-200 rounded-xl border-2 border-dashed border-gray-300" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything you need to ship faster
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Powerful features to help your team manage complex projects without the chaos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-6 h-6 text-purple-600" />,
                                title: "AI Automation",
                                desc: "Let AI handle the busy work. Auto-assign tasks, generate summaries, and predict delays."
                            },
                            {
                                icon: <Users className="w-6 h-6 text-blue-600" />,
                                title: "Real-time Sync",
                                desc: "See changes instantly. Collaborate with your team as if you're in the same room."
                            },
                            {
                                icon: <BarChart3 className="w-6 h-6 text-pink-600" />,
                                title: "Deep Analytics",
                                desc: "Gain insights into your team's velocity, cycle time, and productivity trends."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                            >
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to transform your workflow?
                        </h2>
                        <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of teams who have switched to AdvKanban for better project management.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Get Started for Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
                    <p>© 2026 Project Management. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
