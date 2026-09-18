import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="mb-8">
                    <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
                    <h1 className="text-9xl font-bold text-white mb-4">404</h1>
                    <h2 className="text-3xl font-semibold text-gray-300 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
