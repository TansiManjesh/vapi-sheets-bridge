import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { HondaLogo } from "@/components/honda-logo"

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <HondaLogo className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Customer Service Analytics</h1>
          </div>
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Back to Home
          </a>
        </div>

        <AnalyticsDashboard />
      </div>
    </main>
  )
}
