"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, VolumeX, Settings, Info, RotateCcw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { companies } from "@/lib/intent-detection"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the SpeechRecognitionStatic interface
declare global {
  interface SpeechRecognitionStatic {
    new (): SpeechRecognition
    prototype: SpeechRecognition
  }
}

type Message = {
  content: string
  isUser: boolean
  timestamp: Date
}

export function EnhancedVoiceAssistant() {
  // State for voice recognition and synthesis
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volume, setVolume] = useState(80)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [voiceIndex, setVoiceIndex] = useState(0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [company, setCompany] = useState("honda")
  const [messages, setMessages] = useState<Message[]>([])
  const [listeningProgress, setListeningProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if browser supports speech recognition
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        try {
          const SpeechRecognition: SpeechRecognitionStatic =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = true
          recognitionRef.current.interimResults = true
          recognitionRef.current.lang = "en-US"

          // Add more detailed error handling and logging
          console.log("Speech recognition initialized successfully")
          setupRecognitionHandlers()
        } catch (error) {
          console.error("Error initializing speech recognition:", error)
          toast({
            title: "Initialization Error",
            description: "Could not initialize speech recognition. Please try a different browser.",
            variant: "destructive",
          })
        }
      } else {
        console.error("Speech Recognition API not supported in this browser")
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser. Please try Chrome or Edge.",
          variant: "destructive",
        })
      }

      // Check if browser supports speech synthesis
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis

        // Get available voices
        const loadVoices = () => {
          const voices = synthRef.current?.getVoices() || []
          setAvailableVoices(voices)
        }

        loadVoices()

        // Chrome loads voices asynchronously
        if (synthRef.current.onvoiceschanged !== undefined) {
          synthRef.current.onvoiceschanged = loadVoices
        }

        // Add welcome message
        const welcomeMessage = `Hello! I'm ${companies[company]?.name || "Honda"}'s voice assistant. How can I help you today?`
        setMessages([
          {
            content: welcomeMessage,
            isUser: false,
            timestamp: new Date(),
          },
        ])

        // Speak welcome message after a delay
        setTimeout(() => {
          speakText(welcomeMessage)
        }, 1000)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
      }
      if (synthRef.current && utteranceRef.current) {
        synthRef.current.cancel()
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update welcome message when company changes
  useEffect(() => {
    const welcomeMessage = `Hello! I'm ${companies[company]?.name || "Honda"}'s voice assistant. How can I help you today?`
    setMessages([
      {
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ])
    speakText(welcomeMessage)
  }, [company])

  const speakText = (text: string) => {
    if (!synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    // Create new utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text)

    // Set voice properties
    if (availableVoices.length > 0) {
      utteranceRef.current.voice = availableVoices[voiceIndex]
    }

    utteranceRef.current.volume = volume / 100
    utteranceRef.current.rate = rate
    utteranceRef.current.pitch = pitch

    // Set event handlers
    utteranceRef.current.onstart = () => setIsSpeaking(true)
    utteranceRef.current.onend = () => setIsSpeaking(false)
    utteranceRef.current.onerror = () => setIsSpeaking(false)

    // Speak
    synthRef.current.speak(utteranceRef.current)
  }

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
      try {
        recognitionRef.current.stop()
        console.log("Speech recognition stopped")
        if (transcript.trim()) {
          handleSendMessage(transcript)
        }
        setTranscript("")
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
      }
    } else {
      try {
        // Add a fallback mechanism
        const startRecognition = () => {
          try {
            recognitionRef.current?.start()
            console.log("Speech recognition started")
            setListeningProgress(0)
            progressIntervalRef.current = setInterval(() => {
              setListeningProgress((prev) => {
                if (prev >= 100) {
                  if (isListening && transcript.trim()) {
                    handleSendMessage(transcript)
                    setTranscript("")
                    return 0
                  }
                  return prev
                }
                return prev + 1
              })
            }, 100)
          } catch (error) {
            console.error("Error in startRecognition:", error)
            // Try to recreate the recognition object
            const SpeechRecognition: SpeechRecognitionStatic =
              (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true
            recognitionRef.current.lang = "en-US"

            // Set up event handlers again
            setupRecognitionHandlers()

            // Try again after a short delay
            setTimeout(() => {
              try {
                recognitionRef.current?.start()
                console.log("Speech recognition restarted after recreation")
              } catch (secondError) {
                console.error("Failed to restart recognition after recreation:", secondError)
                toast({
                  title: "Error",
                  description: "Could not start speech recognition. Please reload the page.",
                  variant: "destructive",
                })
              }
            }, 100)
          }
        }

        startRecognition()
      } catch (error) {
        console.error("Error in toggleListening:", error)
        toast({
          title: "Error",
          description: "Could not start speech recognition. Please try again.",
          variant: "destructive",
        })
      }
    }
    setIsListening(!isListening)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return

    const userMessage = message.trim()
    setTranscript("")

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        content: userMessage,
        isUser: true,
        timestamp: new Date(),
      },
    ])

    setIsProcessing(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: messages.map((msg) => ({
            message: msg.content,
            isUser: msg.isUser,
          })),
          companyId: company,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const aiResponse = data.response

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          content: aiResponse,
          isUser: false,
          timestamp: new Date(),
        },
      ])

      // Speak the response if autoSpeak is enabled
      if (autoSpeak) {
        speakText(aiResponse)
      }

      // Record the conversation in Google Sheets
      try {
        await fetch("/api/record-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage,
            aiResponse,
            timestamp: new Date().toISOString(),
            intent: data.intent,
            company: data.company,
            sheetName: data.sheetName,
            channel: "voice",
          }),
        })
      } catch (recordError) {
        console.error("Error recording conversation:", recordError)
      }
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage = "I'm sorry, I encountered an error. Please try again."

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          content: errorMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ])

      // Speak the error message
      if (autoSpeak) {
        speakText(errorMessage)
      }

      toast({
        title: "Error",
        description: "Failed to get a response from the assistant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetConversation = () => {
    const welcomeMessage = `Hello! I'm ${companies[company]?.name || "Honda"}'s voice assistant. How can I help you today?`
    setMessages([
      {
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ])
    speakText(welcomeMessage)
  }

  // Add this new function to set up recognition handlers
  const setupRecognitionHandlers = () => {
    if (!recognitionRef.current) return

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("")

      setTranscript(transcript)
      console.log("Transcript updated:", transcript)
    }

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended naturally")
      if (isListening) {
        try {
          recognitionRef.current?.start()
          console.log("Speech recognition restarted after natural end")
        } catch (error) {
          console.error("Error restarting speech recognition:", error)
          setIsListening(false)
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
          }
        }
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      if (event.error === "no-speech") {
        // This is a common error, don't show toast for this
        console.log("No speech detected")
        return
      }

      setIsListening(false)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      toast({
        title: "Error",
        description: `Speech recognition error: ${event.error}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Voice Assistant</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(companies).map(([id, companyData]) => (
                <SelectItem key={id} value={id}>
                  {companyData.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetConversation}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {showSettings && (
        <CardContent className="border-b">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-speak">Auto-speak responses</Label>
              <Switch id="auto-speak" checked={autoSpeak} onCheckedChange={setAutoSpeak} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-select">Voice</Label>
                <Select value={voiceIndex.toString()} onValueChange={(value) => setVoiceIndex(Number.parseInt(value))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume-slider">Volume: {volume}%</Label>
              <Slider
                id="volume-slider"
                min={0}
                max={100}
                step={1}
                value={[volume]}
                onValueChange={(values) => setVolume(values[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate-slider">Speed: {rate.toFixed(1)}x</Label>
              <Slider
                id="rate-slider"
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={(values) => setRate(values[0])}
              />
            </div>
          </div>
        </CardContent>
      )}

      <CardContent className="h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-3 rounded-lg max-w-[80%] ${
                message.isUser
                  ? "bg-[#E40521] text-white"
                  : company === "toyota"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 p-4 border-t">
        {isListening && (
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Listening...</p>
              <p className="text-xs text-gray-500">{Math.floor(listeningProgress / 10)} seconds</p>
            </div>
            <Progress value={listeningProgress} className="w-full" />
            {transcript && <p className="text-sm text-gray-600 italic">{transcript}</p>}
          </div>
        )}

        {!isListening && (
          <div className="w-full flex space-x-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type your message if voice isn't working..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E40521]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && transcript.trim()) {
                  handleSendMessage(transcript)
                }
              }}
            />
            <Button
              onClick={() => transcript.trim() && handleSendMessage(transcript)}
              disabled={isProcessing || !transcript.trim()}
            >
              Send
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={toggleListening}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Listening
                </>
              )}
            </Button>

            {isSpeaking && (
              <Button variant="outline" size="icon" onClick={stopSpeaking}>
                <VolumeX className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm" className="text-xs flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {isProcessing ? "Processing..." : "Ready"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
