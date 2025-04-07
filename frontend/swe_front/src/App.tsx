import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignInManually from "./pages/SignInManually";
import SignUpManually from "./pages/SignUpManually";
import SignUpOptions from "./pages/signUpOptions";
import SignInOptions from "./pages/SignInOptions";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AuthProvider> {/* Wrap your app with AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
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
