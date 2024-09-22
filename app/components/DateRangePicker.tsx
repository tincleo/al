import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, Input } from "@nextui-org/react";
import { CalendarIcon, ArrowLongLeftIcon, ArrowLongRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameMonth, isSameDay, isAfter, isBefore, format, parse, eachDayOfInterval, isWithinInterval, subDays, subYears } from 'date-fns';

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
  const [startDate, setStartDate] = useState<Date>(subDays(today, 6));
  const [endDate, setEndDate] = useState<Date>(today);
  const [leftMonth, setLeftMonth] = useState(startOfMonth(subDays(today, 6)));
  const [rightMonth, setRightMonth] = useState(startOfMonth(today));
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('last7');

  useEffect(() => {
    // Set initial range and trigger onChange
    onChange(startDate, endDate);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      updateCalendarMonths(startDate, endDate);
    }
  }, [isOpen, startDate, endDate]);

  const updateCalendarMonths = useCallback((start: Date, end: Date) => {
    const currentMonth = startOfMonth(today);
    if (isSameMonth(end, currentMonth) || isAfter(end, currentMonth)) {
      setRightMonth(currentMonth);
      setLeftMonth(subMonths(currentMonth, 1));
    } else {
      setRightMonth(startOfMonth(end));
      setLeftMonth(startOfMonth(start));
    }
  }, [today]);

  const handlePresetSelect = useCallback((key: string) => {
    let start: Date, end: Date;
    switch (key) {
      case 'today':
        start = end = today;
        break;
      case 'yesterday':
        start = end = subDays(today, 1);
        break;
      case 'last7':
        start = subDays(today, 6);
        end = today;
        break;
      case 'last30':
        start = subDays(today, 29);
        end = today;
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = today;
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case 'last90':
        start = subDays(today, 89);
        end = today;
        break;
      case 'last365':
        start = subDays(today, 364);
        end = today;
        break;
      case 'lastYear':
        start = startOfYear(subYears(today, 1));
        end = endOfYear(subYears(today, 1));
        break;
      default:
        return;
    }
    setTempStartDate(start);
    setTempEndDate(end);
    updateCalendarMonths(start, end);
    setSelectedPreset(key);
  }, [today, updateCalendarMonths]);

  const handleDateClick = useCallback((date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(date);
      setTempEndDate(null);
    } else {
      if (isBefore(date, tempStartDate)) {
        setTempStartDate(date);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(date);
      }
    }
    setSelectedPreset(null);
  }, [tempStartDate, tempEndDate]);

  const handleMonthNavigation = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      setLeftMonth(prevMonth => subMonths(prevMonth, 1));
      setRightMonth(prevMonth => subMonths(prevMonth, 1));
    } else {
      setLeftMonth(prevMonth => addMonths(prevMonth, 1));
      setRightMonth(prevMonth => addMonths(prevMonth, 1));
    }
  }, []);

  const renderCalendar = useCallback((month: Date, isLeftCalendar: boolean) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="w-64">
        <Input
          type="text"
          value={format(isLeftCalendar ? (tempStartDate || startDate) : (tempEndDate || endDate), 'MMM d, yyyy')}
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
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
          {days.map(day => {
            const isSelected = (tempStartDate && isSameDay(day, tempStartDate)) || 
                               (tempEndDate && isSameDay(day, tempEndDate));
            const isInRange = tempStartDate && tempEndDate && 
                              isWithinInterval(day, { start: tempStartDate, end: tempEndDate }) &&
                              !isSameDay(day, tempStartDate) && !isSameDay(day, tempEndDate);
            const isDisabled = isAfter(day, today);
            return (
              <button
                key={day.toString()}
                onClick={() => !isDisabled && handleDateClick(day)}
                className={`w-8 h-8 rounded-full ${
                  isSelected ? 'bg-blue-500 text-white' : 
                  isInRange ? 'bg-[rgb(69,69,69)] text-white' :
                  isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-[#27272C]'
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
  }, [tempStartDate, tempEndDate, today, handleDateClick, startDate, endDate, handleMonthNavigation]);

  const formatDisplayDate = useCallback((date: Date) => {
    return format(date, 'MMM d, yyyy');
  }, []);

  const handleApply = useCallback(() => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      onChange(tempStartDate, tempEndDate);
      setIsOpen(false);
    }
  }, [tempStartDate, tempEndDate, onChange]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Popover 
      isOpen={isOpen} 
      onOpenChange={(open) => setIsOpen(open)}
      placement="bottom-end"
      shouldCloseOnBlur={false}
      shouldCloseOnInteractOutside={(element) => {
        return !element.closest('.popover-content');
      }}
    >
      <PopoverTrigger>
        <Button 
          variant="bordered" 
          endContent={<CalendarIcon className="h-4 w-4" />}
        >
          {`${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`}
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
                {renderCalendar(leftMonth, true)}
                {renderCalendar(rightMonth, false)}
              </div>
            </div>
          </div>
          <div className="border-t border-[#27272C] pt-4 mt-4 flex justify-end">
            <Button variant="light" onPress={handleCancel} className="mr-2">Cancel</Button>
            <Button color="primary" onPress={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;