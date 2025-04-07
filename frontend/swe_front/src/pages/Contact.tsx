import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto py-12 px-6 flex-grow">
          <h1 className="text-4xl font-bold text-center text-amber-600 mb-6">
            Feel free to contact any of our team
          </h1>
          <p className="text-lg text-gray-300 text-center mb-8">
            We will provide 24/7 excellent support
          </p>
          
          <div className="">
            <div className="bg-white shadow-lg rounded-2xl p-6">
              <h2 className="text-2xl text-center font-semibold text-neutral-800 mb-4">Contacts</h2>
              <p className="text-neutral-600">
                <li>address: campus ring 5</li>
                <li>Phone: +49 001110011000</li>
                <li>email: example@email.com</li> 
              </p>
            </div>
          </div>
    
        </div>

      <Footer />
    </div>
  );
}

export default Contact;
