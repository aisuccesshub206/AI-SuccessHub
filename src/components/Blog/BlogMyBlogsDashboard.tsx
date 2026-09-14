import React, { useState } from 'react';
import { BlogArticle } from '../../types/blog';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  BarChart2,
  CheckCircle,
} from 'lucide-react';

interface BlogMyBlogsDashboardProps {
  blogs: BlogArticle[];
  onSelectBlog: (blog: BlogArticle) => void;
  onCreateNew: () => void;
  onDeleteBlog: (id: string) => void;
  onDuplicateBlog: (blog: BlogArticle) => void;
}

export const BlogMyBlogsDashboard: React.FC<BlogMyBlogsDashboardProps> = ({
  blogs,
  onSelectBlog,
  onCreateNew,
  onDeleteBlog,
  onDuplicateBlog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.seo.primaryKeyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-500" />
            My Blog Studio Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage, edit, export, and publish your generated AI blog posts ({blogs.length} saved).
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Blog Post</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved blogs by title, topic or keyword..."
          className="w-full px-4 py-3 pl-11 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Blog Cards Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-block">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Blog Articles Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Get started by creating your first AI-optimized blog article!
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Blog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Thumbnail Preview if exists */}
                {blog.featuredImage?.url && (
                  <div className="h-36 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img src={blog.featuredImage.url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  </div>
                )}

                {/* Status & SEO Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {blog.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <BarChart2 className="w-3 h-3" />
                    SEO {blog.seo.seoScore}/100
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {blog.title}
                </h3>

                {/* Meta details */}
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>{blog.wordCount} words</span>
                  <span>•</span>
                  <span>~{blog.readTimeMinutes} min read</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectBlog(blog)}
                  className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit & Export
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDuplicateBlog(blog)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    title="Duplicate Blog"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBlog(blog.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"
                    title="Delete Blog"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
