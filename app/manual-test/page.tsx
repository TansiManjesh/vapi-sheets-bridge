import { ManualTestTool } from "@/components/manual-test-tool"

export default function ManualTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manual Connection Test</h1>
          <p className="text-gray-600 mt-2">Test your fixed credentials with a Google Sheet</p>
        </div>
        <ManualTestTool />
      </div>
    </main>
  )
}
