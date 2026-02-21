import { useEffect, useCallback } from 'react';

/**
 * Auto-save hook that saves form data to localStorage
 * Prevents data loss from accidental page refresh or browser crashes
 * 
 * @param data - The form data to auto-save
 * @param key - Unique localStorage key for this form
 * @param delay - Debounce delay in milliseconds (default: 2000ms)
 * @returns Object with clearDraft and loadDraft functions
 */
export function useAutoSave<T>(
    data: T,
    key: string,
    delay: number = 2000
) {
    // Auto-save effect with debouncing
    useEffect(() => {
        // Don't save empty data
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return;
        }

        const timer = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                console.log(`✅ Draft auto-saved: ${key}`);
            } catch (error) {
                console.error('Failed to auto-save draft:', error);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [data, key, delay]);

    /**
     * Clear the saved draft from localStorage
     */
    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(key);
            console.log(`🗑️ Draft cleared: ${key}`);
        } catch (error) {
            console.error('Failed to clear draft:', error);
        }
    }, [key]);

    /**
     * Load the saved draft from localStorage
     * @returns The saved draft or null if not found
     */
    const loadDraft = useCallback((): T | null => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                console.log(`📂 Draft loaded: ${key}`);
                return JSON.parse(saved) as T;
            }
            return null;
        } catch (error) {
            console.error('Failed to load draft:', error);
            return null;
        }
    }, [key]);

    return { clearDraft, loadDraft };
}
