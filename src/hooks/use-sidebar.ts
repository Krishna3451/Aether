import { create } from "zustand";

interface SidebarStore {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const useSidebar = create<SidebarStore>((set) => ({
    isOpen: true,
    setIsOpen: (isOpen) => set({ isOpen }),
}));

export default useSidebar;
