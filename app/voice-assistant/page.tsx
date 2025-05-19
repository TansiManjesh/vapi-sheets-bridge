import { EnhancedVoiceAssistant } from "@/components/enhanced-voice-assistant"

export const metadata = {
  title: "Voice Assistant | Honda Customer Service",
  description: "Interact with Honda's customer service AI using your voice",
}

export default function VoiceAssistantPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Honda Voice Assistant</h1>
      <p className="text-center text-gray-600 mb-8">Speak to our AI assistant to get help with your Honda vehicle</p>
      <EnhancedVoiceAssistant />
    </div>
  )
}
