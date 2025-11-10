import { create } from "zustand";

interface SearchStore {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const useSearch = create<SearchStore>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
}));
