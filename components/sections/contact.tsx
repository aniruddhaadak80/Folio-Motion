"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FaPaperPlane, FaCheckCircle, FaCopy, FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<"idle" | "success" | "error" | "unconfigured">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formState.name.trim()) newErrors.name = "Name is required";
    if (!formState.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formState.email))
      newErrors.email = "Email is invalid";
    if (!formState.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const constructMailtoUrl = () => {
    const subject = encodeURIComponent(`Portfolio Inquiry from ${formState.name}`);
    const body = encodeURIComponent(
      `Hello Subrat,\n\nName: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}\n\n---\nSent from Portfolio Contact Form`
    );
    return `mailto:ssubratkumar106@gmail.com?subject=${subject}&body=${body}`;
  };

  const constructGmailWebUrl = () => {
    const subject = encodeURIComponent(`Portfolio Inquiry from ${formState.name}`);
    const body = encodeURIComponent(
      `Hello Subrat,\n\nName: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}\n\n---\nSent from Portfolio Contact Form`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=ssubratkumar106@gmail.com&su=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatusMessage("");
    setSmtpStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setSmtpStatus("success");
      } else if (data.needsConfiguration) {
        setIsSubmitting(false);
        setSmtpStatus("unconfigured");
        setStatusMessage(
          "SMTP is enabled! Add your Google App Password to .env.local to enable automated delivery. In the meantime, you can instantly send your message using the buttons below:"
        );
      } else {
        setIsSubmitting(false);
        setSmtpStatus("error");
        setStatusMessage(
          data.error || "SMTP delivery encountered an issue. You can still send your message using the direct links below:"
        );
      }
    } catch (err: unknown) {
      console.error("Mail submission error:", err);
      setIsSubmitting(false);
      setSmtpStatus("error");
      setStatusMessage(
        "Could not connect to the SMTP server. You can send your message directly using the buttons below:"
      );
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ssubratkumar106@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section
      id="contact"
      className="py-28 relative overflow-hidden bg-charcoal"
    >
      {/* Sleek Minimal Section Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-crimson/35 to-transparent" />

      {/* Ambient Sunset Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[500px] bg-crimson/12 rounded-full filter blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-2xl mx-auto bg-charcoal-card/95 border border-charcoal-border rounded-3xl shadow-2xl p-8 sm:p-12 backdrop-blur-md"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          variants={formVariants}
        >
          <div className="text-center mb-8">
            <motion.div
              variants={childVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/15 border border-crimson/30 text-cream text-xs font-semibold uppercase tracking-wider mb-3"
            >
              <span>Direct Connection</span>
            </motion.div>

            <motion.h2
              className="font-display text-4xl sm:text-5xl font-extrabold text-gradient-crimson-cream mb-3"
              variants={childVariants}
            >
              Get in Touch
            </motion.h2>

            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[#baa89d] mt-2" variants={childVariants}>
              <span>Direct inquiries:</span>
              <div className="flex items-center gap-2">
                <a
                  href="mailto:ssubratkumar106@gmail.com"
                  className="text-cream font-semibold hover:underline flex items-center gap-1.5"
                >
                  <FaEnvelope className="text-crimson" />
                  ssubratkumar106@gmail.com
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded bg-charcoal-elevated border border-charcoal-border text-cream/70 hover:text-cream text-xs transition-colors"
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copied ? <span className="text-emerald-400 font-bold px-1">Copied!</span> : <FaCopy />}
                </button>
              </div>
            </motion.div>
          </div>

          {isSubmitted ? (
            <motion.div
              className="text-center py-6 space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <FaCheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-cream-soft">
                Message Sent Successfully!
              </h3>
              <p className="text-sm text-[#baa89d] max-w-md mx-auto leading-relaxed">
                Thank you, <span className="text-cream font-medium">{formState.name}</span>! Your message has been delivered directly to Subrat&apos;s inbox via SMTP. A response will be sent to <span className="text-cream font-medium">{formState.email}</span> shortly.
              </p>

              <div className="pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSmtpStatus("idle");
                    setStatusMessage("");
                    setFormState({ name: "", email: "", message: "" });
                  }}
                  className="text-xs text-cream-gold hover:text-cream border border-charcoal-border bg-charcoal-elevated/80 px-4 py-2 rounded-lg"
                >
                  Send Another Message
                </Button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <motion.div className="space-y-5" variants={formVariants}>
                <motion.div variants={childVariants}>
                  <Label htmlFor="name" className="text-cream font-medium text-xs uppercase tracking-wider mb-1.5 block">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className={`bg-charcoal-elevated border-charcoal-border text-cream placeholder:text-cream/30 focus:border-crimson focus:ring-crimson/30 rounded-xl ${
                      errors.name ? "border-destructive" : ""
                    }`}
                    placeholder="Subrat Kumar Sahoo"
                  />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </motion.div>

                <motion.div variants={childVariants}>
                  <Label htmlFor="email" className="text-cream font-medium text-xs uppercase tracking-wider mb-1.5 block">
                    Your Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    className={`bg-charcoal-elevated border-charcoal-border text-cream placeholder:text-cream/30 focus:border-crimson focus:ring-crimson/30 rounded-xl ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    placeholder="subrat@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </motion.div>

                <motion.div variants={childVariants}>
                  <Label htmlFor="message" className="text-cream font-medium text-xs uppercase tracking-wider mb-1.5 block">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    className={`bg-charcoal-elevated border-charcoal-border text-cream placeholder:text-cream/30 focus:border-crimson focus:ring-crimson/30 rounded-xl ${
                      errors.message ? "border-destructive" : ""
                    }`}
                    rows={4}
                    placeholder="Tell me about your project, idea, or opportunity..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
                </motion.div>

                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                      smtpStatus === "unconfigured"
                        ? "bg-amber-950/40 border-amber-500/30 text-amber-200/90"
                        : "bg-red-950/40 border-red-500/30 text-red-200/90"
                    }`}
                  >
                    <p className="leading-relaxed font-medium">{statusMessage}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={constructGmailWebUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="button"
                          size="sm"
                          className="bg-crimson hover:bg-crimson-glow text-white text-xs gap-1.5 h-8 px-3"
                        >
                          <FaExternalLinkAlt className="h-2.5 w-2.5" />
                          Send via Gmail Web
                        </Button>
                      </a>
                      <a href={constructMailtoUrl()}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-charcoal-border text-cream hover:bg-white/5 text-xs gap-1.5 h-8 px-3"
                        >
                          <FaEnvelope className="h-2.5 w-2.5" />
                          Open Mail Client
                        </Button>
                      </a>
                    </div>
                  </motion.div>
                )}

                <motion.div variants={childVariants} className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-crimson to-[#e64a19] hover:from-crimson-glow hover:to-crimson text-white font-semibold py-6 rounded-xl shadow-[0_0_25px_rgba(196,30,58,0.35)] transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="h-5 w-5 rounded-full border-t-2 border-r-2 border-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Send Message via SMTP
                        <FaPaperPlane className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
