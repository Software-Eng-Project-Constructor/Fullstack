import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center space-y-7 max-w-screen-lg mx-auto">
        {/* Move Text Section Up */}
        <div className="w-full flex flex-col relative -top-9 self-start space-y-3">
          <p className="text-5xl font-bold">Streamline Your Workflow</p>
          <p className="text-lg text-muted">
            The modern project management tool designed for teams who move fast.
          </p>
        </div>

        {/* Image + Button Section */}
        <div className="w-full flex space-x-2">
          {/* Image */}
          <img
            src="/assets/darkUITilted.png"
            alt="Project Management Dashboard"
            className="w-2/3 rounded-3xl flex-2"
          />

          {/* Button & Text (Lifted to ~70% of Image Height) */}
          <div className="flex-1 flex flex-col justify-end pb-[calc(100%/3)] items-center gap-y-6">
            <p className="text-2xl font-sans">Get started in seconds</p>
            <Button text="Get Started" link="/signup" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
