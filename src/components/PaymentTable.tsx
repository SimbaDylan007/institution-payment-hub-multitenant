import React, { useState } from "react";
import { PaymentAlert, ExportFormat } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { exportPayments, resetPayment } from "@/services/paymentService";
import { toast } from "sonner";

interface PaymentTableProps {
  payments: PaymentAlert[];
  onPaymentReset: (id: string) => void;
}

export default function PaymentTable({ payments, onPaymentReset }: PaymentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const handleResetPayment = async (id: string) => {
    try {
      const result = await resetPayment(id);
      if (result) {
        toast.success("Payment reset successfully");
        onPaymentReset(id);
      } else {
        toast.error("Failed to reset payment");
      }
    } catch (error) {
      console.error("Error resetting payment:", error);
      toast.error("An error occurred while resetting payment");
    }
  };
  
  const handleExport = (format: ExportFormat) => {
    exportPayments(payments, format);
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = payments.slice(startIndex, endIndex);
  
  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few pages
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show limited pages with ellipsis for many pages
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  // Format date from the timestamp object or string
  const formatDate = (dateObj: PaymentAlert['date']) => {
    if (!dateObj) return 'N/A';
    
    // Check if dateObj is a Timestamp object (has time property)
    if (typeof dateObj !== 'string' && 'time' in dateObj) {
      const date = new Date(dateObj.time);
      return date.toLocaleDateString();
    } 
    // If it's a string, try to parse it directly
    else if (typeof dateObj === 'string') {
      try {
        const date = new Date(dateObj);
        return date.toLocaleDateString();
      } catch (e) {
        return dateObj; // Return the original string if parsing fails
      }
    }
    
    return 'N/A'; // Fallback
  };
  
  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Showing {Math.min(startIndex + 1, payments.length)} to {Math.min(endIndex, payments.length)} of {payments.length} payments
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">Reg Number</TableHead>
                <TableHead className="whitespace-nowrap">Student Name</TableHead>
                <TableHead className="whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Reference</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                currentPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.regNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {payment.studentName || 'N/A'} {payment.studentSurname || ''}
                    </TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.transactionDate || formatDate(payment.date)}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell>
                      {payment.status === 'completed' && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleResetPayment(payment.id)}
                        >
                          Reset
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {getPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
