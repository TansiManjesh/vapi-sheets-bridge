import { DecoderErrorFixer } from "@/components/decoder-error-fixer"

export default function FixDecoderErrorPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Fix DECODER Error</h1>
          <p className="text-gray-600 mt-2">Resolve the "DECODER routines::unsupported" error</p>
        </div>
        <DecoderErrorFixer />
      </div>
    </main>
  )
}
