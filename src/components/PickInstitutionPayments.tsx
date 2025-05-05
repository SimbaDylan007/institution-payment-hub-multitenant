
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pickAllPendingPaymentsAPI } from "@/services/paymentService";
import { PaymentAlert } from "@/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PickInstitutionPaymentsProps {
  onPaymentsPicked: () => void;
}

interface InstitutionFormData {
  institutionId: string;
  password: string;
}

export default function PickInstitutionPayments({ onPaymentsPicked }: PickInstitutionPaymentsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pickedPayments, setPickedPayments] = useState<PaymentAlert[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Using react-hook-form for better validation
  const form = useForm<InstitutionFormData>({
    defaultValues: {
      institutionId: "",
      password: ""
    }
  });
  
  const handleSubmit = async (data: InstitutionFormData) => {
    if (!data.institutionId || !data.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await pickAllPendingPaymentsAPI({
        institutionId: data.institutionId,
        password: data.password
      });
      
      setPickedPayments(result);
      setShowResults(true);
      toast.success(`Successfully picked ${result.length} payments`);
      onPaymentsPicked();
    } catch (error) {
      console.error("Error picking payments:", error);
      toast.error("Failed to pick payments. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="institutionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your institution ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Pick All Pending Payments"}
            </Button>
          </form>
        </Form>
        
        {showResults && pickedPayments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Picked Payments</h3>
            <div className="bg-gray-800 p-4 rounded border border-gray-700 dark:bg-gray-100 dark:border-gray-300">
              <p className="text-sm mb-2">{pickedPayments.length} payments were successfully picked.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowResults(false)}
              >
                Hide Results
              </Button>
            </div>
          </div>
        )}
        
        {showResults && pickedPayments.length === 0 && (
          <div className="mt-6">
            <div className="bg-gray-800 p-4 rounded border border-gray-700 dark:bg-gray-100 dark:border-gray-300">
              <p className="text-sm">No pending payments were found for your institution.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => setShowResults(false)}
              >
                Hide Results
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
