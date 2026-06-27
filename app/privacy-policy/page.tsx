"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#03041c] text-white font-sans">
      <Header />

      <main className="flex-1 py-20 px-6 md:px-12 max-w-5xl mx-auto flex flex-col gap-10 font-outfit">
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space">
            Privacy <span className="text-amber-500">Policy</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-3xl mx-auto leading-relaxed">
            We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard it.
          </p>
        </div>

        <div className="bg-[#07092e] border border-zinc-800/60 rounded-xl p-8 md:p-10 flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-xl border border-zinc-800/60 bg-[#0b1038] p-6">
            <h2 className="text-2xl font-bold font-space text-zinc-100">Website Owners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Shahzaib", role: "Founder & Lead Strategist" },
                { name: "Rashid", role: "Founder & Product Lead" },
              ].map((owner, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-800/60 bg-[#121542] p-4">
                  <p className="text-lg font-semibold text-white">{owner.name}</p>
                  <p className="text-sm text-amber-500">{owner.role}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold font-space text-zinc-100">Information We Collect</h2>
            <p className="text-zinc-300 leading-relaxed">
              When you visit our website, sign up for services, or contact us, we may collect personal details such as your name, email address, phone number, billing information, and usage data needed to provide our scoring and streaming services.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold font-space text-zinc-100">How We Use Your Information</h2>
            <p className="text-zinc-300 leading-relaxed">
              We use your information to process payments, create and manage your account, deliver services, respond to inquiries, improve our platform, and communicate important updates related to your subscription or service request.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold font-space text-zinc-100">Data Security</h2>
            <p className="text-zinc-300 leading-relaxed">
              We take reasonable technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no online system can be guaranteed 100% secure.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold font-space text-zinc-100">Cookies and Analytics</h2>
            <p className="text-zinc-300 leading-relaxed">
              Our website may use cookies and analytics tools to understand visitor behavior, improve site performance, and personalize your experience. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold font-space text-zinc-100">Your Rights</h2>
            <p className="text-zinc-300 leading-relaxed">
              You may request access to, correction of, or deletion of your personal information at any time, subject to applicable law and service requirements. Please contact us if you would like to make such a request.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold font-space text-zinc-100">Contact Us</h2>
            <p className="text-zinc-300 leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us at support@CricOverlay.com.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
