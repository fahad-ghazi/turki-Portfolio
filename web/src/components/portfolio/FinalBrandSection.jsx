import React from "react";
import { motion } from "framer-motion";

const PORTAL_IMAGE = "/works/hero-poster.jpg";
const COIN_IMAGE = "/brand/turki-logo.svg";

export default function FinalBrandSection() {
  return (
    <section id="brand" className="relative min-h-screen w-full overflow-hidden flex items-center justify-center" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={PORTAL_IMAGE}
          alt="Turki Studio"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-background/80" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Coin Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-10 rounded-full overflow-hidden border border-primary/30"
        >
          <img src={COIN_IMAGE} alt="TG Logo" className="w-full h-full object-cover" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <p className="text-muted-foreground text-sm mb-4 font-light">
            رحلتك انتهت
          </p>
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-foreground mb-2 tracking-wider">
            والإبداع لا يتوقف
          </h2>
          <div className="w-16 h-px bg-primary/40 mx-auto my-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-cinzel text-2xl md:text-3xl text-primary tracking-[0.15em] mb-4">
            TURKI STUDIO
          </h3>
          <p className="text-muted-foreground text-sm mb-10 font-light">
            نصنع عوالم بصرية بالذكاء الاصطناعي
          </p>

          <a
            href="mailto:hello@turkighazi.com"
            className="inline-block border border-primary/60 text-primary px-8 py-3 text-sm tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-500"
          >
            هل لديك مشروع؟ تواصل معنا
          </a>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground/40 text-xs mt-20 font-cinzel tracking-widest"
        >
          © 2024 TURKI GHAZI — ALL RIGHTS RESERVED
        </motion.p>
      </div>
    </section>
  );
}