"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type VoiceChatProps = {
  onSendMessage: (message: string) => void
  isProcessing: boolean
  lastAiMessage: string | null
}

// Define the SpeechRecognitionStatic interface
declare global {
  interface SpeechRecognitionStatic {
    new (): SpeechRecognition
    prototype: SpeechRecognition
  }
}

export function VoiceChat({ onSendMessage, isProcessing, lastAiMessage }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if browser supports speech recognition
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition: SpeechRecognitionStatic =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("")

          setTranscript(transcript)
        }

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
          toast({
            title: "Error",
            description: `Speech recognition error: ${event.error}`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        })
      }

      // Check if browser supports speech synthesis
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis
        setIsSpeechEnabled(true)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
      }
      if (synthRef.current && utteranceRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Handle speech synthesis for AI responses
  useEffect(() => {
    if (isSpeaking && lastAiMessage && synthRef.current && isSpeechEnabled) {
      utteranceRef.current = new SpeechSynthesisUtterance(lastAiMessage)
      utteranceRef.current.onend = () => setIsSpeaking(false)
      utteranceRef.current.onerror = () => setIsSpeaking(false)
      synthRef.current.speak(utteranceRef.current)
    }

    return () => {
      if (synthRef.current && utteranceRef.current) {
        utteranceRef.current.onend = null
        utteranceRef.current.onerror = null
      }
    }
  }, [lastAiMessage, isSpeaking, isSpeechEnabled])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      if (transcript.trim()) {
        onSendMessage(transcript)
      }
      setTranscript("")
    } else {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
    setIsListening(!isListening)
  }

  const toggleSpeaking = () => {
    if (!isSpeechEnabled) {
      toast({
        title: "Not Supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    if (isSpeaking) {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {transcript && isListening && <div className="text-sm text-gray-500 flex-1 truncate">{transcript}</div>}

      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={toggleListening}
        disabled={isProcessing}
        className={isListening ? "bg-red-100" : ""}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>

      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={toggleSpeaking}
        disabled={!lastAiMessage || !isSpeechEnabled}
        className={isSpeaking ? "bg-blue-100" : ""}
      >
        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
