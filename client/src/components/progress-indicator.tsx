import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-600">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
        
        {/* Step Indicators */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                    : isCurrent
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              <span 
                className={`mt-2 text-xs font-medium text-center max-w-16 ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}