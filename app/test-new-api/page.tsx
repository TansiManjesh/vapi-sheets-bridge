import { TestNewApi } from "@/components/test-new-api"

export default function TestNewApiPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Test New API Endpoint</h1>
          <p className="text-gray-600 mt-2">Test the new approach using separate environment variables</p>
        </div>
        <TestNewApi />
      </div>
    </main>
  )
}
