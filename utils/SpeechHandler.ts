export class SpeechHandler {
    private synth: SpeechSynthesis | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.synth = window.speechSynthesis;
        }
    }

    speak(text: string) {
        if (!this.synth) {
            console.warn('Speech synthesis not available');
            return;
        }

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8; // Slightly slower rate
        utterance.pitch = 1;
        utterance.volume = 1;

        this.synth.speak(utterance);
    }
}

export const speech = new SpeechHandler();

