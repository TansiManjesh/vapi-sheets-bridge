import { SheetCreatorWithLogs } from "@/components/sheet-creator-with-logs"

export default function CreateSheetPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Google Sheet</h1>
          <p className="text-gray-600 mt-2">Create a new Google Sheet for the Honda Feedback System</p>
        </div>
        <SheetCreatorWithLogs />
      </div>
    </main>
  )
}
