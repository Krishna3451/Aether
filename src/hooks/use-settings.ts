import { create } from "zustand";

interface SettingsStore {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export const useSettings = create<SettingsStore>((set) => ({
    isOpen: false,
    setIsOpen: (value: boolean) => set({ isOpen: value }),
}));
