
import { create } from "zustand";

interface InstructionsStore {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const useInstructions = create<InstructionsStore>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
}));
