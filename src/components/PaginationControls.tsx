import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

// Interface for any paginated data from your backend
interface Page<T> {
    content: T[];
    totalPages: number;
    number: number; // This is the current page index (0-based)
}

interface PaginationControlsProps {
    page: Page<any> | null;
    onPageChange: (pageNumber: number) => void;
}

export function PaginationControls({ page, onPageChange }: PaginationControlsProps) {
    if (!page || page.totalPages <= 1) {
        return null; // Don't render controls if there's only one page or no data
    }

    const currentPage = page.number;
    const totalPages = page.totalPages;

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <span className="text-sm text-gray-400">
                Page {currentPage + 1} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(0)}
                disabled={currentPage === 0}
                className="bg-transparent hover:bg-purple-700"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="bg-transparent hover:bg-purple-700"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="bg-transparent hover:bg-purple-700"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="bg-transparent hover:bg-purple-700"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
}