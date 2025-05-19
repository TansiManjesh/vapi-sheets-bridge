import { DirectTestTool } from "@/components/direct-test-tool"

export default function DirectTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Direct Google Sheets Test</h1>
          <p className="text-gray-600 mt-2">A direct test that bypasses the normal API flow</p>
        </div>
        <DirectTestTool />
      </div>
    </main>
  )
}
