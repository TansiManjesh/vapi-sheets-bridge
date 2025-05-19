import { HondaLogo } from "@/components/honda-logo"
import { ConversationsList } from "@/components/conversations-list"

export default function ConversationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <HondaLogo className="h-12 w-auto" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Customer Conversations</h1>
          <p className="text-gray-600 mt-2">View all recorded customer interactions with the AI assistant</p>
        </div>
        <ConversationsList />
      </div>
    </main>
  )
}
