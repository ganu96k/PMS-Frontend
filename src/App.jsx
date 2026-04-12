import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./sections/Login/Login";
import Dashboard from "./sections/Dashboard/Dashboard";
import Transactions from "./sections/Transactions/Transactions";
import Reports from "./sections/Reports/Reports";
import ExpenseManagement from "./sections/ExpenseManagement/ExpenseManagement";
import Contact from "./sections/Contact/Contact";
import Footer from "./sections/Footer/Footer";
import Hero from "./sections/Hero/Hero";
import Projects from "./sections/Projects/Projects";
import Skills from "./sections/Skills/Skills";
import Registration from "./sections/Registration/Registration";
import Gallery from "./sections/Gallery/Gallery";
import Education from "./sections/Education/Education";
import Certificates from "./sections/Certificates/Certificates";

// Home page component
function Home() {
  return (
    <>
      <Hero />
      <Education />
      <Skills />
      <Certificates />
      <Projects />
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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/expenses" 
        element={
          <PrivateRoute>
            <ExpenseManagement />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;
