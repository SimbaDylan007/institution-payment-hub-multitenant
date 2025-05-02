
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pickAllPendingPayments } from "@/services/paymentService";
import { PaymentAlert } from "@/types";
import { toast } from "sonner";

interface PickInstitutionPaymentsProps {
  onPaymentsPicked: () => void;
}

export default function PickInstitutionPayments({ onPaymentsPicked }: PickInstitutionPaymentsProps) {
  const [institutionId, setInstitutionId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pickedPayments, setPickedPayments] = useState<PaymentAlert[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institutionId || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await pickAllPendingPayments({
        institutionId,
        password
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
        <CardTitle>Pick Pending Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionId">Institution ID</Label>
              <Input
                id="institutionId"
                placeholder="Enter your institution ID"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Pick All Pending Payments"}
            </Button>
          </div>
        </form>
        
        {showResults && pickedPayments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Picked Payments</h3>
            <div className="bg-gray-50 p-4 rounded border">
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
            <div className="bg-gray-50 p-4 rounded border">
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
