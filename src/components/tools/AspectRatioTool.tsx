"use client";

import React, { useState } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { Maximize2, Video, Calculator, HardDrive } from "lucide-react";

interface AspectRatioToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function AspectRatioTool({ lang, dict }: AspectRatioToolProps) {
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [fps, setFps] = useState<number>(30);

  // Greatest common divisor to calculate ratio
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = width > 0 && height > 0 ? gcd(width, height) : 1;
  const ratioW = width / divisor;
  const ratioH = height / divisor;

  const presets = [
    { label: "16:9 (Standard 1080p)", w: 1920, h: 1080 },
    { label: "16:9 (4K Ultra HD)", w: 3840, h: 2160 },
    { label: "16:9 (720p HD)", w: 1280, h: 720 },
    { label: "9:16 (Shorts / Reels 1080p)", w: 1080, h: 1920 },
    { label: "1:1 (Square Post)", w: 1080, h: 1080 },
    { label: "4:3 (Classic Video)", w: 1440, h: 1080 },
    { label: "21:9 (Ultrawide)", w: 2560, h: 1080 },
  ];

  // Recommended YouTube Bitrate in Mbps
  const getRecommendedBitrateMbps = (w: number, h: number, frameRate: number) => {
    const totalPixels = w * h;
    let base = 8; // 1080p standard 8 Mbps
    if (totalPixels >= 3840 * 2160) {
      base = frameRate > 30 ? 68 : 45; // 4K
    } else if (totalPixels >= 2560 * 1440) {
      base = frameRate > 30 ? 24 : 16; // 1440p
    } else if (totalPixels >= 1920 * 1080) {
      base = frameRate > 30 ? 12 : 8; // 1080p
    } else {
      base = frameRate > 30 ? 7.5 : 5; // 720p
    }
    return base;
  };

  const bitrateMbps = getRecommendedBitrateMbps(width, height, fps);
  // File size = bitrate (Mbps) * duration (sec) / 8 => MB
  const estimatedFileSizeMB = Math.round((bitrateMbps * (durationMinutes * 60)) / 8);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Controls & Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Preset Buttons */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            {dict.ratioTool.presets}
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setWidth(p.w);
                  setHeight(p.h);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  width === p.w && height === p.h
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {dict.ratioTool.width}
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {dict.ratioTool.height}
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        {/* Bitrate & File Size Estimator Settings */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {dict.ratioTool.durationLabel}
            </label>
            <input
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {dict.ratioTool.fpsLabel}
            </label>
            <select
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
            >
              <option value="24">24 FPS (Cinematic standard)</option>
              <option value="30">30 FPS (Standard YouTube video)</option>
              <option value="60">60 FPS (High Motion / Gaming)</option>
            </select>
          </div>
        </div>

        {/* Visual Box Preview */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Visual Aspect Preview:
          </span>
          <div className="h-64 rounded-2xl bg-slate-950 flex items-center justify-center p-4 overflow-hidden border border-slate-800">
            <div
              style={{
                aspectRatio: `${width} / ${height}`,
                maxHeight: "100%",
                maxWidth: "100%",
              }}
              className="bg-primary/20 border-2 border-primary rounded-xl flex flex-col items-center justify-center text-white p-3 shadow-lg"
            >
              <span className="text-sm sm:text-base font-black">
                {ratioW}:{ratioH}
              </span>
              <span className="text-[11px] text-slate-300 mt-0.5">
                {width} × {height}
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-400 block">{dict.ratioTool.ratioDetected}</span>
            <span className="text-xl font-extrabold text-primary mt-1 block">
              {ratioW}:{ratioH}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-400 block">{dict.ratioTool.estBitrate}</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
              {bitrateMbps} Mbps
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-400 block">{dict.ratioTool.estSize}</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {estimatedFileSizeMB >= 1024
                ? `${(estimatedFileSizeMB / 1024).toFixed(2)} GB`
                : `${estimatedFileSizeMB} MB`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
