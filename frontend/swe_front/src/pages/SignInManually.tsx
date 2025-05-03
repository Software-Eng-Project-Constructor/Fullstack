import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

axios.defaults.withCredentials = true;

function SignIn() {
  const emailRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);
  const [showPassword, setShowPassword] = useState(false); //show password thing

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validEmail || !validPassword) {
      errRef.current?.focus();
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/signin",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("LOGIN SUCCESS:", response.data);
      // alert(`Welcome, ${response.data.user.name}!`);

      navigate("/dashboard");
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      setErrorMsg(err?.response?.data?.message || "Login failed.");
      errRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[#111113]/80 p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-gray-400 mb-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-gray-300 hover:text-white">
              Sign up
            </Link>
          </p>

          <p ref={errRef} className="text-red-500 text-sm h-5 mb-2">
            {errorMsg}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-3 bg-[#1C1C1C]/80 border border-gray-700 rounded-lg text-white"
                ref={emailRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-red-500 text-xs h-4 p-1">
                {!validEmail && email ? "Enter a valid email address." : ""}
              </p>
            </div>

            <div className="relative">
              <label className="block text-gray-300 font-medium mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full p-3 bg-[#1C1C1C]/80 border border-gray-700 rounded-lg text-white pr-16"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center text-sm text-gray-400 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <p className="text-red-500 text-xs h-4 p-1">
                {!validPassword && password
                  ? "Must be 8-24 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char."
                  : ""}
              </p>
            </div>

            <button
              type="submit"
              className="w-full p-3 mt-4 bg-gray-200 text-black text-lg font-medium rounded-lg transition hover:bg-white"
              disabled={!validEmail || !validPassword}
            >
              Log in
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SignIn;
