export class SpeechHandler {
    private synth: SpeechSynthesis;

    constructor() {
        this.synth = window.speechSynthesis;
    }

    speak(text: string) {
        if (this.synth.speaking) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';

        this.synth.speak(utterance);
    }
}

export const speech = new SpeechHandler();

