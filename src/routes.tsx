import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
import SocialPage from './pages/SocialPage';
import ResourcesPage from './pages/ResourcesPage';
import SettingsPage from './pages/SettingsPage';
import ArticlePage from './pages/ArticlePage';
import EventDetailPage from './pages/EventDetailPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import CommentsPage from './pages/CommentsPage';
import AuthPage from './pages/AuthPage';
import DebugPage from './pages/DebugPage';
import SavedPostsPage from './pages/SavedPostsPage';
import PastEventDetailPage from './pages/PastEventDetailPage';
import NotificationsPage from './pages/NotificationsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/saved-posts" element={<SavedPostsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/article/:id" element={<ArticlePage />} />
      <Route path="/news/:id" element={<ArticlePage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/past-events/:id" element={<PastEventDetailPage />} />
      <Route path="/resource/:id" element={<ResourceDetailPage />} />
      <Route path="/comments/:type/:id" element={<CommentsPage />} />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/" element={<Homepage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/social" element={<SocialPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
};

export default AppRoutes; 