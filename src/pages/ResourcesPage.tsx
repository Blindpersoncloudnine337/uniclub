import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ResourceCard from '../components/cards/ResourceCard';

const ResourcesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const categories = ['All', 'Documents', 'Tutorials', 'Tools', 'Videos', 'Recent'];

  // Fetch resources from API instead of using hardcoded data
  const { data: resourcesData, isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await fetch('/api/resources?status=approved');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      return data.resources || data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Transform API data to match ResourceCard props
  const resources = resourcesData?.map((resource: any) => ({
    id: resource._id,
    title: resource.title,
    type: resource.type,
    downloadCount: resource.downloadCount || 0,
    views: resource.views || 0,
    likes: resource.likes || 0,
    fileSize: resource.fileSize,
    isApproved: resource.isApproved,
    thumbnailUrl: resource.thumbnailUrl,
    category: resource.category,
    description: resource.description,
    tags: resource.tags || [],
    linkUrl: resource.linkUrl,
    fileUrl: resource.fileUrl,
    // Set reasonable defaults based on type since these fields don't exist in MongoDB
    estimatedTime: resource.type === 'Video' ? '30-45 min' : 
                 resource.type === 'Tutorial' ? '20-30 min' : '15-20 min',
    difficulty: resource.type === 'Document' ? 'Beginner' :
               resource.type === 'Tutorial' ? 'Intermediate' : 'Beginner',
    author: resource.uploadedBy?.name || 'AI Club Team'
  })) || [];

  const filteredResources = selectedCategory === 'All' 
    ? resources 
    : selectedCategory === 'Recent'
      ? resources.slice(0, 3)
      : resources.filter((resource: any) => resource.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
          
          {/* View Mode Toggle */}
          <div className="flex bg-blue-200 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {!isLoading && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 text-center border border-blue-200 dark:border-gray-700">
              <div className="text-xl font-bold text-emerald-600 mb-1">{resources.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 text-center border border-blue-200 dark:border-gray-700">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                {resources.filter((r: any) => r.type === 'Document').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Docs</div>
            </div>
            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 text-center border border-blue-200 dark:border-gray-700">
              <div className="text-xl font-bold text-emerald-500 mb-1">
                {resources.filter((r: any) => r.type === 'Tutorial').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tutorials</div>
            </div>
            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 text-center border border-blue-200 dark:border-gray-700">
              <div className="text-xl font-bold text-purple-500 mb-1">
                {resources.filter((r: any) => r.type === 'Tool').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tools</div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 pb-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid/List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-blue-300 dark:border-gray-700 rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Failed to load resources. Please try again later.</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Try changing your filter or check back later for new resources.</p>
        </div>
      ) : (
        <div 
          className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
              : 'space-y-4'
          }
        >
          {filteredResources.map((resource: any) => (
            <ResourceCard
              key={resource.id}
              {...resource}
              isCompact={viewMode === 'list'}
            />
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
