import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ApiTester from './components/apitester';
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignInManually from "./pages/SignInManually";
import SignUpManually from "./pages/SignUpManually";
import SignUpOptions from "./pages/signUpOptions";
import SignInOptions from "./pages/SignInOptions";
import Dashboard from "./pages/Dashboard";
import axios from "axios";
import Swal from "sweetalert2";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5001";

// Add axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear any existing auth state
      localStorage.removeItem('user');
      
      // Show session expired message
      await Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired. Please log in again.',
        icon: 'warning',
        confirmButtonColor: '#f97316',
      });
      
      // Redirect to signin
      window.location.href = '/signin';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tester" element={<ApiTester />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="signin" element={<SignInOptions />} />
          <Route path="signup" element={<SignUpOptions />} />
          <Route path="sign-up-manually" element={<SignUpManually />} />
          <Route path="sign-in-manually" element={<SignInManually />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
