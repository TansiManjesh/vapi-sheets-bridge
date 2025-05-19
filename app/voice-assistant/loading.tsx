import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function VoiceAssistantLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-8 w-64 mx-auto mb-6" />
      <Skeleton className="h-4 w-96 mx-auto mb-8" />

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-[150px]" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </CardHeader>

        <CardContent className="h-[400px] space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <Skeleton className={`h-16 ${i % 2 === 0 ? "w-3/4" : "w-1/2"} rounded-lg`} />
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 p-4 border-t">
          <div className="flex items-center justify-between w-full">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
