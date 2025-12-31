import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getAllRecords, importRecords, clearAllRecords, getGenderPreference, setGenderPreference } from '../services/localStorageService';
import { exportToCSV, downloadCSV, parseCSV, readFileAsText } from '../utils/exportUtils';
import {
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  Github,
  Info,
  AlertTriangle,
  Users,
} from 'lucide-react';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load gender preference on mount
  useEffect(() => {
    const loadGender = async () => {
      const savedGender = await getGenderPreference();
      setGender(savedGender);
    };
    loadGender();
  }, []);

  // Handle gender change
  const handleGenderChange = async (newGender: 'male' | 'female') => {
    try {
      await setGenderPreference(newGender);
      setGender(newGender);
      setMessage({ type: 'success', text: `Gender preference updated to ${newGender}` });
    } catch (error) {
      console.error('Failed to update gender:', error);
      setMessage({ type: 'error', text: 'Failed to update gender preference' });
    }
  };

  // Export handler
  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    
    try {
      const records = await getAllRecords();
      
      if (records.length === 0) {
        setMessage({ type: 'error', text: 'No records to export' });
        return;
      }
      
      const csv = exportToCSV(records);
      const filename = `trackmysalah_export_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csv, filename);
      
      setMessage({ type: 'success', text: `Exported ${records.length} records` });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ type: 'error', text: 'Export failed. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  // Import handler
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setMessage(null);
    
    try {
      const content = await readFileAsText(file);
      const records = parseCSV(content);
      
      if (records.length === 0) {
        setMessage({ type: 'error', text: 'No valid records found in file' });
        return;
      }
      
      const imported = await importRecords(records);
      setMessage({ type: 'success', text: `Imported ${imported} records` });
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({ type: 'error', text: 'Import failed. Please check your file format.' });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Clear data handler
  const handleClearData = async () => {
    try {
      await clearAllRecords();
      setMessage({ type: 'success', text: 'All data cleared' });
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Clear failed:', error);
      setMessage({ type: 'error', text: 'Failed to clear data' });
    }
  };

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customize your experience
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Appearance
            </h2>
          </div>
          
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              ) : (
                <Sun className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              )}
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? 'Currently on' : 'Currently off'}
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Preferences
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Gender</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Affects available prayer status options
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleGenderChange('male')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  gender === 'male'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => handleGenderChange('female')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  gender === 'female'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Female
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Data Management
            </h2>
          </div>
          
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">
                {exporting ? 'Exporting...' : 'Export Data (CSV)'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download your prayer records
              </p>
            </div>
          </button>
          
          {/* Import */}
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 disabled:opacity-50"
          >
            <Upload className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">
                {importing ? 'Importing...' : 'Import Data (CSV)'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Restore from a previous export
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Clear Data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Clear All Data</p>
              <p className="text-sm opacity-70">
                Permanently delete all records
              </p>
            </div>
          </button>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              About
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🕌</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">TrackMySalah</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A simple, privacy-focused Progressive Web App to help you track your daily prayers.
              All data is stored locally on your device.
            </p>
            
            <a
              href="https://github.com/AdamJeddy/Track-My-Salah"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Your data never leaves your device. TrackMySalah uses local storage only - 
            no accounts, no servers, complete privacy.
          </p>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Clear All Data?
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete all your prayer records. This action cannot be undone.
              Consider exporting your data first.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
