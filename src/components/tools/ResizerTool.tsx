"use client";

import React, { useState, useRef } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { extractYouTubeVideoId } from "@/lib/youtube";
import {
  Crop,
  Upload,
  Link as LinkIcon,
  Download,
  Loader2,
  Lock,
  Unlock,
  Sparkles,
} from "lucide-react";

interface ResizerToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function ResizerTool({ lang, dict }: ResizerToolProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(720);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [format, setFormat] = useState<string>("jpeg");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { name: dict.resizerTool.presetThumbnail, w: 1280, h: 720 },
    { name: dict.resizerTool.presetBanner, w: 2560, h: 1440 },
    { name: dict.resizerTool.presetShorts, w: 1080, h: 1920 },
    { name: dict.resizerTool.presetCommunity, w: 1200, h: 1200 },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObject(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);

      const img = new Image();
      img.onload = () => {
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      };
      img.src = url;
    }
  };

  const handleYoutubeFetch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeVideoId(youtubeUrl);
    if (id) {
      const url = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      setImageSrc(url);
      setFileObject(null);
      setWidth(1280);
      setHeight(720);
      setAspectRatio(16 / 9);
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setAspectRatio(w / h);
  };

  const handleDownload = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    // 1. Try instant high-quality client-side Canvas resizing
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image load error"));
        img.src = imageSrc;
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const mime = format === "png" ? "image/png" : (format === "webp" ? "image/webp" : "image/jpeg");
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), mime, 0.95)
        );

        if (blob) {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `ytsnap-resized-${width}x${height}.${format === "jpeg" ? "jpg" : format}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setIsProcessing(false);
          return;
        }
      }
    } catch {
      // Fallback to server /api/image-process
    }

    try {
      const formData = new FormData();
      formData.append("action", "resize");
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      formData.append("format", format);

      if (fileObject) {
        formData.append("file", fileObject);
      } else {
        formData.append("imageUrl", imageSrc);
      }

      const res = await fetch("/api/image-process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Resize failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `ytsnap-resized-${width}x${height}.${format === "jpeg" ? "jpg" : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert(lang === "hi" ? "इमेज रिसाइज़ करने में समस्या आई। कृपया पुनः प्रयास करें।" : "Failed to resize image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload & Source Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {dict.resizerTool.uploadPrompt}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Click to upload image file
            </span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 15MB</span>
          </div>

          {/* YouTube Link Input */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-center bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-primary" />
              <span>Fetch from YouTube URL</span>
            </span>
            <form onSubmit={handleYoutubeFetch} className="flex gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Load
              </button>
            </form>
          </div>
        </div>

        {/* Preset Buttons */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            {dict.resizerTool.presets}
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p.w, p.h)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  width === p.w && height === p.h
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Dimensions Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {dict.resizerTool.width}
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {dict.resizerTool.height}
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLockAspect(!lockAspect)}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                lockAspect
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{dict.resizerTool.lockAspect}</span>
            </button>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs font-semibold text-slate-400">Output Format:</span>
          {["jpeg", "png", "webp"].map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                format === fmt
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {fmt === "jpeg" ? "JPG" : fmt}
            </button>
          ))}
        </div>

        {/* Live Preview Box */}
        {imageSrc && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Preview ({width} × {height})
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video max-w-xl mx-auto border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="w-full max-w-md mx-auto py-3.5 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Resize...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{dict.resizerTool.resizeBtn}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
