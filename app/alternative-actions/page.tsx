import { AlternativeActions } from "@/components/alternative-actions"

export default function AlternativeActionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Alternative Actions</h1>
          <p className="text-gray-600 mt-2">Try alternative methods to connect to Google Sheets</p>
        </div>
        <AlternativeActions />
      </div>
    </main>
  )
}
