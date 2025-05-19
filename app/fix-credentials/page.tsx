import { CredentialsFixer } from "@/components/credentials-fixer"

export default function FixCredentialsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Credentials Formatter</h1>
          <p className="text-gray-600 mt-2">Format your Google service account credentials for Vercel</p>
        </div>
        <CredentialsFixer />
      </div>
    </main>
  )
}
