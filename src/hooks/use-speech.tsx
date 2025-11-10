import { useEffect } from 'react';
import { useVoices } from "./use-voice";

export const useSpeech = () => {

    const { voices, selectedVoice, setVoices, setSelectedVoice } = useVoices();

    useEffect(() => {
        const handleVoicesChanged = () => {
            const availableVoices = speechSynthesis.getVoices();
            const desiredVoices = [
                { lang: 'en-US', name: 'Google US English' },
                { lang: 'en-IN', name: 'Google UK English Male' },
                { lang: 'hi-IN', name: 'Google हिन्दी' },
                { lang: 'mr-IN', name: 'Google मराठी' },
                { lang: 'en-GB', name: 'Google UK English Female' },
                { lang: 'en-GB', name: 'Google UK English Male' },
                { lang: 'en-AU', name: 'Google Australian English' },
                { lang: 'fr-FR', name: 'Google français' },
                { lang: 'it-IT', name: 'Google italiano' }
            ];
            const filteredVoices = availableVoices.filter(voice =>
                desiredVoices.some(desiredVoice => desiredVoice.lang === voice.lang && desiredVoice.name === voice.name)
            );
            setVoices(filteredVoices);
            if (filteredVoices.length > 0 && !selectedVoice) {
                setSelectedVoice(filteredVoices[0]);
            }
        };

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = handleVoicesChanged;
        }
        handleVoicesChanged();
    }, [setVoices, setSelectedVoice, selectedVoice]);

    const getDisplayName = (voice: SpeechSynthesisVoice) => {
        const nameMap: { [key: string]: string } = {
            'Google UK English Male': 'John',
            'Google हिन्दी': 'Asha',
            'Google US English': 'Emily',
            'Google मराठी': 'Raj',
            'Google UK English Female': 'Sophia',
            'Google Australian English': 'Nicole',
            'Google français': 'Marie',
            'Google italiano': 'Luca'
        };
        return nameMap[voice.name] || voice.name;
    };

    return {
        voices,
        selectedVoice,
        setSelectedVoice,
        getDisplayName
    };
};
