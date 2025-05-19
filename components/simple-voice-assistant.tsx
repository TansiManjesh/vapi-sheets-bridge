"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send } from "lucide-react"

export default function SimpleVoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setTranscript(transcript)
          setIsListening(false)
          handleSubmit(transcript)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      } else {
        setError("Speech recognition not supported in this browser. Please use the text input instead.")
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      setIsListening(false)
    } else {
      setError("")
      setTranscript("")
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch (err) {
          console.error("Failed to start speech recognition:", err)
          setError("Failed to start speech recognition. Please try again or use text input.")
        }
      } else {
        setError("Speech recognition not available. Please use the text input.")
      }
    }
  }

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data.response || "Sorry, I could not process your request.")

      // Record the conversation
      await fetch("/api/record-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: text,
          aiResponse: data.response,
          channel: "voice",
          company: "Honda",
          intent: data.intent || "general",
        }),
      })
    } catch (err) {
      console.error("Error submitting message:", err)
      setError("Failed to get a response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputRef.current && inputRef.current.value.trim()) {
      const text = inputRef.current.value
      setTranscript(text)
      handleSubmit(text)
      inputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-red-600 text-white">
        <CardTitle className="text-center">Honda Voice Assistant</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

        <div className="mb-6 flex justify-center">
          <Button
            onClick={toggleListening}
            disabled={isLoading}
            className={`rounded-full p-6 ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">You said:</h3>
          <div className="p-3 bg-gray-100 rounded-md min-h-[60px]">
            {transcript || (isListening ? "Listening..." : "Click the microphone button and speak")}
          </div>
        </div>

        {response && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Response:</h3>
            <div className="p-3 bg-red-50 rounded-md">{response}</div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Or type your question:</h3>
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input ref={inputRef} placeholder="Type your question here..." disabled={isLoading} className="flex-1" />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : <Send size={18} />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
