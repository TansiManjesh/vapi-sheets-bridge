import { ExtractCredentials } from "@/components/extract-credentials"

export default function ExtractCredentialsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Extract Credentials</h1>
          <p className="text-gray-600 mt-2">Extract credentials for the new API endpoint</p>
        </div>
        <ExtractCredentials />
      </div>
    </main>
  )
}
