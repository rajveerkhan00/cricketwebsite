"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function ComplaintMechanism() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1 py-16 px-6 md:px-12 max-w-5xl mx-auto flex flex-col gap-10 font-outfit">
        {/* Title */}
        <div className="text-center flex flex-col gap-4">
          <div className="inline-flex items-center justify-center gap-2 self-center px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold tracking-widest uppercase">
            Dispute &amp; Support Redressal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space text-slate-900">
            Customer Complaint <span className="text-amber-600">Handling Mechanism</span>
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
            At CriOverlay, customer satisfaction and transparent grievance redressal are our highest priorities. We maintain a structured, multi-tier complaint resolution framework.
          </p>
          <p className="text-xs text-slate-400 font-semibold">
            In compliance with Consumer Protection Standards and SafePay Merchant Guidelines
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-8 md:p-12 flex flex-col gap-8 leading-relaxed text-slate-700">
          
          {/* Resolution Timeline Visual */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <h3 className="text-lg font-bold font-space text-slate-900 mb-6 text-center">
              Our 3-Step Resolution Procedure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Step 1 */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                    01
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    Within 24 Hours
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">Acknowledgment</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upon receiving your complaint via email or phone, an automated tracking ID &amp; formal acknowledgment are issued within 24 hours.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                    02
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    24 – 48 Hours
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">Investigation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our technical and billing specialists evaluate the issue, review transaction logs with SafePay, and diagnose any software defects.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                    03
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    3 – 5 Business Days
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">Resolution</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The matter is conclusively resolved via technical patch, license adjustment, replacement, or financial refund via SafePay.
                </p>
              </div>

            </div>
          </div>

          {/* Section 1: Channels */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900">
              1. Channels for Submitting a Complaint
            </h2>
            <p className="text-sm md:text-base">
              Customers may lodge inquiries, technical grievances, or billing complaints through any of the following official channels:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  📞
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Telephone Hotline</h4>
                  <a href="tel:03704788581" className="text-sm text-amber-600 font-bold hover:underline block mt-0.5">
                    03704788581 / +92 370 4788581
                  </a>
                  <span className="text-[11px] text-slate-500">Mon - Sat: 9:00 AM - 9:00 PM PKT</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  ✉️
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Official Email</h4>
                  <a href="mailto:crioverlay@gmail.com" className="text-sm text-amber-600 font-bold hover:underline block mt-0.5">
                    crioverlay@gmail.com
                  </a>
                  <span className="text-[11px] text-slate-500">24/7 Monitored Inbox</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Required Information */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900">
              2. Information Required When Lodging a Complaint
            </h2>
            <p className="text-sm md:text-base">
              To expedite resolution, please ensure your submission includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-sm md:text-base">
              <li>Full customer name and registered account email address.</li>
              <li>SafePay transaction reference ID (or Order ID starting with <code>SP-</code>).</li>
              <li>A clear, detailed description of the difficulty or grievance encountered.</li>
              <li>Supporting screenshots, video recordings, or browser console errors (if technical).</li>
            </ul>
          </section>

          {/* Section 3: Escalation Framework */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900">
              3. Internal Escalation Matrix
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                <strong>Level 1 (Customer Support Specialist):</strong> Receives the ticket, acknowledges within 24 hours, and provides immediate troubleshooting or billing clarification.
              </p>
              <p>
                <strong>Level 2 (Lead Technical &amp; Product Lead - Rashid):</strong> Escalated if the issue relates to custom overlays, API failures, or OBS synchronization hurdles.
              </p>
              <p>
                <strong>Level 3 (Grievance Officer &amp; Founder - Shahzaib):</strong> Final executive review for unresolved commercial disputes, policy appeals, or formal refund arbitrations.
              </p>
            </div>
          </section>

          {/* Section 4: Consumer Rights in Pakistan */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold font-space text-slate-900">
              4. External Redressal &amp; Governing Law
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                If a dispute cannot be resolved through our internal mechanism within 15 business days, customers retain full legal rights under the <strong>Punjab Consumer Protection Act 2005</strong> and may approach the Consumer Protection Courts of Lahore, Pakistan.
              </p>
              <p>
                All transactions and grievances are strictly governed by the substantive laws of the <strong>Islamic Republic of Pakistan</strong>.
              </p>
            </div>
          </section>

          {/* Contact Box */}
          <div className="mt-4 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-xl">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Need to lodge a complaint now?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Reach out directly to our dedicated grievance team at <strong className="text-slate-800">crioverlay@gmail.com</strong> or call <strong className="text-slate-800">03704788581</strong>.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-xs"
            >
              Open Contact Form
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
