import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const GALLERY_IMAGES = [
  "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/903d3fe3b_IMG_0268.jpg",
  "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/8ca04bb7d_IMG_0266.jpg",
  "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/1f7df23f8_IMG_0265.jpg",
  "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/c6a4f8523_IMG_0267.jpg",
];

const BTS_IMAGES = [
  "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/c1f9c069a_IMG_0259.jpg",
  "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/b9687a4b0_IMG_0261.jpg",
];

export default function ProjectDetails({ project, onClose }) {
  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
        dir="rtl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="fixed top-6 left-6 z-50 w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-w-3xl mx-auto px-6 py-20">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-lg overflow-hidden mb-10"
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-[50vh] object-cover"
            />
          </motion.div>

          {/* Title & Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-primary text-xs tracking-[0.2em] font-cinzel">
              {project.category}
            </span>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6 tracking-wider">
              {project.title}
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              حملة إبداعية تجمع بين الذكاء الاصطناعي والتصوير السينمائي لإنتاج محتوى بصري فريد يعكس الهوية والرؤية الإبداعية.
            </p>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4 mb-12 border-t border-b border-border py-6">
              <div>
                <p className="text-muted-foreground text-xs mb-1">النوع</p>
                <p className="text-foreground text-sm font-medium">{project.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">الأدوات</p>
                <p className="text-foreground text-sm font-medium">Midjourney, Runway</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">السنة</p>
                <p className="text-foreground text-sm font-medium">2024</p>
              </div>
            </div>
          </motion.div>

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-cinzel text-lg text-foreground mb-4 tracking-wider">المعرض</h3>
            <div className="grid grid-cols-2 gap-3 mb-12">
              {GALLERY_IMAGES.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-40 md:h-52 object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Behind the Scenes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-cinzel text-lg text-foreground mb-4 tracking-wider">خلف الكواليس</h3>
            <div className="grid grid-cols-2 gap-3 mb-12">
              {BTS_IMAGES.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <img src={img} alt={`BTS ${i + 1}`} className="w-full h-40 md:h-52 object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={onClose}
              className="border border-primary/60 text-primary px-8 py-3 text-sm tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-500"
            >
              مشاهدة التفاصيل التقنية
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}