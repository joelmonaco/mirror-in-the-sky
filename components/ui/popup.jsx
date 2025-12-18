'use client';

import { Button } from "@/components/ui/button";
import CheckIcon from "@/icons/check-icon";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Popup({ popup, onHide }) {
    const { isVisible, message, type } = popup;

    useEffect(() => {
        if (!isVisible) return;
        
        const timer = setTimeout(() => {
            onHide();
        }, 4000);

        return () => clearTimeout(timer);
    }, [isVisible, onHide]);

    const getIcon = () => {
        if(type === 'error') {
            return <AlertCircle className="text-red-500 h-4 w-4" />;
        }
        return <CheckIcon className="text-black h-4 w-4" />;
    };

    const getBackgroundColor = () => {
        return 'bg-white';
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.6,
                        delay: 0.4
                    }}
                    className={`fixed bottom-4 left-1/2 -translate-x-1/2 safari-icon-fix sm:-translate-x-0 sm:left-4 z-[9999] ${getBackgroundColor()} rounded-px-18 shadow-layered w-[calc(100vw-48px)] sm:w-[280px] outline-1 outline-gray-opacity-6 p-0`}
                >
                    <div className="px-4 py-6 flex flex-col items-center justify-center">
                        <div className={`flex flex-row items-center justify-center h-10 w-10 bg-gray-opacity-3 rounded-full`}>
                            {getIcon()}
                        </div>

                        <span className={`mt-3 text-gray-opacity-60 text-xs leading-5 text-center`}>
                            {message}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}