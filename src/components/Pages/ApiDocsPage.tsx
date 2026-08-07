import React from 'react';
import { Terminal, Copy, Check, Code, Zap } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase mb-1">
          <Terminal className="w-4 h-4" /> Developer Documentation
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          AI Success Hub REST API v2
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Integrate PDF merging, splitting, AI summarization, and content generation directly into your own applications.
        </p>
      </div>

      <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-emerald-400 font-bold">POST /api/ai/generate-text</span>
          <span className="text-slate-500">Content-Type: application/json</span>
        </div>

        <div>
          <span className="text-slate-400">// Request Payload:</span>
          <pre className="text-indigo-300 mt-1 bg-slate-950 p-3 rounded-xl">
{`{
  "toolType": "summarize",
  "prompt": "Summarize key terms",
  "contextText": "Document content text here...",
  "tone": "Executive"
}`}
          </pre>
        </div>

        <div>
          <span className="text-slate-400">// cURL Example:</span>
          <pre className="text-amber-300 mt-1 bg-slate-950 p-3 rounded-xl overflow-x-auto">
{`curl -X POST "https://aisuccesshub.com/api/ai/generate-text" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"toolType":"summarize","prompt":"Extract action items"}'`}
          </pre>
        </div>
      </div>
    </div>
  );
};
