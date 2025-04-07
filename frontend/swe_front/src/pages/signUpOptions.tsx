import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function SignUpOptions() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-[#111113]/80 p-12 rounded-2xl shadow-lg max-w-sm w-full border border-gray-800 text-center">
          {/* Google Sign In Button */}
          <button className="w-full p-3 bg-indigo-600 text-white text-md font-medium rounded-lg transition hover:bg-indigo-700 mb-4">
            Continue with Google
          </button>

          {/* Manual Sign In Button */}
          <Link
            to="/sign-up-manually"
            className="w-full block p-3 bg-[#1C1C1C] text-white text-md font-medium rounded-lg transition hover:bg-gray-800 mb-4"
          >
            Continue With Email
          </Link>

          {/* Terms and Login Link */}

          <p className="text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <Link to="/signin" className="text-gray-300 hover:text-white">
              Log In
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SignUpOptions;
