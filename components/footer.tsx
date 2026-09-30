"use client";

import { Github, Linkedin, Mail, FileText, ArrowUp, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/ssubratkumar106-blip",
      color: "hover:text-cream hover:border-crimson/50",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/subrat-kumar-sahoo-277664344",
      color: "hover:text-cream hover:border-crimson/50",
    },
    {
      name: "Email",
      icon: Mail,
      href: "mailto:ssubratkumar106@gmail.com",
      color: "hover:text-cream hover:border-crimson/50",
    },
    {
      name: "Resume",
      icon: FileText,
      href: "/resume.pdf",
      color: "hover:text-cream hover:border-crimson/50",
    },
  ];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Projects", href: "/#projects" },
    { name: "Skills", href: "/#skills" },
    { name: "Experience", href: "/#experiences" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <footer className="w-full border-t border-charcoal-border bg-charcoal text-cream-soft transition-colors duration-300 relative z-10">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start mb-10">
          {/* Identity Column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3.5">
            <div className="flex items-center space-x-3 mb-1">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-crimson/40 shadow-[0_0_15px_rgba(196,30,58,0.25)]">
                <Image
                  src="/images/profile.jpg"
                  alt="Subrat Kumar Sahoo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-cream-soft">Subrat Kumar Sahoo</h3>
                <p className="text-xs text-crimson font-medium">AI &amp; ML Engineer</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#baa89d] max-w-sm leading-relaxed">
              Computer Science undergraduate specializing in Artificial Intelligence, autonomous agents,
              and high-performance web systems.
            </p>

            <div className="text-xs text-[#baa89d] space-y-1.5 pt-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="h-3.5 w-3.5 text-cream-gold shrink-0" />
                <span>Odisha, India • B.Tech CSE (8.95 CGPA)</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="h-3.5 w-3.5 text-cream-gold shrink-0" />
                <a href="tel:+917735355017" className="hover:text-cream transition-colors">
                  +91 7735355017
                </a>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-3.5 w-3.5 text-cream-gold shrink-0" />
                <a href="mailto:ssubratkumar106@gmail.com" className="hover:text-cream transition-colors">
                  ssubratkumar106@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col items-center text-center space-y-3.5">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-cream-soft">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#baa89d] hover:text-cream transition-colors font-medium text-xs sm:text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Social Links & Back to Top */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-cream-soft">
              Connect
            </h4>
            <div className="flex items-center space-x-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full bg-charcoal-card border border-charcoal-border text-cream/80 ${social.color} hover:bg-crimson/20 transition-all`}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </a>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={scrollToTop}
              className="gap-2 text-xs font-semibold rounded-full border-charcoal-border bg-charcoal-card hover:bg-crimson/20 hover:border-crimson/50 text-cream transition-all"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5 text-cream-gold" />
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-charcoal-border/80 pt-7 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c7b70]">
          <p>© {new Date().getFullYear()} Subrat Kumar Sahoo. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Crafted with Next.js, Tailwind CSS &amp; Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
