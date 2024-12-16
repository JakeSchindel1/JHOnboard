import React from 'react';

interface OnboardingProgressProps {
  currentPage: number;
  totalPages?: number;
  color?: string;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentPage, 
  totalPages = 7,
  color = "#00998e"
}) => {
  const percentage = (currentPage / totalPages) * 100;
  
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex flex-col gap-2">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300 ease-in-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        
        {/* Step indicator */}
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;