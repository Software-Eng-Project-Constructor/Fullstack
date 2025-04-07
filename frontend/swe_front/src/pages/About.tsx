import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About(){
    return(
     <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <div className="max-w-4xl mx-auto py-12 px-6 flex-grow">
          <h1 className="text-4xl font-bold text-center text-amber-600 mb-6">
            About Our Project Management Software
          </h1>
          <p className="text-lg text-gray-300 text-center mb-8">
            Empowering teams with efficient workflows, collaboration tools, and 
            real-time progress tracking.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white shadow-lg rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Our Mission</h2>
              <p className="text-neutral-600">
                Our goal is to streamline project management by providing intuitive
                tools that enhance productivity, communication, and transparency.
              </p>
            </div>
            
            <div className="bg-white shadow-lg rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Key Features</h2>
              <ul className="list-disc pl-6 text-neutral-600">
                <li>Task and milestone tracking</li>
                <li>Collaborative workspace</li>
                <li>Real-time updates and notifications</li>
                <li>Integrated reporting and analytics</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-amber-600 mb-4">Why Choose Us?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our platform is designed for teams of all sizes, ensuring smooth project 
              execution and better outcomes. Whether you're a startup or a large enterprise, 
              we provide the tools you need to succeed.
            </p>
          </div>
        </div>

        <Footer />
     </div>
    )
}

export default About;
