import React, { useState } from "react";
import { PaymentAlert, ExportFormat } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge for better styling
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
import { Download } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn for better class management

interface PaymentTableProps {
  payments: PaymentAlert[];
  onPaymentReset: (id: string) => void;
}

export default function PaymentTable({ payments, onPaymentReset }: PaymentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- All your existing functionality is preserved ---
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

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = payments.slice(startIndex, endIndex);

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
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

  const formatDate = (dateObj: PaymentAlert['date']) => {
    if (!dateObj) return 'N/A';

    if (typeof dateObj !== 'string' && 'time' in dateObj) {
      const date = new Date(dateObj.time);
      return date.toLocaleDateString();
    }
    else if (typeof dateObj === 'string') {
      try {
        const date = new Date(dateObj);
        return date.toLocaleDateString();
      } catch (e) {
        return dateObj;
      }
    }

    return 'N/A';
  };
  // --- End of preserved functionality ---

  return (
      <div className="w-full">
        <div className="mb-4 flex justify-between items-center">
          <div>
            {/* Text color now adapts to theme */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {Math.min(startIndex + 1, payments.length)} to {Math.min(endIndex, payments.length)} of {payments.length} payments
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Button styling updated to be consistent */}
                <Button variant="outline" className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-400 text-white hover:from-red-600 hover:to-red-500 shadow-md dark:from-red-600 dark:to-red-500 dark:hover:from-red-700 dark:hover:to-red-600">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              {/* Dropdown content now adapts to theme */}
              <DropdownMenuContent className="bg-white border-gray-200 dark:bg-[#1A1F2C] dark:border-gray-800">
                {/* Dropdown items now adapt to theme */}
                <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700">
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700">
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700">
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table container border now adapts to theme */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {/* Table header row background now adapts to theme */}
                <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {/* Table head text color now adapts to theme using a muted foreground color */}
                  <TableHead className="whitespace-nowrap text-muted-foreground">ID</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">Reg Number</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">Student Name</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">Amount</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">Date</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">Status</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">Reference</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-gray-500 dark:text-gray-400">
                        No payments found
                      </TableCell>
                    </TableRow>
                ) : (
                    currentPayments.map((payment) => (
                        <TableRow key={payment.id} className="border-gray-200/80 dark:border-gray-800/80 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          {/* --- CORE FIX FOR CELL TEXT VISIBILITY --- */}
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">{payment.id}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{payment.regNumber || 'N/A'}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">
                            {payment.studentName || 'N/A'} {payment.studentSurname || ''}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">${payment.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{payment.transactionDate || formatDate(payment.date)}</TableCell>
                          <TableCell>
                            {/* Using the Badge component for better styling and contrast */}
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs font-medium border-none", // Base styles
                                    payment.status.toLowerCase() === 'completed'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                )}
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-300">{payment.reference}</TableCell>
                          <TableCell className="text-right">
                            {payment.status.toLowerCase() === 'completed' && (
                                // Reset button now adapts to theme
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white-600 hover:text-white-800 dark:text-white-400 dark:hover:text-white-300"
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