import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { StatsDashboard } from './components/StatsDashboard';
import { parseCSV, calculateStats } from './services/dataProcessor';
import { generateBillingStory } from './services/geminiService';
import { saveAnalysisToDB } from './services/dbService';
import { ProcessedStats, LoadingState } from './types';
import ReactMarkdown from 'react-markdown';
import { BookOpen, RotateCcw, AlertCircle, Loader2, Sparkles, Database, CheckCircle } from 'lucide-react';

const App = () => {
  const [stats, setStats] = useState<ProcessedStats | null>(null);
  const [story, setStory] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const processFile = async (file: File) => {
    setLoadingState(LoadingState.PROCESSING);
    setError(null);
    setStats(null);
    setStory('');
    setDbStatus('idle');

    try {
      // 1. Parse CSV
      const records = await parseCSV(file);
      if (records.length === 0) {
        throw new Error("No records found in CSV.");
      }

      // 2. Calculate Stats
      const computedStats = calculateStats(records);
      setStats(computedStats);

      // 3. Generate Story
      setLoadingState(LoadingState.GENERATING_STORY);
      
      let aiStory = '';
      try {
        aiStory = await generateBillingStory(computedStats);
        setStory(aiStory);
      } catch (aiError: any) {
        console.error("AI Generation failed:", aiError);
        const fallbackMsg = `**Error generating story:** ${aiError.message}. \n\nThe statistics are still valid and displayed correctly.`;
        setStory(fallbackMsg);
        aiStory = fallbackMsg; // Use fallback for DB
      }
      
      setLoadingState(LoadingState.COMPLETED);

      // 4. Save to Supabase (Background Process)
      if (aiStory && computedStats) {
        setDbStatus('saving');
        saveAnalysisToDB(computedStats, aiStory)
          .then(() => setDbStatus('saved'))
          .catch((err) => {
            console.error("DB Save failed", err);
            setDbStatus('error');
          });
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleReset = () => {
    setStats(null);
    setStory('');
    setError(null);
    setLoadingState(LoadingState.IDLE);
    setDbStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Billing Storyteller AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* DB Status Indicator */}
            {loadingState === LoadingState.COMPLETED && (
              <div className="flex items-center gap-1.5 text-xs font-medium animate-in fade-in">
                {dbStatus === 'saving' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-gray-500">Saving...</span>
                  </>
                )}
                {dbStatus === 'saved' && (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600">Saved to DB</span>
                  </>
                )}
                {dbStatus === 'error' && (
                  <>
                    <Database className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-500">Save Failed</span>
                  </>
                )}
              </div>
            )}

            {loadingState !== LoadingState.IDLE && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                disabled={loadingState === LoadingState.PROCESSING || loadingState === LoadingState.GENERATING_STORY}
              >
                <RotateCcw className="w-4 h-4" />
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 shadow-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Analysis Failed</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* IDLE State: Upload */}
        {loadingState === LoadingState.IDLE && (
          <div className="max-w-2xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Turn Data into Narrative</h2>
              <p className="text-lg text-gray-600">
                Upload your billing CSV and let AI uncover the story behind the numbers.
                Visualize trends and get executive-level insights in seconds.
              </p>
            </div>
            <FileUploader onFileSelect={processFile} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
               <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 font-bold">1</div>
                 <p className="font-medium text-gray-700">Upload CSV</p>
               </div>
               <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                 <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 font-bold">2</div>
                 <p className="font-medium text-gray-700">AI Processing</p>
               </div>
               <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600 font-bold">3</div>
                 <p className="font-medium text-gray-700">Save & Report</p>
               </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loadingState === LoadingState.PROCESSING || loadingState === LoadingState.GENERATING_STORY) && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin relative z-10"></div>
            </div>
            <h3 className="mt-8 text-xl font-semibold text-gray-800">
              {loadingState === LoadingState.PROCESSING ? 'Processing Data...' : 'Crafting Your Story...'}
            </h3>
            <p className="mt-2 text-gray-500 max-w-sm text-center">
              {loadingState === LoadingState.PROCESSING 
                ? 'Parsing records and calculating financial statistics.' 
                : 'AI is analyzing trends, identifying anomalies, and writing the executive report.'}
            </p>
          </div>
        )}

        {/* Results State */}
        {(loadingState === LoadingState.COMPLETED || (loadingState === LoadingState.ERROR && stats)) && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left Column: Stats & Charts */}
            <div className="lg:col-span-2 space-y-8">
              <StatsDashboard stats={stats} />
            </div>

            {/* Right Column: AI Story */}
            <div className="lg:col-span-1">
               <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]">
                 <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center gap-2 flex-shrink-0">
                   <Sparkles className="w-5 h-5 text-yellow-300" />
                   <h2 className="text-white font-semibold text-lg">AI Insights</h2>
                 </div>
                 <div className="p-6 overflow-y-auto prose prose-sm prose-blue max-w-none flex-grow">
                   {story ? (
                     <ReactMarkdown>{story}</ReactMarkdown>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                       <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-400" />
                       <p>Finalizing report...</p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;