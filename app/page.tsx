import { HondaLogo } from "@/components/honda-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { MessageSquare, Settings } from "lucide-react"
import Link from "next/link"

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Chat with our intelligent assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Get instant answers to your questions about sales, service, insurance, and more.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/assistant" className="w-full">
                <Button className="w-full bg-[#E40521] hover:bg-[#c70419]">Chat Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Assistant</CardTitle>
              <CardDescription>Talk to our AI using your voice</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Speak naturally with our voice-enabled assistant for a hands-free experience.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/voice-assistant" className="w-full">
                <Button className="w-full">Full Voice Assistant</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simple Voice Assistant</CardTitle>
              <CardDescription>Basic voice assistant (more compatible)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                A simplified voice interface that works on more browsers and devices.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/simple-voice" className="w-full">
                <Button className="w-full">Simple Voice Assistant</Button>
              </Link>
            </CardFooter>
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
