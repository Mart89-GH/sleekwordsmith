import React from 'react';
import { Button } from "@/components/ui/button";

interface PageNavigationProps {
  pages: Array<{ id: string }>;
  currentPage: number;
  onPageChange: (index: number) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({ pages, currentPage, onPageChange }) => {
  return (
    <div className="mb-4 flex gap-2">
      {pages.map((_, index) => (
        <Button
          key={index}
          variant={currentPage === index ? "default" : "outline"}
          onClick={() => onPageChange(index)}
        >
          Page {index + 1}
        </Button>
      ))}
    </div>
  );
};

export default PageNavigation;