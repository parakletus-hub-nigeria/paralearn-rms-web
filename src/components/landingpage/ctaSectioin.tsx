"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CTASection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted email:", email);
    setEmail("");
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="w-full px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-primary leading-tight italic">
              Ready to dive in?
              <br />
              Start your free trial today.
            </h1>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 sm:px-6 py-2 font-medium w-fit self-start sm:self-auto sm:mb-1 text-sm sm:text-base">
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Newsletter + Footer Section */}
      <div className="px-4 sm:px-6 pb-8 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 overflow-hidden">
            {/* Decorative curved corners */}
            <div className="absolute top-0 left-0 w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full text-gray-300">
                <path
                  d="M 0 64 Q 0 0 64 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full text-gray-300">
                <path
                  d="M 0 0 Q 64 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full text-gray-300">
                <path
                  d="M 64 64 Q 0 64 0 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full text-gray-300">
                <path
                  d="M 0 64 Q 64 64 64 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>

            <div className="relative flex flex-col items-center sm:flex-row sm:items-center sm:justify-center gap-6 sm:gap-8">
              {/* Newsletter Form */}
              <div className="flex-1 w-full sm:w-auto sm:max-w-sm text-center sm:text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                  <span className="text-primary">Subscribe</span>
                  <span className="text-foreground"> to our Newsletter</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border-gray-300 bg-white px-4 sm:px-5 py-2 sm:py-3 h-10 sm:h-11 text-sm sm:text-base"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-10 font-medium text-sm sm:text-base"
                  >
                    Submit
                  </Button>
                </form>
              </div>

              {/* Footer Links & Social */}
              <div className="flex-1 flex flex-col items-center gap-4 w-full">
                {/* Navigation Links */}
                <nav className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground w-full sm:w-auto justify-center">
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Terms
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Partners
                  </a>
                </nav>

                {/* Social Icons */}
                <div className="flex gap-3 sm:gap-4">
                  {/* X (Twitter) */}
                  <a
                    href="#"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a
                    href="#"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  {/* YouTube */}
                  <a
                    href="#"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  {/* Facebook */}
                  <a
                    href="#"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>

                {/* Copyright */}
                <p className="text-xs text-muted-foreground text-center">
                  © 2024 Parentskite Inc. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
