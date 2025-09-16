"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ProjectResultsProps = {
  onNext: () => void;
  onPrevious: () => void;
};

export function ProjectResults({ onNext, onPrevious }: ProjectResultsProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0">
            <div className="w-full h-full rounded-full border-4 border-gray-200"></div>

            <div
              className="w-full h-full rounded-full absolute top-0 left-0 
                          border-4 border-transparent border-t-blue-500
                          animate-spin"
            ></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce text-4xl">🐿️</div>
          </div>
        </div>
        <h3 className="mt-8 text-lg font-medium text-gray-900">
          Processing Results
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Our busy squirrel is crunching the numbers...
        </p>
      </div>
    );
  }

  return (
    <div>
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Project Resource Estimation
        </h2>
        <p>Your results will be displayed here...</p>
      </Card>

      <div className="flex items-center justify-between mt-8 pt-4 border-t">
        <Button variant="outline" onClick={onPrevious} className="px-8">
          Previous
        </Button>
        <Button onClick={onNext} className="px-8 bg-black hover:bg-gray-800">
          Continue
        </Button>
      </div>
    </div>
  );
}
