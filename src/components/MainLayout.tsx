import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect } from "react";

const MainLayout = () => {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
            {/* Main Page Content Animates */}
            <div className="flex-grow flex flex-col pt-14 sm:pt-16 relative">
                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeInOut"
                        }}
                        className="flex-grow w-full h-full flex flex-col"
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MainLayout;
