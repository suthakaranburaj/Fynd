// src/App.tsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeProvider";
import "./App.css";
import { Navbar } from "./components/common/Navbar";
import {
  Dashboard,
  Login,
  Register,
  Calendar,
  Settings,
  TaskManagement,
  CompanyMembers,
  CompanyTeams,
  MainNotification,
  MessageTemplates,
  Home,
  Reminders
} from "./pages";
import { Toaster } from "@/components/ui/sonner";


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  // <PrivateRoute>
                  //   <Navbar
                  //     isExpanded={isExpanded}
                  //     setIsExpanded={setIsExpanded}
                  //   >
                      <Home />
                  //   </Navbar>
                  // </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <Dashboard />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <Settings />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <Calendar />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <TaskManagement />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/company-teams"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <CompanyTeams />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/company-members"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <CompanyMembers />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <MainNotification />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/templates"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <MessageTemplates />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reminders"
                element={
                  <PrivateRoute>
                    <Navbar
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                    >
                      <Reminders />
                    </Navbar>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
