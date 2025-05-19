"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState("honda")

  // Voice settings
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState("")
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [autoSpeak, setAutoSpeak] = useState(true)

  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize speech synthesis
    const synth = window.speechSynthesis
    const loadVoices = () => {
      const availableVoices = synth.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name)
      }
    }

    loadVoices()
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices
    }

    // Initialize speech recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("")

        setTranscript(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          const finalTranscript = transcript
          if (finalTranscript) {
            setInput(finalTranscript)
            handleSubmit(finalTranscript)
          }
          setIsListening(false)
        }
      }
    } else {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isListening, transcript])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript("")
      setError(null)
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error("Failed to start speech recognition:", err)
        setError("Failed to start speech recognition. Please try again.")
      }
    }
  }

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return

    const utterance = new SpeechSynthesisUtterance(text)

    // Apply voice settings
    if (selectedVoice) {
      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) utterance.voice = voice
    }

    utterance.volume = volume
    utterance.rate = rate
    utterance.pitch = pitch

    window.speechSynthesis.speak(utterance)
  }

  const handleSubmit = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setTranscript("")
    setIsProcessing(true)

    try {
      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          chatHistory: messages,
          companyId: company,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()

      // Add AI response
      const aiMessage: Message = { role: "assistant", content: data.response }
      setMessages((prev) => [...prev, aiMessage])

      // Record conversation
      await fetch("/api/record-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "voice-user",
          userName: "Voice User",
          userMessage: messageText,
          aiResponse: data.response,
          intent: data.intent || "general",
          company: company,
          channel: "voice",
        }),
      })

      // Speak response if auto-speak is enabled
      if (autoSpeak) {
        speakText(data.response)
      }
    } catch (err) {
      console.error("Error submitting message:", err)
      setError("Failed to get response. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Honda Voice Assistant</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="toyota">Toyota</SelectItem>
                </SelectContent>
              </Select>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Voice Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="voice">Voice</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger id="voice">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume: {volume.toFixed(1)}</Label>
                      <Slider
                        id="volume"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[volume]}
                        onValueChange={(values) => setVolume(values[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate">Speed: {rate.toFixed(1)}</Label>
                      <Slider
                        id="rate"
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={[rate]}
                        onValueChange={(values) => setRate(values[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pitch">Pitch: {pitch.toFixed(1)}</Label>
                      <Slider
                        id="pitch"
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={[pitch]}
                        onValueChange={(values) => setPitch(values[0])}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-speak">Auto-speak responses</Label>
                      <Switch id="auto-speak" checked={autoSpeak} onCheckedChange={setAutoSpeak} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow overflow-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Start speaking or type a message to begin a conversation.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}

            {isListening && (
              <div className="flex justify-center">
                <div className="rounded-lg px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  Listening: {transcript || "..."}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">●</div>
                    <div className="animate-pulse animation-delay-200">●</div>
                    <div className="animate-pulse animation-delay-400">●</div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="rounded-lg px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="border-t p-4">
          <div className="flex w-full items-center space-x-2">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={toggleListening}
              disabled={isProcessing}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isListening || isProcessing}
            />

            <Button
              variant="default"
              size="icon"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isProcessing || isListening}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
