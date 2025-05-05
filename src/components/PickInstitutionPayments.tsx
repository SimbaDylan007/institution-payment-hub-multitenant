import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickAllPendingPaymentsAPI,
  pickAllPaymentsAPI
} from "@/services/paymentService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PickInstitutionPaymentsProps {
  onPaymentsPicked: () => void;
}

interface InstitutionFormData {
  institutionId: string;
  password: string;
  actionType: string;
}

export default function PickInstitutionPayments({ onPaymentsPicked }: PickInstitutionPaymentsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pickedPayments, setPickedPayments] = useState<PaymentAlert[]>([]);
  const [showResults, setShowResults] = useState(false);

  const form = useForm<InstitutionFormData>({
    defaultValues: {
      institutionId: "",
      password: "",
      actionType: "pending"
    }
  });

  const handleSubmit = async (data: InstitutionFormData) => {
    if (!data.institutionId || !data.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = data.actionType === "pending"
          ? await pickAllPendingPaymentsAPI({
            institutionId: data.institutionId,
            password: data.password
          })
          : await pickAllPaymentsAPI({
            institutionId: data.institutionId,
            password: data.password
          });

      setPickedPayments(result);
      setShowResults(true);
      toast.success(`Successfully retrieved ${result.length} items`);
      onPaymentsPicked();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to retrieve data. Please check your credentials.");
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
                  name="actionType"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pick All Pending Payments</SelectItem>
                            <SelectItem value="transactions">Pick All Transactions</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                  )}
              />

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
                {isLoading ? "Processing..." :
                    form.watch("actionType") === "pending"
                        ? "Pick All Pending Payments"
                        : "Pick All Transactions"}
              </Button>
            </form>
          </Form>

          {showResults && pickedPayments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">
                  {form.watch("actionType") === "pending"
                      ? "Picked Payments"
                      : "All Transactions"}
                </h3>
                <div className="bg-gray-800 p-4 rounded border border-gray-700 dark:bg-gray-100 dark:border-gray-300">
                  <p className="text-sm mb-2">
                    {pickedPayments.length} {form.watch("actionType") === "pending"
                      ? "payments"
                      : "transactions"} were successfully retrieved.
                  </p>
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
                  <p className="text-sm">
                    {form.watch("actionType") === "pending"
                        ? "No pending payments were found for your institution."
                        : "No transactions were found for your institution."}
                  </p>
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