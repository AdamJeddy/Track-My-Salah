interface CalendarToggleProps {
  mode: 'gregorian' | 'hijri';
  onModeChange: (mode: 'gregorian' | 'hijri') => void;
}

export function CalendarToggle({ mode, onModeChange }: CalendarToggleProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onModeChange('gregorian')}
        className={`
          flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
          ${mode === 'gregorian'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }
        `}
      >
        Gregorian
      </button>
      <button
        onClick={() => onModeChange('hijri')}
        className={`
          flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
          ${mode === 'hijri'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }
        `}
      >
        Hijri
      </button>
    </div>
  );
}
