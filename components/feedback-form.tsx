"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { submitFeedback } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Update the form schema to include all the fields from the spreadsheet
const formSchema = z.object({
  process: z.enum(["sales", "service", "insurance", "amc"], {
    required_error: "Please select a process",
  }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  vehicleNumber: z.string().optional(),
  location: z.string().min(2, { message: "Please enter your location" }),

  // Service specific fields matching the spreadsheet columns
  jobCardExplained: z.enum(["yes", "no", "na"]).optional(),
  advisorBehavior: z.enum(["excellent", "good", "average", "poor"]).optional(),
  additionalWorkExplained: z.enum(["yes", "no", "na"]).optional(),
  estimateProvided: z.enum(["yes", "no", "na"]).optional(),
  serviceQuality: z.enum(["excellent", "good", "average", "poor"]).optional(),
  vehicleCleanliness: z.enum(["excellent", "good", "average", "poor"]).optional(),
  billExplained: z.enum(["yes", "no", "na"]).optional(),
  deliveredOnTime: z.enum(["yes", "no", "na"]).optional(),
  jobConfirmation: z.enum(["yes", "no", "na"]).optional(),
  deliveryCall: z.enum(["yes", "no", "na"]).optional(),

  // Common fields
  additionalFeedback: z.string().optional(),
})

// Update the FormValues type
type FormValues = z.infer<typeof formSchema>

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      process: undefined,
      name: "",
      phone: "",
      vehicleNumber: "",
      location: "",
      jobCardExplained: undefined,
      advisorBehavior: undefined,
      additionalWorkExplained: undefined,
      estimateProvided: undefined,
      serviceQuality: undefined,
      vehicleCleanliness: undefined,
      billExplained: undefined,
      deliveredOnTime: undefined,
      jobConfirmation: undefined,
      deliveryCall: undefined,
      additionalFeedback: "",
    },
  })

  const selectedProcess = form.watch("process")

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)

    try {
      // Check for poor ratings to flag for escalation
      const needsEscalation =
        data.advisorBehavior === "poor" ||
        data.serviceQuality === "poor" ||
        data.vehicleCleanliness === "poor" ||
        data.salesExperience === "poor" ||
        data.salesPersonBehavior === "poor"

      // Add timestamp
      const timestamp = new Date().toISOString()

      await submitFeedback({
        ...data,
        timestamp,
        needsEscalation,
      })

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })

      form.reset()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="process"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="amc">AMC</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your vehicle number (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {selectedProcess === "service" && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">Service Experience</h3>

              <FormField
                control={form.control}
                name="jobCardExplained"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Q1 - Was the job card explained to you?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="na" />
                          </FormControl>
                          <FormLabel className="font-normal">Not Applicable</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advisorBehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Q2 - How would you rate the service advisor's behavior?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalWorkExplained"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Q3 - Was additional work explained properly?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="na" />
                          </FormControl>
                          <FormLabel className="font-normal">Not Applicable</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimateProvided"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Q4 - Was a cost estimate provided?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="na" />
                          </FormControl>
                          <FormLabel className="font-normal">Not Applicable</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Q5 - How would you rate the overall service quality?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleCleanliness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Q7 - How would you rate the cleanliness of your vehicle?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billExplained"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Q8 - Was the bill explained properly?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="na" />
                          </FormControl>
                          <FormLabel className="font-normal">Not Applicable</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveredOnTime"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Q9 - Was your vehicle delivered on time?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="na" />
                          </FormControl>
                          <FormLabel className="font-normal">Not Applicable</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobConfirmation"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Q10 - Did you receive job confirmation?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="na" />
                          </FormControl>
                          <FormLabel className="font-normal">Not Applicable</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryCall"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Q11 - Did you receive a delivery call?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="na" />
                          </FormControl>
                          <FormLabel className="font-normal">Not Applicable</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {selectedProcess === "sales" && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">Sales Experience</h3>

              <FormField
                control={form.control}
                name="salesExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How would you rate your overall sales experience?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesPersonBehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How would you rate the sales person's behavior?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {(selectedProcess === "insurance" || selectedProcess === "amc") && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium">
                {selectedProcess === "insurance" ? "Insurance" : "AMC"} Experience
              </h3>
              <p className="text-sm text-gray-500">
                Please provide your feedback about your {selectedProcess === "insurance" ? "insurance" : "AMC"}{" "}
                experience below.
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="additionalFeedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please share any additional feedback or suggestions"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-[#E40521] hover:bg-[#c70419]" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  )
}
