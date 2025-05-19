import { SetupGuide } from "@/components/setup-guide"
import { SheetCreator } from "@/components/sheet-creator"

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Honda Feedback System Setup</h1>
          <p className="text-gray-600 mt-2">Configure your Google Sheets integration</p>
        </div>
        <SetupGuide />
        <SheetCreator />
      </div>
    </main>
  )
}
