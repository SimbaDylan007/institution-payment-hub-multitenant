// src/components/SearchFilters.tsx

import { useState } from "react";
import { SearchFiltersType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  // NEW: State to control which accordion items are open
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch({
      ...filters,
      startDate,
      endDate
    });
  };

  const handleReset = () => {
    setFilters({});
    setStartDate(undefined);
    setEndDate(undefined);
    onSearch({}); // Reset parent component's filters too
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "minAmount" || name === "maxAmount") {
      setFilters(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // NEW: Function to toggle all accordion items
  const toggleExpandAll = () => {
    if (openItems.length > 0) {
      setOpenItems([]); // If any are open, close all
    } else {
      setOpenItems(["student", "payment", "date"]); // If all are closed, open all
    }
  };

  return (
      <Card className="dark:bg-[#1A1F2C] dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <span>Payment Filters</span>
            </div>
            {/* REPLACED the faulty Accordion with a simple Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpandAll}
                className="text-xs"
            >
              {openItems.length > 0 ? "Collapse All" : "Expand All"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* The main Accordion now has its value controlled by our state */}
          <Accordion
              type="multiple"
              value={openItems}
              onValueChange={setOpenItems}
              className="w-full space-y-2"
          >
            <AccordionItem value="student" className="border rounded-md dark:border-gray-700">
              <AccordionTrigger className="px-4 py-2">Student Information</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label htmlFor="regNumber">Registration Number</Label><Input id="regNumber" name="regNumber" placeholder="Enter reg number" value={filters.regNumber || ""} onChange={handleInputChange} className="dark:bg-gray-800" /></div>
                  <div className="space-y-1"><Label htmlFor="name">Student Name</Label><Input id="name" name="name" placeholder="Enter student name" value={filters.name || ""} onChange={handleInputChange} className="dark:bg-gray-800" /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="surname">Student Surname</Label><Input id="surname" name="surname" placeholder="Enter student surname" value={filters.surname || ""} onChange={handleInputChange} className="dark:bg-gray-800" /></div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment" className="border rounded-md dark:border-gray-700">
              <AccordionTrigger className="px-4 py-2">Payment Details</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label htmlFor="minAmount">Minimum Amount</Label><Input id="minAmount" name="minAmount" type="number" placeholder="Min amount" value={filters.minAmount || ""} onChange={handleInputChange} className="dark:bg-gray-800" /></div>
                  <div className="space-y-1"><Label htmlFor="maxAmount">Maximum Amount</Label><Input id="maxAmount" name="maxAmount" type="number" placeholder="Max amount" value={filters.maxAmount || ""} onChange={handleInputChange} className="dark:bg-gray-800" /></div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="date" className="border rounded-md dark:border-gray-700">
              <AccordionTrigger className="px-4 py-2">Date Range</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Start Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal dark:bg-gray-800", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent></Popover>
                  </div>
                  <div className="space-y-1">
                    <Label>End Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal dark:bg-gray-800", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent></Popover>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleReset}>Reset</Button>
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white">Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
  );
}