import React from "react";
import { motion } from "framer-motion";
import { Mail, Briefcase, GraduationCap, Award } from "lucide-react";

const SKILLS = [
  { name: "التصميم البصري", level: 95 },
  { name: "الذكاء الاصطناعي التوليدي", level: 90 },
  { name: "التصوير السينمائي", level: 85 },
  { name: "تصميم الهوية البصرية", level: 92 },
  { name: "الإخراج الإبداعي", level: 88 },
];

const TOOLS = ["Midjourney", "Runway", "Photoshop", "After Effects", "Blender"];

const HEADSHOT = "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/a8b85fa80_IMG_0256.jpg";

function SkillBar({ name, level, delay }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-foreground text-sm">{name}</span>
        <span className="text-primary text-xs font-cinzel">{level}%</span>
      </div>
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
}

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="relative py-24 px-6" dir="rtl">
      {/* Light overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/10 to-background" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-foreground mb-3">
            البورتفوليو
          </h2>
          <div className="w-12 h-px bg-primary/40 mx-auto" />
        </motion.div>

        {/* Bio Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-8 mb-16"
        >
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
            <img src={HEADSHOT} alt="Turki Ghazi" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-right">
            <h3 className="font-cinzel text-xl text-foreground mb-2">تركي غازي</h3>
            <p className="text-primary text-sm tracking-wider mb-3 font-cinzel">
              مصمم بصري متخصص في الذكاء الاصطناعي
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              مبدع بصري يمزج بين التقنية والفن لخلق تجارب رقمية فريدة. متخصص في إنتاج المحتوى البصري باستخدام أدوات الذكاء الاصطناعي المتقدمة.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-6 mb-16"
        >
          <div className="border border-border rounded-lg p-6 text-center">
            <p className="font-cinzel text-3xl md:text-4xl text-primary font-bold">+50</p>
            <p className="text-muted-foreground text-sm mt-2">مشروع</p>
          </div>
          <div className="border border-border rounded-lg p-6 text-center">
            <p className="font-cinzel text-3xl md:text-4xl text-primary font-bold">3+</p>
            <p className="text-muted-foreground text-sm mt-2">سنوات خبرة</p>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="font-cinzel text-lg text-foreground mb-6 tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            المهارات
          </h3>
          {SKILLS.map((skill, i) => (
            <SkillBar key={skill.name} {...skill} delay={i * 0.1} />
          ))}
        </motion.div>

        {/* Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="font-cinzel text-lg text-foreground mb-6 tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            الأدوات
          </h3>
          <div className="flex flex-wrap gap-3">
            {TOOLS.map((tool) => (
              <span
                key={tool}
                className="border border-border px-4 py-2 text-sm text-foreground rounded-full hover:border-primary/50 transition-colors"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="font-cinzel text-lg text-foreground mb-6 tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            التعليم والشهادات
          </h3>
          <div className="space-y-4">
            <div className="border-r-2 border-primary/40 pr-4">
              <p className="text-foreground text-sm font-medium">بكالوريوس تصميم جرافيك</p>
              <p className="text-muted-foreground text-xs mt-1">جامعة الملك سعود</p>
            </div>
            <div className="border-r-2 border-primary/40 pr-4">
              <p className="text-foreground text-sm font-medium">شهادة احترافية في AI للتصميم</p>
              <p className="text-muted-foreground text-xs mt-1">Coursera / Google</p>
            </div>
          </div>
        </motion.div>

        {/* Open for Work Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-primary/10 border border-primary/30 rounded-lg p-8 text-center mb-10"
        >
          <p className="text-primary font-cinzel text-lg mb-2 tracking-wider">
            مفتوح للفرص الوظيفية والتعاون
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            أبحث عن فرص إبداعية في مجال التصميم البصري والذكاء الاصطناعي
          </p>
          <a
            href="mailto:hello@turkighazi.com"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 text-sm tracking-widest hover:bg-primary/90 transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
            تواصل معي
          </a>
        </motion.div>
      </div>
    </section>
  );
}