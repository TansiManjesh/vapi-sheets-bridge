import { ApiTester } from "@/components/api-tester"

export default function ApiTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Google Sheets API Test</h1>
          <p className="text-gray-600 mt-2">Detailed testing of your Google Sheets API connection</p>
        </div>
        <ApiTester />
      </div>
    </main>
  )
}
