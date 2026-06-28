import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SnippetProvider } from './contexts/SnippetContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyProfile from './pages/MyProfile';
import FolderDetail from './pages/FolderDetail';
import Explore from './pages/Explore';
import PublicProfile from './pages/PublicProfile';
import PublicFolderDetail from './pages/PublicFolderDetail';
import About from './pages/About';
import Friends from './pages/Friends';
import Chat from './pages/Chat';

import ToastContainer from './components/ToastContainer';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route
            path="/profile/:username/folder/:folderId"
            element={<PublicFolderDetail />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-profile/folder/:folderId"
            element={
              <ProtectedRoute>
                <FolderDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:friendId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SnippetProvider>
          <ChatProvider>
            <AppContent />
            <ToastContainer />
          </ChatProvider>
        </SnippetProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;