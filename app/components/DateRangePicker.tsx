import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface DateRangePickerProps {
  onChange: (start: string, end: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    onChange(startDate, endDate);
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button variant="bordered" endContent={<CalendarIcon className="h-4 w-4" />}>
          {startDate && endDate ? `${startDate} - ${endDate}` : 'Select Date Range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-4">
          <div className="flex flex-col gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded p-2"
            />
            <Button color="primary" onPress={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;