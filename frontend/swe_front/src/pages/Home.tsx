import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center space-y-10 max-w-screen-lg mx-auto px-4 mt-9">
        {/* Text Section */}
        <div className="w-full flex flex-col space-y-3">
          <p className="text-5xl font-bold">Streamline Your Workflow</p>
          <p className="text-lg text-gray-400">
            The modern project management tool designed for teams who move fast.
          </p>
        </div>

        {/* Image + Button Section */}
        <div className="w-full flex flex-col md:flex-row gap-6 mt-6 items-center">
          {/* Image */}
          <img
            src="/assets/darkUITilted.png"
            alt="Project Management Dashboard"
            className="w-full md:w-2/3 rounded-3xl"
          />

          {/* Call-to-Action */}
          <div className="flex flex-col justify-center items-center gap-6">
            <p className="text-2xl font-sans">Get started in seconds</p>
            <Button text="Get Started" link="/signup" />
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center gap-8 mt-4">
          <Button text="About" link="/About" />
          <Button text="Contact" link="/Contact" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
