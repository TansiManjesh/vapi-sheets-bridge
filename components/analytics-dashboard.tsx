"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { companies } from "@/lib/intent-detection"
import { Loader2, BarChart3, PieChart, MessageSquare, Users } from "lucide-react"

type ConversationData = {
  timestamp: string
  company: string
  intent: string
  userMessage: string
  aiResponse: string
}

type AnalyticsSummary = {
  totalConversations: number
  intentBreakdown: Record<string, number>
  companyBreakdown: Record<string, number>
  dailyActivity: Record<string, number>
  averageResponseLength: number
}

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalConversations: 0,
    intentBreakdown: {},
    companyBreakdown: {},
    dailyActivity: {},
    averageResponseLength: 0,
  })
  const [timeRange, setTimeRange] = useState("7days")
  const [selectedCompany, setSelectedCompany] = useState("all")

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/analytics?timeRange=${timeRange}&company=${selectedCompany}`)

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const data = await response.json()
        setConversations(data.conversations || [])
        setAnalytics(
          data.analytics || {
            totalConversations: 0,
            intentBreakdown: {},
            companyBreakdown: {},
            dailyActivity: {},
            averageResponseLength: 0,
          },
        )
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError("Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange, selectedCompany])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Conversation Analytics</h2>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {Object.entries(companies).map(([id, company]) => (
                <SelectItem key={id} value={id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7days"
                ? "Past 7 days"
                : timeRange === "30days"
                  ? "Past 30 days"
                  : timeRange === "90days"
                    ? "Past 90 days"
                    : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Intent</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {Object.entries(analytics.intentBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(analytics.intentBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Company</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(analytics.companyBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(analytics.companyBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Length</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageResponseLength)} chars</div>
            <p className="text-xs text-muted-foreground">Average AI response length</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="intent">
        <TabsList>
          <TabsTrigger value="intent">Intent Breakdown</TabsTrigger>
          <TabsTrigger value="company">Company Breakdown</TabsTrigger>
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          <TabsTrigger value="recent">Recent Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="intent" className="p-4 bg-white rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Conversations by Intent</h3>
          <div className="space-y-2">
            {Object.entries(analytics.intentBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([intent, count]) => (
                <div key={intent} className="flex items-center">
                  <div className="w-32 capitalize">{intent}</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(count / analytics.totalConversations) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right">{count}</div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="company" className="p-4 bg-white rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Conversations by Company</h3>
          <div className="space-y-2">
            {Object.entries(analytics.companyBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([company, count]) => (
                <div key={company} className="flex items-center">
                  <div className="w-32">{company}</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(count / analytics.totalConversations) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right">{count}</div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="p-4 bg-white rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Daily Conversation Activity</h3>
          <div className="h-64 flex items-end space-x-2">
            {Object.entries(analytics.dailyActivity).map(([date, count]) => (
              <div key={date} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-purple-500 rounded-t"
                  style={{
                    height: `${(count / Math.max(...Object.values(analytics.dailyActivity))) * 100}%`,
                    minHeight: "4px",
                  }}
                ></div>
                <div className="text-xs mt-1 rotate-45 origin-left">{new Date(date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="p-4 bg-white rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Conversations</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversations.slice(0, 10).map((conv, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium capitalize">
                    {conv.company} - {conv.intent}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(conv.timestamp).toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <span className="font-semibold">User:</span> {conv.userMessage}
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <span className="font-semibold">AI:</span>{" "}
                    {conv.aiResponse.length > 200 ? `${conv.aiResponse.substring(0, 200)}...` : conv.aiResponse}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
