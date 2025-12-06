import { Calendar, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, subDays } from 'date-fns';

interface TransmissionDateTimeFilterProps {
  selectedDate: string;
  selectedHour: string;
  onDateChange: (date: string) => void;
  onHourChange: (hour: string) => void;
}

export const TransmissionDateTimeFilter = ({
  selectedDate,
  selectedHour,
  onDateChange,
  onHourChange,
}: TransmissionDateTimeFilterProps) => {
  // Generate last 7 days for date filter
  const dateOptions = [
    { value: 'all', label: 'All (Last 7 Days)' },
    { value: format(new Date(), 'yyyy-MM-dd'), label: 'Today' },
    { value: format(subDays(new Date(), 1), 'yyyy-MM-dd'), label: 'Yesterday' },
  ];

  // Add individual dates for the past 7 days
  for (let i = 2; i < 7; i++) {
    const date = subDays(new Date(), i);
    dateOptions.push({
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM d, yyyy'),
    });
  }

  // Generate hour options
  const hourOptions = [
    { value: 'all', label: 'All Hours' },
    { value: '0', label: '12 AM' },
    { value: '1', label: '1 AM' },
    { value: '2', label: '2 AM' },
    { value: '3', label: '3 AM' },
    { value: '4', label: '4 AM' },
    { value: '5', label: '5 AM' },
    { value: '6', label: '6 AM' },
    { value: '7', label: '7 AM' },
    { value: '8', label: '8 AM' },
    { value: '9', label: '9 AM' },
    { value: '10', label: '10 AM' },
    { value: '11', label: '11 AM' },
    { value: '12', label: '12 PM' },
    { value: '13', label: '1 PM' },
    { value: '14', label: '2 PM' },
    { value: '15', label: '3 PM' },
    { value: '16', label: '4 PM' },
    { value: '17', label: '5 PM' },
    { value: '18', label: '6 PM' },
    { value: '19', label: '7 PM' },
    { value: '20', label: '8 PM' },
    { value: '21', label: '9 PM' },
    { value: '22', label: '10 PM' },
    { value: '23', label: '11 PM' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Date Filter */}
      <Select value={selectedDate} onValueChange={onDateChange}>
        <SelectTrigger className="w-full sm:w-[220px] border-2 border-foreground rounded-xl font-bold bg-card">
          <Calendar className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select date" />
        </SelectTrigger>
        <SelectContent className="bg-card border-2 border-foreground rounded-xl z-50">
          {dateOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="font-medium cursor-pointer hover:bg-primary/10"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Time Filter */}
      <Select value={selectedHour} onValueChange={onHourChange}>
        <SelectTrigger className="w-full sm:w-[180px] border-2 border-foreground rounded-xl font-bold bg-card">
          <Clock className="w-4 h-4 mr-2" />
          <SelectValue placeholder="All Hours" />
        </SelectTrigger>
        <SelectContent className="bg-card border-2 border-foreground rounded-xl z-50 max-h-[300px]">
          {hourOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="font-medium cursor-pointer hover:bg-primary/10"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
