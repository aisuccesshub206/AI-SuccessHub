import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contact & Support</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions or feedback? Our engineering team responds within 24 hours.
        </p>
      </div>

      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Message</label>
            <textarea
              rows={4}
              required
              placeholder="How can we help you?"
              className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send Message
          </button>
        </form>
      ) : (
        <div className="p-8 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 text-center space-y-3">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Message Sent!</h3>
          <p className="text-xs text-slate-500">Thank you for contacting AI Success Hub support. We will get back to you shortly.</p>
        </div>
      )}
    </div>
  );
};
