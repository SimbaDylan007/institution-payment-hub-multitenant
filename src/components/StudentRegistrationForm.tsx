
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { StudentRegistrationRequest } from "@/types";
import { createOrUpdateStudentRegistration } from "@/services/studentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, UserPlus } from "lucide-react";

// Define the validation schema
const studentFormSchema = z.object({
  billerId: z.string().min(1, "Institution ID is required"),
  customerAccount: z.string().min(1, "Registration number is required"),
  customerName: z.string().min(1, "Student name is required"),
  customerAccountDetails1: z.string().optional(),
  customerAccountDetails2: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export default function StudentRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      billerId: "",
      customerAccount: "",
      customerName: "",
      customerAccountDetails1: "",
      customerAccountDetails2: "",
    },
  });

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    console.log("Form submitted with data:", data);
    
    try {
      const request: StudentRegistrationRequest = {
        billerId: data.billerId,
        customerAccount: data.customerAccount,
        customerName: data.customerName,
        customerAccountDetails1: data.customerAccountDetails1 || "",
        customerAccountDetails2: data.customerAccountDetails2 || "",
      };
      
      console.log("Sending request to API:", request);
      const result = await createOrUpdateStudentRegistration(request);
      
      if (result) {
        console.log("Registration successful:", result);
        toast.success("Student registration saved successfully!");
        form.reset();
      } else {
        console.error("Failed to save student registration", result);
        toast.error("Failed to save student registration.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="dark:bg-white dark:text-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Student Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white dark:text-gray-900">Institution ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., MSU" 
                        {...field} 
                        className="text-white dark:text-gray-900 bg-[#1A1F2C] dark:bg-white border-gray-700 dark:border-gray-300" 
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400 dark:text-gray-600">
                      The identifier for the institution.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white dark:text-gray-900">Registration Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., R000258G" 
                        {...field} 
                        className="text-white dark:text-gray-900 bg-[#1A1F2C] dark:bg-white border-gray-700 dark:border-gray-300" 
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400 dark:text-gray-600">
                      Student's registration number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white dark:text-gray-900">Student Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Full name" 
                      {...field} 
                      className="text-white dark:text-gray-900 bg-[#1A1F2C] dark:bg-white border-gray-700 dark:border-gray-300" 
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 dark:text-gray-600">
                    Student's full name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerAccountDetails1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white dark:text-gray-900">Academic Level</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., LEVEL: 1.1" 
                      {...field} 
                      className="text-white dark:text-gray-900 bg-[#1A1F2C] dark:bg-white border-gray-700 dark:border-gray-300" 
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 dark:text-gray-600">
                    Student's academic level or year.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerAccountDetails2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white dark:text-gray-900">Program Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Degree Program"
                      className="resize-none text-white dark:text-gray-900 bg-[#1A1F2C] dark:bg-white border-gray-700 dark:border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400 dark:text-gray-600">
                    Details about the student's degree program.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Student Registration
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
