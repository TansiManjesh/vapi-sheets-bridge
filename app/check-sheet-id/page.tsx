import { SheetIdChecker } from "@/components/sheet-id-checker"

export default function CheckSheetIdPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Google Sheet ID Checker</h1>
          <p className="text-gray-600 mt-2">Verify that your Google Sheet ID is correctly formatted</p>
        </div>
        <SheetIdChecker />
      </div>
    </main>
  )
}
