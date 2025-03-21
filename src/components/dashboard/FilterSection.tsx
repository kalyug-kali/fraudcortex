
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TransactionFilters } from '@/types';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
}

const FilterSection = ({ filters, onFilterChange }: FilterSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartDateChange = (date: Date | undefined) => {
    onFilterChange({
      ...filters,
      startDate: date || null
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onFilterChange({
      ...filters,
      endDate: date || null
    });
  };

  const handlePayerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      payerId: e.target.value
    });
  };

  const handlePayeeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      payeeId: e.target.value
    });
  };

  const handleFraudStatusChange = (value: TransactionFilters['fraudStatus']) => {
    onFilterChange({
      ...filters,
      fraudStatus: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      startDate: null,
      endDate: null,
      payerId: '',
      payeeId: '',
      searchQuery: filters.searchQuery,
      fraudStatus: 'all'
    });
  };

  const hasActiveFilters = !!(
    filters.startDate || 
    filters.endDate || 
    filters.payerId || 
    filters.payeeId || 
    filters.fraudStatus !== 'all'
  );

  return (
    <div className="bg-white rounded-xl p-4 card-shadow mb-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </h3>
        <div className="flex space-x-2">
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-xs h-8 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs h-8"
          >
            {isExpanded ? 'Hide' : 'Show'} filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-down">
          {/* Date range */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    format(filters.startDate, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={handleStartDateChange}
                  initialFocus
                  className="rounded-md pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(filters.endDate, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={handleEndDateChange}
                  initialFocus
                  className="rounded-md pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payer/Payee IDs */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Payer ID</label>
            <Input
              value={filters.payerId}
              onChange={handlePayerIdChange}
              placeholder="Enter payer ID"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Payee ID</label>
            <Input
              value={filters.payeeId}
              onChange={handlePayeeIdChange}
              placeholder="Enter payee ID"
              className="h-9"
            />
          </div>

          {/* Fraud Status selector */}
          <div className="space-y-2 md:col-span-2 lg:col-span-4">
            <label className="text-xs font-medium text-gray-500">Fraud Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Transactions' },
                { value: 'predicted', label: 'Predicted Frauds' },
                { value: 'reported', label: 'Reported Frauds' },
                { value: 'mismatch', label: 'Prediction Mismatches' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={filters.fraudStatus === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFraudStatusChange(option.value as TransactionFilters['fraudStatus'])}
                  className="h-8 text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
