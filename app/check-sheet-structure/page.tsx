import { SheetStructureChecker } from "@/components/sheet-structure-checker"

export default function CheckSheetStructurePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Google Sheet Structure Checker</h1>
          <p className="text-gray-600 mt-2">Check if your Google Sheet has the correct structure</p>
        </div>
        <SheetStructureChecker />
      </div>
    </main>
  )
}
