import { create } from "zustand";

interface HeightStore {
    height: number;
    setHeight: (height: number) => void;
}

export const useHeight = create<HeightStore>((set) => ({
    height: 0,
    setHeight: (height) => set({ height }),
}));
