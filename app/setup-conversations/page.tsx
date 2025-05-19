import { HondaLogo } from "@/components/honda-logo"
import { SetupConversationsSheet } from "@/components/setup-conversations-sheet"

export default function SetupConversationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <HondaLogo className="h-12 w-auto" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Setup Conversations Sheet</h1>
          <p className="text-gray-600 mt-2">
            Set up the Google Sheet to record customer interactions with the AI assistant
          </p>
        </div>
        <SetupConversationsSheet />
      </div>
    </main>
  )
}
