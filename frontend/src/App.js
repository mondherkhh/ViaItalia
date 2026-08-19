import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Accueil from "./pages/Accueil"; // 🔥 ADD THIS
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import StudyForm from "./pages/StudyForm";

function App() {
  const { token, role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main>
      <LanguageProvider>
        <div>
          <Router> {/* 🔥 IMPORTANT */}
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Accueil />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/study-form" element={<StudyForm />} />

              {/* Protected USER Route */}
              <Route
                path="/user-dashboard"
                element={
                  token && role === "USER"
                    ? <UserDashboard />
                    : <Navigate to="/login" />
                }
              />

              {/* Protected ADMIN Route */}
              <Route
                path="/admin-dashboard"
                element={
                  token && role === "ADMIN"
                    ? <AdminDashboard />
                    : <Navigate to="/login" />
                }
              />

            </Routes>
          </Router>
        </div>
      </LanguageProvider>
    </main>
  );
}

export default App;
