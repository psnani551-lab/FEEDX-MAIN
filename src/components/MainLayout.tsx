import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect } from "react";

const MainLayout = () => {
    const location = useLocation();

    // Scroll to top on page change before animation starts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
            {/* Global Navbar Stays Static */}
            <Navbar />

            {/* Main Page Content Animates */}
            <div className="flex-grow flex flex-col pt-16 sm:pt-20 relative">
                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            opacity: { duration: 0.2 },
                        }}
                        className="flex-grow w-full h-full flex flex-col"
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>
            </div>

            {/* Global Footer Stays Static */}
            <Footer />
        </div>
    );
};

export default MainLayout;
