import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, Input } from "@nextui-org/react";
import { CalendarIcon, ArrowLongLeftIcon, ArrowLongRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameMonth, isSameDay, isAfter, isBefore, format, eachDayOfInterval, isWithinInterval, subDays, subYears } from 'date-fns';

interface DateRangePickerProps {
  onChange: (start: Date, end: Date) => void;
}

const presets = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'last90', label: 'Last 90 days' },
  { key: 'last365', label: 'Last 365 days' },
  { key: 'lastYear', label: 'Last year' },
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onChange }) => {
  const today = useMemo(() => new Date(), []);
  const [dateRange, setDateRange] = useState({ start: subDays(today, 6), end: today });
  const [calendarMonths, setCalendarMonths] = useState({ left: startOfMonth(subMonths(today, 1)), right: startOfMonth(today) });
  const [isOpen, setIsOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [selectedPreset, setSelectedPreset] = useState<string>('last7');

  useEffect(() => {
    onChange(dateRange.start, dateRange.end);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTempDateRange(dateRange);
      updateCalendarMonths(dateRange.start, dateRange.end);
    }
  }, [isOpen, dateRange]);

  const updateCalendarMonths = useCallback((start: Date, end: Date) => {
    const currentMonth = startOfMonth(today);
    const startMonth = startOfMonth(start);
    const endMonth = startOfMonth(end);

    if (isSameMonth(endMonth, currentMonth)) {
      // If end date is in the current month, show current month on the right and previous month on the left
      setCalendarMonths({
        left: subMonths(currentMonth, 1),
        right: currentMonth
      });
    } else if (isSameMonth(startMonth, endMonth)) {
      // If start and end are in the same month (e.g., for 'Last month'), show that month on the left and the next month on the right
      setCalendarMonths({
        left: startMonth,
        right: addMonths(startMonth, 1)
      });
    } else {
      // Otherwise, show the start month on the left and end month on the right
      setCalendarMonths({
        left: startMonth,
        right: endMonth
      });
    }
  }, [today]);

  const handlePresetSelect = useCallback((key: string) => {
    let start: Date, end: Date;
    const currentMonth = startOfMonth(today);
    switch (key) {
      case 'today': start = end = today; break;
      case 'yesterday': start = end = subDays(today, 1); break;
      case 'last7': start = subDays(today, 6); end = today; break;
      case 'last30': start = subDays(today, 29); end = today; break;
      case 'thisMonth': 
        start = currentMonth;
        end = today;
        break;
      case 'lastMonth': 
        start = startOfMonth(subMonths(currentMonth, 1));
        end = endOfMonth(subMonths(currentMonth, 1));
        break;
      case 'last90': start = subDays(today, 89); end = today; break;
      case 'last365': start = subDays(today, 364); end = today; break;
      case 'lastYear':
        start = startOfYear(subYears(today, 1));
        end = endOfYear(subYears(today, 1));
        break;
      default: return;
    }
    setTempDateRange({ start, end });
    updateCalendarMonths(start, end);
    setSelectedPreset(key);
  }, [today, updateCalendarMonths]);

  const handleDateClick = useCallback((day: Date) => {
    setTempDateRange(prev => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: day, end: null };
      } else {
        return isBefore(day, prev.start) 
          ? { start: day, end: prev.start }
          : { start: prev.start, end: day };
      }
    });
    setSelectedPreset('');
  }, []);

  const handleMonthNavigation = useCallback((direction: 'left' | 'right') => {
    const modifier = direction === 'left' ? subMonths : addMonths;
    setCalendarMonths(prev => ({
      left: modifier(prev.left, 1),
      right: modifier(prev.right, 1)
    }));
  }, []);

  const renderCalendar = useCallback((month: Date, isLeftCalendar: boolean) => {
    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

    return (
      <div className="w-64">
        <Input
          type="text"
          value={format(isLeftCalendar ? (tempDateRange.start || dateRange.start) : (tempDateRange.end || dateRange.end), 'MMM d, yyyy')}
          readOnly
          className="mb-2"
        />
        <div className="flex justify-between items-center mb-2">
          {isLeftCalendar && (
            <button onClick={() => handleMonthNavigation('left')} className="p-1">
              <ArrowLongLeftIcon className="w-4 h-4" />
            </button>
          )}
          <span className="flex-1 text-center">{format(month, 'MMMM yyyy')}</span>
          {!isLeftCalendar && (
            <button onClick={() => handleMonthNavigation('right')} className="p-1">
              <ArrowLongRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <div key={day} className="text-center text-sm font-medium">{day}</div>
          ))}
          {days.map(day => {
            const isSelected = (tempDateRange.start && isSameDay(day, tempDateRange.start)) || 
                               (tempDateRange.end && isSameDay(day, tempDateRange.end));
            const isInRange = tempDateRange.start && tempDateRange.end && 
                              isWithinInterval(day, { start: tempDateRange.start, end: tempDateRange.end }) &&
                              !isSameDay(day, tempDateRange.start) && !isSameDay(day, tempDateRange.end);
            const isDisabled = isAfter(day, today);
            return (
              <button
                key={day.toString()}
                onClick={() => !isDisabled && handleDateClick(day)}
                className={`w-8 h-8 rounded-full ${
                  isSelected ? 'bg-blue-500 text-white' : 
                  isInRange ? 'bg-[rgb(69,69,69)] text-white' :
                  isDisabled ? 'text-[rgb(112,112,112)] cursor-not-allowed' : 'hover:bg-[#27272C] hover:text-white'
                }`}
                disabled={isDisabled}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [tempDateRange, dateRange, today, handleDateClick, handleMonthNavigation]);

  const handleApply = useCallback(() => {
    if (tempDateRange.start && tempDateRange.end) {
      setDateRange(tempDateRange as { start: Date; end: Date });
      onChange(tempDateRange.start, tempDateRange.end);
      setIsOpen(false);
    }
  }, [tempDateRange, onChange]);

  return (
    <Popover 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
      placement="bottom-end"
      shouldCloseOnBlur={false}
      shouldCloseOnInteractOutside={(element) => !element.closest('.popover-content')}
    >
      <PopoverTrigger>
        <Button 
          variant="bordered" 
          endContent={<CalendarIcon className="h-4 w-4" />}
        >
          {`${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content">
        <div className="p-4 flex flex-col">
          <div className="flex">
            <div className="w-40 pr-4 border-r border-[#27272C]">
              {presets.map(preset => (
                <Button
                  key={preset.key}
                  variant="light"
                  className={`py-0.5 mb-0.5 w-full justify-between text-sm ${selectedPreset === preset.key ? 'bg-[#27272C]' : ''}`}
                  onPress={() => handlePresetSelect(preset.key)}
                >
                  {preset.label}
                  {selectedPreset === preset.key && <CheckIcon className="h-3 w-3" />}
                </Button>
              ))}
            </div>
            <div className="pl-4">
              <div className="flex space-x-4">
                {renderCalendar(calendarMonths.left, true)}
                {renderCalendar(calendarMonths.right, false)}
              </div>
            </div>
          </div>
          <div className="border-t border-[#27272C] pt-4 mt-4 flex justify-end">
            <Button variant="light" onPress={() => setIsOpen(false)} className="mr-2">Cancel</Button>
            <Button color="primary" onPress={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;