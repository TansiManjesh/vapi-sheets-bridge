import { FeedbackForm } from "@/components/feedback-form"
import { HondaLogo } from "@/components/honda-logo"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <HondaLogo className="h-12 w-auto" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Honda Customer Feedback</h1>
          <p className="text-gray-600 mt-2">Help us improve our service by sharing your experience</p>
        </div>
        <FeedbackForm />
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need immediate assistance? Chat with our AI assistant</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-[#E40521] hover:bg-[#c70419]">
              <a href="/assistant">Chat with Honda AI Assistant</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/conversations">View Customer Conversations</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
