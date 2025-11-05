import { StepProps } from "@/types/checkout"
import { Check } from "lucide-react"

export function Step({ title, isActive, isCompleted, number }: StepProps) {
  return (
    <div className="flex items-center flex-col sm:flex-row text-center sm:text-left">
      <div
        className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium
        ${
          isCompleted
            ? "bg-primary text-white"
            : isActive
              ? "border-2 border-primary bg-primary/10 text-primary dark:border-white dark:text-white"
              : "border-2 border-gray-200 text-gray-400 dark:border-gray-700"
        }`}
      >
        {isCompleted ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : number}
      </div>
      <span
        className={`sm:ml-2 mt-1 sm:mt-0 text-xs sm:text-sm font-medium leading-tight
        ${isActive || isCompleted ? "text-primary dark:text-white" : "text-gray-400 dark:text-gray-600"}`}
      >
        {title}
      </span>
    </div>
  )
}
