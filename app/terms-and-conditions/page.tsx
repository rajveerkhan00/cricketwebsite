"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1 py-16 px-6 md:px-12 max-w-5xl mx-auto flex flex-col gap-10 font-outfit">
        {/* Title */}
        <div className="text-center flex flex-col gap-4">
          <div className="inline-flex items-center justify-center gap-2 self-center px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold tracking-widest uppercase">
            Legal Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-space text-slate-900">
            Terms and <span className="text-amber-600">Conditions</span>
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
            Please read these Terms and Conditions carefully before accessing or using our website and services.
          </p>
          <p className="text-xs text-slate-400 font-semibold">
            Last Updated: January 2026
          </p>
        </div>

        {/* Legal Document Content */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-8 md:p-12 flex flex-col gap-8 leading-relaxed text-slate-700">
          
          {/* Section 1 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">1</span>
              Introduction
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                <strong>a.</strong> This website is owned and operated by <strong>CriOverlay</strong> (hereinafter and throughout this website referred to as &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo;). Our registered office and principal place of business is located at <strong>Lahore, Punjab, Pakistan</strong>.
              </p>
              <p>
                <strong>b.</strong> We offer this website, including all information, tools, products, overlay software, and services available from this website to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
              </p>
              <p>
                <strong>c.</strong> If you have any problems placing your order on our website, or require support after placing an order through our website, please contact us by calling us on <a href="tel:03704788581" className="text-amber-600 font-semibold hover:underline">03704788581</a> (<a href="tel:+923704788581" className="text-amber-600 hover:underline">+92 370 4788581</a>) or send us an email at <a href="mailto:crioverlay@gmail.com" className="text-amber-600 font-semibold hover:underline">crioverlay@gmail.com</a>.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">2</span>
              Applicability and Updates
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                <strong>a.</strong> By visiting our site and/or purchasing something from us, you engage in our &ldquo;Service&rdquo; and agree to be bound by the following terms and conditions (&ldquo;Terms and Conditions&rdquo;), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms and Conditions apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
              <p>
                <strong>b.</strong> In consideration of your use of our website and services, you represent that you are of legal age to form a binding contract and are not a person barred from receiving products and services under the laws of Pakistan or other applicable jurisdiction.
              </p>
              <p>
                <strong>c.</strong> We may need to update our Terms and Conditions from time to time; each time you place an order on our website you will be agreeing to the latest version of our Terms and Conditions.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">3</span>
              Terms of Usage
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                <strong>a.</strong> You are prohibited from using this website or its content:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>for any unlawful purpose;</li>
                <li>to solicit others to perform or participate in any unlawful acts;</li>
                <li>to violate any international, federal, provincial or state laws, regulations and rules;</li>
                <li>to infringe upon or violate our intellectual property rights or the intellectual property rights of others;</li>
                <li>to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability;</li>
                <li>to submit false or misleading information;</li>
                <li>to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the service or interfere with or circumvent the security features of our service, any related website, other websites, or the internet;</li>
                <li>to collect or track the personal information of others or spam, phish, pharm, pretext, spider, crawl, or scrape; or</li>
                <li>for any obscene or immoral purpose.</li>
              </ul>
              <p>
                <strong>b.</strong> We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">4</span>
              Intellectual Property
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                This website and its related software and content (including images, scoreboard designs, graphics, and OBS overlays) are the intellectual property of and are exclusively owned by <strong>CriOverlay</strong>. The structure, organization, and code of the website and its related software contain valuable trade secrets and confidential information of <strong>CriOverlay</strong>. Except as expressly stated herein, these terms and conditions do not grant you any intellectual property rights whatsoever in the website and its related software and all rights are reserved by <strong>CriOverlay</strong>.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">5</span>
              Indemnity and Limitation of Liability
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                <strong>a.</strong> You agree to indemnify us, defend and hold us harmless and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys&rsquo; fees, made by any third-party due to or arising out of your breach of these Terms and Conditions or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.
              </p>
              <p>
                <strong>b.</strong> Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
              </p>
              <p>
                <strong>c.</strong> Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.
              </p>
              <p>
                <strong>d.</strong> To the extent permitted by law, we also disclaim all warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, title and non-infringement.
              </p>
              <p>
                <strong>e.</strong> We reserve the right to not process an order that you place on our website. This is usually for the following reasons:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
                <li>We no longer hold stock of the goods or services that you ordered from us.</li>
                <li>We are unable to ship goods or deliver services to your location.</li>
                <li>The goods or services that you have ordered are no longer available.</li>
                <li>Any reason outside of our control.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">6</span>
              Termination
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                We may immediately change or terminate your access to our products, services and this website, or any online membership(s) with us, with or without notice, at any time, without liability to you, any other user or any third party. We reserve the right to terminate your access if, without limitation, you have: (1) provided us with false or misleading registration information; (2) interfered with other users or the administration of our services or websites; (3) upon a request by law enforcement or other governmental authorities; or (4) otherwise violated these Terms and Conditions.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-3 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">7</span>
              Severability and Waiver
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                If any portion of these terms is found to be unenforceable, the unenforceable portion will be deemed amended to the minimum extent necessary to make it enforceable, and if it can&rsquo;t be made enforceable, then it will be severed and the remaining portion will remain in full force and effect. If we fail to enforce any of these terms, it will not be considered a waiver. Any amendment to or waiver of these terms must be made in writing and signed by us.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold font-space text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">8</span>
              Governing Law
            </h2>
            <div className="space-y-3 text-sm md:text-base">
              <p>
                Our Terms and Conditions are governed by the laws of the Islamic Republic of Pakistan and you agree that the courts of <strong>Lahore, Pakistan</strong> (including any consumer court) will have exclusive jurisdiction in any dispute that you have with us.
              </p>
            </div>
          </section>

          {/* Additional helpful links */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-5 rounded-xl text-sm">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-900">Have questions about our terms?</span>
              <span className="text-slate-500">Contact our support team anytime at crioverlay@gmail.com or 03704788581.</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/refund-policy"
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:border-amber-500 hover:text-amber-600 transition-colors"
              >
                Refund Policy
              </Link>
              <Link
                href="/complaint-mechanism"
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:border-amber-500 hover:text-amber-600 transition-colors"
              >
                Complaint Handling
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
