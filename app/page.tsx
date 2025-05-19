import { HondaLogo } from "@/components/honda-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, BarChart3, Settings, FileText } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-6">
          <HondaLogo className="h-12 w-auto" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Honda Customer Service AI</h1>
          <p className="text-gray-600 mt-2">Intelligent customer service platform with multi-company support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>Chat with our intelligent AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Get instant answers to your questions about sales, service, insurance, and more.
              </p>
              <Button asChild className="w-full bg-[#E40521] hover:bg-[#c70419]">
                <a href="/assistant">Chat Now</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Feedback Form
              </CardTitle>
              <CardDescription>Share your experience with us</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Help us improve our service by providing your valuable feedback.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="/feedback">Submit Feedback</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>View conversation analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Analyze customer interactions and gain insights from conversation data.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="/analytics">View Analytics</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" size="sm" className="justify-start">
              <a href="/setup-conversations">
                <Settings className="h-4 w-4 mr-2" />
                Setup Conversation Sheets
              </a>
            </Button>

            <Button asChild variant="outline" size="sm" className="justify-start">
              <a href="/conversations">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Conversations
              </a>
            </Button>

            <Button asChild variant="outline" size="sm" className="justify-start">
              <a href="/test-flowise">
                <Settings className="h-4 w-4 mr-2" />
                Test Flowise Connection
              </a>
            </Button>

            <Button asChild variant="outline" size="sm" className="justify-start">
              <a href="/debug">
                <Settings className="h-4 w-4 mr-2" />
                Debug Tools
              </a>
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>© 2023 Honda Customer Service AI. All rights reserved.</p>
        </div>
      </div>
    </main>
  )
}
