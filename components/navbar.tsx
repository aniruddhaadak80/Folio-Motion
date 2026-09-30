"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about" },
  { name: "Projects", path: "/#projects" },
  { name: "Skills", path: "/#skills" },
  { name: "Experience", path: "/#experiences" },
  { name: "Contact", path: "/#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-charcoal/85 backdrop-blur-md shadow-lg border-b border-charcoal-border/80"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2 group"
          >
            <span className="h-8 w-8 rounded-xl bg-crimson/20 border border-crimson/40 flex items-center justify-center text-cream font-black text-xs shadow-[0_0_15px_rgba(196,30,58,0.3)] group-hover:border-crimson transition-colors">
              SK
            </span>
            <span className="font-display font-extrabold text-cream">Subrat</span>
            <span className="text-crimson font-bold">Sahoo</span>
          </Link>

          <div className="hidden md:flex items-center space-x-7">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-cream",
                  pathname === item.path
                    ? "text-cream font-semibold"
                    : "text-[#baa89d]"
                )}
              >
                {item.name}
                {pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-gradient-to-r from-crimson to-cream-gold rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/#contact" className="hidden sm:inline-block">
              <Button
                size="sm"
                className="bg-crimson/20 hover:bg-crimson text-cream border border-crimson/40 rounded-full text-xs px-4 shadow-[0_0_15px_rgba(196,30,58,0.25)] transition-all"
              >
                Let&apos;s Connect
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full text-cream hover:bg-white/5"
              aria-label="Toggle mobile menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? "auto" : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden bg-charcoal/95 backdrop-blur-md border-b border-charcoal-border md:hidden"
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "py-2 text-base font-medium transition-colors hover:text-cream",
                pathname === item.path
                  ? "text-cream font-semibold"
                  : "text-[#baa89d]"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
}
