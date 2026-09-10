"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function RefundPolicy() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1 py-16 px-6 md:px-12 max-w-5xl mx-auto flex flex-col gap-10 font-outfit">
        {/* Title */}
        <div className="text-center flex flex-col gap-4">
          <div className="inline-flex items-center justify-center gap-2 self-center px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-widest uppercase">
            Customer Guarantee
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space text-slate-900">
            Refund &amp; <span className="text-amber-600">Cancellation</span> Policy
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
            We are dedicated to providing the highest quality cricket scoring overlays and broadcast tools. Please review our policies regarding order cancellations and refunds.
          </p>
          <p className="text-xs text-slate-400 font-semibold">
            Last Updated: January 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-8 md:p-12 flex flex-col gap-8 leading-relaxed text-slate-700">
          
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-bold text-slate-900 font-space text-base">Instant Order Delivery</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Subscriptions and overlay access keys are unlocked immediately upon successful SafePay payment verification.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                ⏱
              </div>
              <h3 className="font-bold text-slate-900 font-space text-base">7-Day Refund Window</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Eligible refund requests submitted within 7 days of purchase are processed with zero penalty.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                💳
              </div>
              <h3 className="font-bold text-slate-900 font-space text-base">Direct SafePay Reversal</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Refunds are credited directly back to your original debit / credit card within 5–10 business days.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900">1. Order Cancellation Policy</h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                <strong>a. Digital Services &amp; Subscriptions:</strong> You may cancel your subscription or order at any time through your account dashboard or by notifying our support team.
              </p>
              <p>
                <strong>b. Pre-Activation Cancellation:</strong> If you place an order and request cancellation before your digital license or overlay key is activated, a 100% full refund will be issued immediately.
              </p>
              <p>
                <strong>c. Recurring Plans:</strong> For recurring billing plans, canceling your plan prevents any future automated charges. You will retain access to your active plan features until the end of your current paid billing period.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900">2. Refund Eligibility Criteria</h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>We provide full or partial refunds under the following verified circumstances:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Technical Malfunction:</strong> If the CriOverlay software or scoreboard integration experiences persistent verified technical failure that our technical team cannot resolve within 24 hours.</li>
                <li><strong>Duplicate Billing:</strong> If your card was accidentally charged more than once for the same transaction via the SafePay gateway.</li>
                <li><strong>Service Incompatibility:</strong> If your broadcast setup or software (e.g., OBS Studio, vMix, Streamlabs) is demonstrably incompatible with our service and you report it within 7 days of purchase.</li>
                <li><strong>Accidental Renewal:</strong> If you intended to cancel your subscription prior to renewal and contact us within 48 hours of the billing charge without utilizing active match overlays.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900">3. Non-Refundable Situations</h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>Refunds cannot be issued under the following circumstances:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Requests submitted after the 7-day initial purchase window has lapsed.</li>
                <li>Accounts suspended or terminated due to a violation of our Terms of Usage (e.g. sharing license keys, malicious activities).</li>
                <li>Third-party match cancellation, bad weather, or issues arising solely from external internet connectivity failure on the user&rsquo;s end.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900">4. How to Request a Refund or Cancellation</h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                To request a refund or cancel an active order, please contact our billing department with the following information:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs md:text-sm font-mono text-slate-800 space-y-1">
                <p>1. Your registered account email address</p>
                <p>2. SafePay Transaction ID / Order ID (e.g. SP-XXXXXX)</p>
                <p>3. Date and amount of the purchase</p>
                <p>4. Brief explanation of the refund/cancellation request</p>
              </div>
              <p className="mt-2">
                Submit your request via email to <a href="mailto:crioverlay@gmail.com" className="text-amber-600 font-bold hover:underline">crioverlay@gmail.com</a> or call our customer service hotline directly at <a href="tel:03704788581" className="text-amber-600 font-bold hover:underline">03704788581</a> (<a href="tel:+923704788581" className="text-amber-600 hover:underline">+92 370 4788581</a>).
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold font-space text-slate-900">5. Refund Processing Timeline</h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                Once your refund request is received and approved by our support team:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Approval Notification:</strong> You will receive an email confirmation within <strong>24 business hours</strong>.</li>
                <li><strong>Gateway Reversal:</strong> The reversal is executed through the <strong>SafePay</strong> payment gateway immediately upon approval.</li>
                <li><strong>Bank Processing:</strong> Depending on your issuing bank or card issuer (Visa, Mastercard, UnionPay, PayPak), the refunded funds will reflect on your statement within <strong>5 to 10 business days</strong>.</li>
              </ul>
            </div>
          </section>

          {/* Footer Callout */}
          <div className="mt-4 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-amber-50/60 border border-amber-200 p-5 rounded-xl text-sm">
            <div>
              <p className="font-bold text-slate-900">Need immediate assistance with a payment?</p>
              <p className="text-slate-600 text-xs mt-0.5">
                Our support team is available 7 days a week via phone: <strong>03704788581</strong> or email: <strong>crioverlay@gmail.com</strong>.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap"
            >
              Contact Support
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
