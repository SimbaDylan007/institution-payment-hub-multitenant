
import { useState, useEffect } from "react";
import { SearchFilters as SearchFiltersType } from "@/types";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
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
    onSearch({});
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "minAmount" || name === "maxAmount") {
      setFilters(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Update filters when date changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  }, [startDate, endDate]);
  
  return (
    <div className="bg-white p-6 border rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-medium mb-4">Search Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="regNumber">Registration Number</Label>
          <Input
            id="regNumber"
            name="regNumber"
            placeholder="Enter reg number"
            value={filters.regNumber || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Student Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter student name"
            value={filters.name || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="surname">Student Surname</Label>
          <Input
            id="surname"
            name="surname"
            placeholder="Enter student surname"
            value={filters.surname || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minAmount">Minimum Amount</Label>
          <Input
            id="minAmount"
            name="minAmount"
            type="number"
            placeholder="Min amount"
            value={filters.minAmount || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxAmount">Maximum Amount</Label>
          <Input
            id="maxAmount"
            name="maxAmount"
            type="number"
            placeholder="Max amount"
            value={filters.maxAmount || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  );
}
