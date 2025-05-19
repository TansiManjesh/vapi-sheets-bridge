import { VoiceAnalytics } from "@/components/voice-analytics"

export const metadata = {
  title: "Voice Analytics | Honda Customer Service",
  description: "Analytics for voice interactions with Honda's customer service AI",
}

export default function VoiceAnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Voice Interaction Analytics</h1>
      <p className="text-gray-600 mb-8">Track and analyze voice interactions with the Honda Customer Service AI</p>
      <VoiceAnalytics />
    </div>
  )
}
