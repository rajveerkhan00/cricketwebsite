"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-toastify";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { name: "HOME", type: "link", href: "/" },
    { name: "Tournaments", type: "badge", href: "/tournaments" },
    { name: "THEMES", type: "link", href: "/themes" },
    { name: "PRICING", type: "link", href: "/pricing" },
    { name: "ABOUT", type: "link", href: "/about" },
    { name: "CONTACT", type: "link", href: "/contact" },
    { name: "Privacy Policy", type: "link", href: "/privacy-policy" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };


  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 border-b border-slate-200/80 px-6 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md select-none font-outfit">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer select-none group">
          <Image
            src="/criclogo.jpeg"
            alt="CriOverlay Logo"
            width={38}
            height={38}
            className="rounded-full border border-slate-200 shadow-sm transition-all duration-300 group-hover:rotate-[15deg] group-hover:scale-105"
          />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 transition-transform duration-300 group-hover:scale-[1.02] font-space">
            Cri<span className="text-amber-500 font-black">Over</span>lay
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-6 font-semibold text-sm tracking-wider font-space">
          {navLinks.map((link) => {
            if (link.type === "badge") {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (link.name === "Tournaments" && !session) {
                      e.preventDefault();
                      toast.warn("Please login to access Tournaments!");
                    }
                  }}
                  className="relative overflow-hidden rounded-md bg-gradient-to-r from-red-500 to-orange-600 px-4 py-2 text-white shadow-md transition-all duration-300 hover:from-red-600 hover:to-orange-700 hover:scale-105 active:scale-95 hover:shadow-orange-500/20"
                >
                  {link.name}
                </Link>
              );
            }
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative py-2 px-1 transition-all duration-300 ease-out hover:text-orange-600 ${active ? "text-orange-600 font-bold" : "text-slate-700"
                  }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons - Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {session ? (
            <>
              <span className="text-slate-700 font-semibold text-sm mr-2">
                Hi, <span className="text-amber-600 font-bold">{session.user?.name}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm tracking-wider py-2.5 px-6 rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm tracking-wider py-2 px-6 rounded-full transition-all duration-200 active:scale-95 shadow-xs"
              >
                LOGIN
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex lg:hidden flex-col gap-1.5 items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span className={`h-0.5 w-6 bg-slate-800 rounded-full transition-transform duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`h-0.5 w-6 bg-slate-800 rounded-full transition-opacity duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-slate-800 rounded-full transition-transform duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-[500px] opacity-100 py-6 mt-4 border-t border-slate-200" : "max-h-0 opacity-0"
          }`}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => {
            if (link.type === "badge") {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (link.name === "Tournaments" && !session) {
                      e.preventDefault();
                      toast.warn("Please login to access Tournaments!");
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="w-full text-center rounded-md bg-gradient-to-r from-red-500 to-orange-600 py-2.5 text-white font-bold shadow-md"
                >
                  {link.name}
                </Link>
              );
            }
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2 text-left font-semibold text-sm tracking-wider transition-colors ${active ? "text-orange-600 border-l-2 border-orange-500 pl-2 font-bold" : "text-slate-700 hover:text-orange-600"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
            {session ? (
              <>
                <div className="text-center text-slate-700 font-semibold text-sm py-1">
                  Hi, <span className="text-amber-600 font-bold">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm tracking-wide bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm tracking-wide bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  LOGIN
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
