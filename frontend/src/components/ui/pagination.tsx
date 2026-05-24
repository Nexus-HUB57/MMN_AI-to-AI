import { Button } from "./button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Anterior
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange?.(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Próximo
      </Button>
    </div>
  );
}

export const PaginationContent = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>{children}</div>
);

export const PaginationItem = ({ children }: { children?: React.ReactNode }) => <span>{children}</span>;
export const PaginationLink = ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
  <button onClick={onClick} className="px-3 py-1 border rounded hover:bg-gray-100">{children}</button>
);
export const PaginationNext = ({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) => (
  <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>Próximo</Button>
);
export const PaginationPrevious = ({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) => (
  <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>Anterior</Button>
);

export { Button };
