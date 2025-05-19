import { HondaLogo } from "@/components/honda-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { MessageSquare, Mic, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <HondaLogo className="h-16 w-auto" />
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Honda Customer Service AI</h1>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Intelligent customer service platform with voice capabilities and multi-company support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>Chat with our intelligent assistant</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Get instant answers to your questions about sales, service, insurance, and more.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/assistant" className="w-full">
                <Button className="w-full bg-[#E40521] hover:bg-[#c70419] text-white">Chat Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Assistant
              </CardTitle>
              <CardDescription>Talk to our AI using your voice</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Speak naturally with our voice-enabled assistant for a hands-free experience.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/voice-assistant" className="w-full">
                <Button className="w-full" variant="outline">
                  Voice Assistant
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>View conversation analytics</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Analyze customer interactions and gain insights from conversation data.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/analytics" className="w-full">
                <Button className="w-full" variant="outline">
                  View Analytics
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
