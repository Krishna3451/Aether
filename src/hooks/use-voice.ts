import { create } from 'zustand';

interface VoiceStore {
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    setVoices: (voices: SpeechSynthesisVoice[]) => void;
    setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

export const useVoices = create<VoiceStore>((set) => ({
    voices: [],
    selectedVoice: null,
    setVoices: (voices) => set({ voices }),
    setSelectedVoice: (voice) => set({ selectedVoice: voice }),
}));
