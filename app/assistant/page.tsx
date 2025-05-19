import { ChatInterface } from "@/components/chat-interface"
import { HondaLogo } from "@/components/honda-logo"

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <HondaLogo className="h-12 w-auto" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Honda AI Assistant</h1>
          <p className="text-gray-600 mt-2">Ask questions about your Honda vehicle, service, or maintenance</p>
        </div>
        <ChatInterface />
      </div>
    </main>
  )
}
