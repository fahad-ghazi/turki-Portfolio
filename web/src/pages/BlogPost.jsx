import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import Seo from "@/components/seo/Seo";
import Eyebrow from "@/components/brand/Eyebrow";
import ReactMarkdown from "react-markdown";

const GOLD = "#C9A961";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: () => apiClient.entities.BlogPost.get(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title={post?.seo_title || post?.title || "المقال"}
        description={post?.meta_description || post?.executive_summary}
        canonical={`/blog/${slug}`}
        ogImage={post?.hero_image}
        ogType="article"
        noIndex={!post}
      />
      <Link
        to="/blog"
        className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]"
      >
        المدوّنة
      </Link>

      <article className="mx-auto max-w-3xl">
        {isLoading && (
          <p className="mt-20 font-noto text-base text-[#1A1A1A]/70">جارٍ تحميل المقال...</p>
        )}
        {isError && (
          <div className="mt-20 space-y-4">
            <p className="font-noto text-base text-[#1A1A1A]/70">المقال غير متاح.</p>
            <Link to="/blog" className="font-cinzel text-[11px] tracking-[0.35em]" style={{ color: GOLD }}>
              عودة للمدوّنة ←
            </Link>
          </div>
        )}
        {post && (
          <>
            <Eyebrow ar="مقال" en="Article" />
            <h1 className="mt-5 font-noto text-5xl font-bold leading-tight md:text-6xl">
              {post.h1 || post.title}
            </h1>
            {post.executive_summary && (
              <p className="mt-5 font-noto text-base leading-9 text-[#1A1A1A]/80">
                {post.executive_summary}
              </p>
            )}
            {post.hero_image && (
              <img
                src={post.hero_image}
                alt={post.alt_text || post.title}
                loading="eager"
                className="mt-8 w-full rounded-2xl"
              />
            )}
            <div className="prose prose-slate mt-10 max-w-none font-noto text-base leading-9">
              <ReactMarkdown>{post.content || ""}</ReactMarkdown>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
