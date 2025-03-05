// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GitHubLogin from "./pages/GitHubLogin";

import AISectionPage from "./pages/AISectionPage";
import RepoCon from "./pages/Repo connection/rconnection";
import Chatpage from "./pages/ChatPage/chatpage";
import Panduchat from "./pages/ChatPage/panduchat";
import Modeling from "./pages/Diagram page/ModelingFlow";
import GitHubCallback from "./pages/GitHubCallback";
import My from "./pages/repohistory";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* These routes will render without the layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/github/callback" element={<GitHubCallback />} />

          {/* Dashboard route wrapped with Layout */}
          <Route
            path="/dashboard"
            element={
              // <PrivateRoute>

              <Dashboard />

              // </PrivateRoute>
            }
          />
          <Route
            path="/AI section"
            element={
              // <PrivateRoute>

              <AISectionPage />

              // </PrivateRoute>
            }
          />
          <Route
            path="/repo Connection"
            element={
              // <PrivateRoute>

              <RepoCon />

              // </PrivateRoute>
            }
          />
          <Route
            path="/chatpage"
            element={
              // <PrivateRoute>

              <Chatpage />

              // </PrivateRoute>
            }
          />
          <Route
            path="/modeling"
            element={
              // <PrivateRoute>

              <Modeling />

              // </PrivateRoute>
            }
          />

          <Route
            path="/panduchat"
            element={
              // <PrivateRoute>

              <Panduchat />

              // </PrivateRoute>
            }
          />
          <Route
            path="/gitauth"
            element={
              // <PrivateRoute>

              <GitHubLogin />

              // </PrivateRoute>
            }
          />
          <Route
            path="/repo history"
            element={
              // <PrivateRoute>

              <My />

              // </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
