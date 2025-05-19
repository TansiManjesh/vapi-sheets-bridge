import { CreateNewSheetTool } from "@/components/create-new-sheet-tool"

export default function CreateNewSheetPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Google Sheet</h1>
          <p className="text-gray-600 mt-2">Create a fresh Google Sheet for the Honda Feedback System</p>
        </div>
        <CreateNewSheetTool />
      </div>
    </main>
  )
}
