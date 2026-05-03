import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Mail, MessageCircle } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Eyebrow from "@/components/brand/Eyebrow";
import Button from "@/components/brand/Button";
import { trackEvent } from "@/utils/trackEvent";

const GOLD = "#C9A961";
const CONTACT_EMAIL = import.meta.env?.VITE_CONTACT_EMAIL || "contact@turkighazi.com";
const WHATSAPP_URL = import.meta.env?.VITE_WHATSAPP_URL || "";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-10 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="تواصل"
        description="تواصل مع تركي غازي — مصمم بصري بالذكاء الاصطناعي. ابدأ مشروعك أو احجز مكالمة."
        canonical="/contact"
      />
      <Link to="/" className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]">الرئيسية</Link>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Eyebrow ar="تواصل" en="Contact" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 font-cormorant text-7xl font-bold leading-none md:text-8xl">
          تواصل معي
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-6 max-w-md font-noto text-base font-normal leading-9 text-[#0B0B0B]">
          إذا عندك فكرة، حملة، فيلم، أو عالم بصري — خلنا نحوله لتجربة سينمائية.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button
            to="/booking"
            variant="secondary"
            size="lg"
            onClick={() => trackEvent("contact_booking_clicked", { event_type: "button_click", section: "contact_hero" })}
          >
            ابدأ مشروعك
          </Button>
          <Button
            href="/cv"
            variant="secondary"
            size="lg"
            icon={Download}
            onClick={() => trackEvent("contact_cv_clicked", { event_type: "button_click", section: "contact_hero" })}
          >
            عرض السيرة
          </Button>
        </motion.div>

        <div className="mt-12 flex gap-4">
          <a
            className="social-icon"
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label="Email"
            onClick={() => trackEvent("contact_email_clicked", { event_type: "button_click", section: "contact_footer" })}
          >
            <Mail />
          </a>
          {WHATSAPP_URL && (
            <a
              className="social-icon"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              onClick={() => trackEvent("contact_whatsapp_clicked", { event_type: "button_click", section: "contact_footer" })}
            >
              <MessageCircle />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}