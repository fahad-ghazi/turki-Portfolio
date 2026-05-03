import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";

const GOLD = "#C9A961";

// Public blog index. Reads `published` posts from the API. While the
// blog is empty we keep noIndex on so search engines don't snapshot
// the empty state. Toggle noIndex to false the moment a real post
// goes live.

export default function Blog() {
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ["blog", "list"],
    queryFn: () => base44.entities.BlogPost.list("-updated_date", 50),
  });

  const hasPosts = posts.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="المدوّنة"
        description="مقالات تركي استديو حول الذكاء الاصطناعي البصري والتصميم السينمائي."
        canonical="/blog"
        noIndex={!hasPosts}
      />
      <Link
        to="/"
        className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]"
      >
        الرئيسية
      </Link>

      <div className="mx-auto max-w-4xl">
        <p className="font-cinzel text-[10px] tracking-[0.45em] uppercase" style={{ color: GOLD }}>
          Blog
        </p>
        <h1 className="mt-5 font-noto text-6xl font-bold leading-tight md:text-7xl">المدوّنة</h1>

        {isLoading && (
          <p className="mt-10 font-noto text-base text-[#1A1A1A]/70">جارٍ تحميل المقالات...</p>
        )}
        {isError && (
          <p className="mt-10 font-noto text-base text-[#1A1A1A]/70">
            تعذّر تحميل المقالات الآن. حاول لاحقاً.
          </p>
        )}
        {!isLoading && !isError && !hasPosts && (
          <p className="mt-10 font-noto text-base text-[#1A1A1A]/70">
            لا توجد مقالات منشورة بعد. سيتم تحديث هذه الصفحة قريباً.
          </p>
        )}

        {hasPosts && (
          <div className="mt-10 grid gap-5">
            {posts.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug || p.id}`}
                className="group rounded-2xl border border-[#C9A961]/16 bg-[#E9E2D3]/38 p-6 transition hover:border-[#C9A961]/45"
              >
                <h2 className="font-noto text-2xl font-bold leading-tight">{p.title}</h2>
                {p.executive_summary && (
                  <p className="mt-3 font-noto text-sm leading-7 text-[#1A1A1A]/72">
                    {p.executive_summary}
                  </p>
                )}
                <span
                  className="mt-5 inline-block font-cinzel text-[11px] tracking-[0.35em]"
                  style={{ color: GOLD }}
                >
                  اقرأ ←
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
