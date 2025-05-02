
import { Card, CardContent } from "@/components/ui/card";
import { PaymentAlert } from "@/types";

interface StatsProps {
  payments: PaymentAlert[];
}

export default function Stats({ payments }: StatsProps) {
  // Calculate stats from payments data
  const totalPayments = payments.length;
  
  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.amount, 
    0
  ).toFixed(2);
  
  const pendingPayments = payments.filter(
    payment => payment.status === "pending"
  ).length;
  
  const completedPayments = payments.filter(
    payment => payment.status === "completed"
  ).length;
  
  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.transactionDate);
    paymentDate.setHours(0, 0, 0, 0);
    return paymentDate.getTime() === today.getTime();
  }).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{totalPayments}</div>
          <p className="text-sm text-gray-500 mt-1">Total Payments</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">${totalAmount}</div>
          <p className="text-sm text-gray-500 mt-1">Total Amount</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">{completedPayments}</div>
          <p className="text-sm text-gray-500 mt-1">Completed Payments</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-yellow-600">{pendingPayments}</div>
          <p className="text-sm text-gray-500 mt-1">Pending Payments</p>
        </CardContent>
      </Card>
    </div>
  );
}
