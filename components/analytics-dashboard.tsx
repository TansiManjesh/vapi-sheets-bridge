"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Conversation {
  timestamp: string
  userId: string
  userName: string
  userMessage: string
  aiResponse: string
  intent: string
  company: string
  channel: string
}

export function AnalyticsDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")

  const COLORS = ["#E40521", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/get-conversations")

        if (!response.ok) {
          throw new Error("Failed to fetch conversations")
        }

        const data = await response.json()
        setConversations(data.conversations || [])
      } catch (err) {
        console.error("Error fetching conversations:", err)
        setError("Failed to load analytics data")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  // Filter conversations based on time range and company
  const filteredConversations = conversations.filter((conv) => {
    const date = new Date(conv.timestamp)
    const now = new Date()

    // Time range filter
    if (timeRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (date < today) return false
    } else if (timeRange === "week") {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      if (date < weekAgo) return false
    } else if (timeRange === "month") {
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      if (date < monthAgo) return false
    }

    // Company filter
    if (companyFilter !== "all" && conv.company !== companyFilter) {
      return false
    }

    return true
  })

  // Prepare data for charts
  const intentData = filteredConversations.reduce(
    (acc, conv) => {
      const intent = conv.intent || "unknown"
      acc[intent] = (acc[intent] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const intentChartData = Object.entries(intentData).map(([name, value]) => ({
    name,
    value,
  }))

  const companyData = filteredConversations.reduce(
    (acc, conv) => {
      const company = conv.company || "unknown"
      acc[company] = (acc[company] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const companyChartData = Object.entries(companyData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const channelData = filteredConversations.reduce(
    (acc, conv) => {
      const channel = conv.channel || "unknown"
      acc[channel] = (acc[channel] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const channelChartData = Object.entries(channelData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  // Group by date for daily activity
  const dailyData = filteredConversations.reduce(
    (acc, conv) => {
      const date = new Date(conv.timestamp).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const dailyChartData = Object.entries(dailyData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10) // Last 10 days

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Conversation Analytics</h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              <SelectItem value="honda">Honda</SelectItem>
              <SelectItem value="toyota">Toyota</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total</CardTitle>
            <CardDescription>Total conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredConversations.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Voice</CardTitle>
            <CardDescription>Voice interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredConversations.filter((c) => c.channel === "voice").length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Companies</CardTitle>
            <CardDescription>Unique companies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{Object.keys(companyData).length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Intents</CardTitle>
            <CardDescription>Unique intents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{Object.keys(intentData).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Conversations per day</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#E40521" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intent Distribution</CardTitle>
            <CardDescription>Conversations by intent</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {intentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Distribution</CardTitle>
            <CardDescription>Conversations by company</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
            <CardDescription>Conversations by channel</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Last 10 conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Message</th>
                  <th className="text-left p-2">Intent</th>
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Channel</th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.slice(0, 10).map((conv, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{new Date(conv.timestamp).toLocaleString()}</td>
                    <td className="p-2">{conv.userName}</td>
                    <td className="p-2 max-w-xs truncate">{conv.userMessage}</td>
                    <td className="p-2">{conv.intent}</td>
                    <td className="p-2">{conv.company}</td>
                    <td className="p-2">{conv.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
