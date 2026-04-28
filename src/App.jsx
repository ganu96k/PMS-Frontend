import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Login        = lazy(() => import("./sections/Login/Login"));
const Dashboard    = lazy(() => import("./sections/Dashboard/Dashboard"));
const Reports      = lazy(() => import("./sections/Reports/Reports"));
const ExpenseManagement = lazy(() => import("./sections/ExpenseManagement/ExpenseManagement"));
const IncomeManagement  = lazy(() => import("./sections/IncomeManagement/IncomeManagement"));
const TaskManagement    = lazy(() => import("./sections/Tasks/TaskManagement"));
const Loans             = lazy(() => import("./sections/Loans/Loans"));
const Settings          = lazy(() => import("./sections/Settings/Settings"));
const Registration      = lazy(() => import("./sections/Registration/Registration"));
const Contact           = lazy(() => import("./sections/Contact/Contact"));
const Footer            = lazy(() => import("./sections/Footer/Footer"));
const Hero              = lazy(() => import("./sections/Hero/Hero"));
const Projects          = lazy(() => import("./sections/Projects/Projects"));
const Skills            = lazy(() => import("./sections/Skills/Skills"));
const Gallery           = lazy(() => import("./sections/Gallery/Gallery"));
const Education         = lazy(() => import("./sections/Education/Education"));
const Certificates      = lazy(() => import("./sections/Certificates/Certificates"));
const Assets            = lazy(() => import("./sections/Assets/Assets"));
const Salesforce        = lazy(() => import("./sections/Salesforce/Salesforce"));

// Page loader animation
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: '8px', background: '#f8fafc',
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: '50%', background: '#2563eb',
          animation: 'bounce 1.4s infinite ease-in-out both',
          animationDelay: `${[-0.32, -0.16, 0][i]}s`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:scale(0.6);opacity:0.5}
          40%{transform:scale(1);opacity:1}
        }
      `}</style>
    </div>
  );
}

// Home page component
function Home() {
  return (
    <>
      <Hero />
      <Education />
      <Skills />
      <Certificates />
      <Projects />
      <Assets />
      <Contact />
      <Gallery />
      <Footer />
    </>
  );
}

// Private route wrapper
function PrivateRoute({ children }) {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/expenses"  element={<PrivateRoute><ExpenseManagement /></PrivateRoute>} />
        <Route path="/income"    element={<PrivateRoute><IncomeManagement /></PrivateRoute>} />
        <Route path="/tasks"     element={<PrivateRoute><TaskManagement /></PrivateRoute>} />
        <Route path="/loans"     element={<PrivateRoute><Loans /></PrivateRoute>} />
        <Route path="/reports"   element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/settings"  element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/certificates" element={<PrivateRoute><MainLayout><Certificates /></MainLayout></PrivateRoute>} />
        <Route path="/salesforce" element={<PrivateRoute><Salesforce /></PrivateRoute>} />
        {/* Redirect unknown routes to dashboard if logged in */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
