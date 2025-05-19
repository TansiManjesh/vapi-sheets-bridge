import { CredentialsChecker } from "@/components/credentials-checker"

export default function CheckCredentialsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Credentials Format Checker</h1>
          <p className="text-gray-600 mt-2">Verify your Google service account credentials format</p>
        </div>
        <CredentialsChecker />
      </div>
    </main>
  )
}
