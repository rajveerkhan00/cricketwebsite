import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Videos from "./components/Videos";
import Footer from "./components/Footer";
import Integrations from "./components/Integrations";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#03041c] text-white font-sans">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
        <div className="w-full border-t border-zinc-800/40" />
        <Services />
        <div className="w-full border-t border-zinc-800/40" />
        <Videos />
        <Footer />
        <Integrations />
      </main>
    </div>
  );
}






