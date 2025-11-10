import { create } from "zustand";

interface InputStore {
    input: string;
    setInput: (input: string) => void;
}

export const useInput = create<InputStore>((set) => ({
    input: "",
    setInput: (input: string, isAutoChange: boolean = false) => set({ input }),
}));
