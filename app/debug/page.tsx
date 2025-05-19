import { DebugTool } from "@/components/debug-tool"

export default function DebugPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Honda Feedback System Diagnostics</h1>
          <p className="text-gray-600 mt-2">Troubleshoot your Google Sheets connection</p>
        </div>
        <DebugTool />
      </div>
    </main>
  )
}
