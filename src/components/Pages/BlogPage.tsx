import React, { useState } from 'react';
import { BLOG_POSTS } from '../../data/blogData';
import { BlogPost } from '../../types';
import { BookOpen, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBack }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Articles</span>
        </button>

        <article className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <span>{selectedPost.category}</span>
            <span>•</span>
            <span>{selectedPost.readTime}</span>
            <span>•</span>
            <span>{selectedPost.publishedAt}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {selectedPost.title}
          </h1>

          <div className="flex items-center gap-3 py-3 border-y border-slate-100 dark:border-slate-800">
            <img src={selectedPost.author.avatar} alt={selectedPost.author.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedPost.author.name}</div>
              <div className="text-[10px] text-slate-500">{selectedPost.author.role}</div>
            </div>
          </div>

          <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-80 object-cover rounded-2xl" />

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {selectedPost.content}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Productivity & AI Insights Blog
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Master document analysis, prompt engineering, and PDF automation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BLOG_POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <img src={post.imageUrl} alt={post.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/60 mt-4">
              <span>{post.publishedAt}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
