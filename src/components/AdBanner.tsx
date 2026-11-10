import React from "react";
import prisma from "@/lib/prisma";

interface AdBannerProps {
  slot: "header_top" | "hero_bottom" | "in_content" | "sidebar" | "footer_top";
  className?: string;
}

export async function AdBanner({ slot, className = "" }: AdBannerProps) {
  try {
    const ad = await prisma.advertisement.findUnique({
      where: { slot },
    });

    if (!ad || !ad.isActive) {
      return null;
    }

    if (!ad.htmlContent && !ad.imageUrl) {
      return null;
    }

    return (
      <aside aria-label="Advertisement" className={`w-full my-4 flex flex-col items-center justify-center ${className}`}>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          Advertisement
        </span>
        <div className="max-w-5xl w-full mx-auto flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {ad.htmlContent ? (
            <div
              className="w-full flex items-center justify-center text-center overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
            />
          ) : ad.imageUrl ? (
            <a
              href={ad.targetUrl || "#"}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block max-w-full"
            >
              <img
                src={ad.imageUrl}
                alt={ad.name || "Advertisement"}
                className="max-h-32 object-contain rounded-xl hover:opacity-95 transition-opacity"
              />
            </a>
          ) : null}
        </div>
      </aside>
    );
  } catch {
    return null;
  }
}
