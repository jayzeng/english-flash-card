"use client"

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shuffle, ChevronLeft, ChevronRight, Volume2, RefreshCw, Mic, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { speech } from "@/utils/SpeechHandler"
import { FLASHCARDS } from "@/data/flashcards"
import { celebrate } from "@/utils/confetti"
import { playSuccessSound, playFailureSound } from "@/utils/audio"

interface FlashCard {
  word: string
  image: string
}

export function FlashCardGame() {
  const shuffledCards = useMemo(() => [...FLASHCARDS].sort(() => Math.random() - 0.5), [])
  const [cards, setCards] = useState<FlashCard[]>(shuffledCards)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [visitedCards, setVisitedCards] = useState<Set<number>>(new Set())
  const [isSpellingMode, setIsSpellingMode] = useState(false)
  const [spellResult, setSpellResult] = useState<string | null>(null)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [playedWords, setPlayedWords] = useState<Set<string>>(new Set())
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const handleSpeak = useCallback((word: string) => {
    if (isSpellingMode) {
      speech.speak(word)
      setTimeout(() => {
        speech.speak("Please spell the word")
        setIsFadingOut(false)
        if (recognitionRef.current) {
          setTimeout(() => {
            recognitionRef.current?.start()
          }, 1000)
        }
      }, 1000) // Wait for 1 second after speaking the word
    } else {
      speech.speak(word)
    }
  }, [isSpellingMode])

  const goToNextCard = useCallback(() => {
    const nextIndex = (currentCardIndex + 1) % cards.length
    setCurrentCardIndex(nextIndex)
    setVisitedCards(prev => new Set([...prev, nextIndex]))
    handleSpeak(cards[nextIndex].word)
    setSpellResult(null)
    setIsFadingOut(false)
    setPlayedWords(prev => new Set([...prev, cards[nextIndex].word]))
  }, [currentCardIndex, cards, handleSpeak])

  useEffect(() => {
    const loadVisitedCards = () => {
      const visited = localStorage.getItem('visitedCards')
      if (visited) {
        setVisitedCards(new Set(JSON.parse(visited)))
      }
      const spellingMode = localStorage.getItem('spellingMode')
      if (spellingMode) {
        setIsSpellingMode(JSON.parse(spellingMode))
      }
      const played = localStorage.getItem('playedWords')
      if (played) {
        setPlayedWords(new Set(JSON.parse(played)))
      }
    }
    loadVisitedCards()

    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.toLowerCase().trim()
        const parsedSpokenWord = spokenWord.replace(/\s+/g, '')
        const currentWord = cards[currentCardIndex].word.toLowerCase()
        if (parsedSpokenWord === currentWord) {
          setSpellResult('Correct!')
          celebrate()
          playSuccessSound()
          setTimeout(() => {
            goToNextCard()
          }, 2000)
        } else {
          setSpellResult(`"${spokenWord}" is not correct. Try again`)
          playFailureSound()
          setTimeout(() => {
            setIsFadingOut(true)
            setTimeout(() => setSpellResult(null), 500)
          }, 1500)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setSpellResult('Error in speech recognition. Please try again.')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [cards, currentCardIndex, goToNextCard])

  useEffect(() => {
    localStorage.setItem('visitedCards', JSON.stringify([...visitedCards]))
  }, [visitedCards])

  useEffect(() => {
    localStorage.setItem('playedWords', JSON.stringify([...playedWords]))
  }, [playedWords])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '<' || e.key === 'ArrowLeft') {
        goToPreviousCard()
      } else if (e.key === '>' || e.key === 'ArrowRight') {
        goToNextCard()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const shuffleCards = useCallback(() => {
    const unplayedCards = cards.filter(card => !playedWords.has(card.word))
    const playedCards = cards.filter(card => playedWords.has(card.word))
    const shuffled = [...unplayedCards, ...playedCards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentCardIndex(0)
    setVisitedCards(new Set([0]))
    handleSpeak(shuffled[0].word)
    setPlayedWords(prev => new Set([...prev, shuffled[0].word]))
  }, [cards, handleSpeak, playedWords])

  const goToPreviousCard = useCallback(() => {
    const previousIndex = (currentCardIndex - 1 + cards.length) % cards.length
    setCurrentCardIndex(previousIndex)
    setVisitedCards(prev => new Set([...prev, previousIndex]))
    handleSpeak(cards[previousIndex].word)
    setSpellResult(null)
    setIsFadingOut(false)
    setPlayedWords(prev => new Set([...prev, cards[previousIndex].word]))
  }, [currentCardIndex, cards, handleSpeak])

  const newSet = useCallback(() => {
    const unplayedCards = shuffledCards.filter(card => !playedWords.has(card.word))
    const newCards = unplayedCards.length >= 10 
      ? unplayedCards.slice(0, 10) 
      : [...unplayedCards, ...shuffledCards.filter(card => playedWords.has(card.word))].slice(0, 10)
    setCards(newCards)
    setCurrentCardIndex(0)
    setVisitedCards(new Set([0]))
    handleSpeak(newCards[0].word)
    setSpellResult(null)
    setIsFadingOut(false)
    setPlayedWords(prev => new Set([...prev, newCards[0].word]))
  }, [shuffledCards, handleSpeak, playedWords])

  useEffect(() => {
    if (visitedCards.size === cards.length) {
      celebrate()
      playSuccessSound()
      setTimeout(newSet, 5000)
    }
  }, [visitedCards, cards.length, newSet])


  useEffect(() => {
    setVisitedCards(prev => new Set([...prev, currentCardIndex]))
  }, [currentCardIndex])

  const toggleSpellingMode = useCallback(() => {
    setIsSpellingMode(prev => {
      const newMode = !prev
      localStorage.setItem('spellingMode', JSON.stringify(newMode))
      return newMode
    })
    setSpellResult(null)
    setIsFadingOut(false)
  }, [])

  const progress = (visitedCards.size / cards.length) * 100

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">English Flash Cards</h1>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCardIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <Card 
            className="w-full aspect-square flex flex-col items-center justify-center p-6 bg-white shadow-xl cursor-pointer relative"
            onClick={() => handleSpeak(cards[currentCardIndex].word)}
          >
            <Button 
              onClick={(e) => {
                e.stopPropagation()
                toggleSpellingMode()
              }} 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2"
              aria-label={isSpellingMode ? "Switch to Normal Mode" : "Switch to Spelling Mode"}
            >
              {isSpellingMode ? <Pencil className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <h2 className="text-4xl font-bold mb-4 text-blue-600">{isSpellingMode ? '???' : cards[currentCardIndex].word}</h2>
            <img
              src={cards[currentCardIndex].image}
              alt={cards[currentCardIndex].word}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <Button 
              onClick={(e) => {
                e.stopPropagation()
                handleSpeak(cards[currentCardIndex].word)
              }} 
              variant="ghost" 
              size="icon" 
              className="mt-4"
              aria-label={isSpellingMode ? "Start spelling" : `Pronounce ${cards[currentCardIndex].word}`}
            >
              {isSpellingMode ? <Mic className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            {spellResult && (
              <motion.p
                className={`mt-4 text-lg ${spellResult.startsWith('Correct') ? 'text-green-600' : 'text-red-600'}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: isFadingOut ? 0 : 1 }}
                transition={{ duration: 0.5 }}
              >
                {spellResult}
              </motion.p>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center items-center mt-8 space-x-4">
        <Button onClick={goToPreviousCard} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button onClick={shuffleCards} variant="outline" size="icon">
          <Shuffle className="h-4 w-4" />
        </Button>
        <Button onClick={goToNextCard} variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={newSet} variant="outline">
          New Set
        </Button>
      </div>
      <div className="w-full max-w-sm mt-4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      <p className="mt-2 text-blue-800">
        Words learned: {visitedCards.size} / {cards.length}
      </p>
    </div>
  )
}

