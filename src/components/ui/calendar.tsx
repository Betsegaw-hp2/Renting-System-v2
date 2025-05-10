"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selectedDate,  // Single selected date
  onDateChange,  // Handler to update the selected date
  ...props
}: {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  selectedDate: Date | undefined;  // Single date
  onDateChange: (date: Date | undefined) => void;  // Handler for updating the selected date
}) {
  const [month, setMonth] = React.useState(new Date())

  const handlePreviousMonth = () => {
    setMonth(prevMonth => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(prevMonth.getMonth() - 1)
      return newMonth
    })
  }

  const handleNextMonth = () => {
    setMonth(prevMonth => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(prevMonth.getMonth() + 1)
      return newMonth
    })
  }

  return (
    <div>
      <DayPicker
        selected={selectedDate}  // Single selected date
        onMonthChange={(newMonth) => setMonth(newMonth)}
        mode="single"  // Single mode for selecting one date
        month={month}
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          ...classNames,
        }}
        onSelect={onDateChange}  // Use onSelect for date selection
        footer={selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : "Pick a day."}
        {...props}
      />
      <div className="flex justify-between w-full items-center mt-2">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-full opacity-50 hover:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full opacity-50 hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
