"use client";

import React, { useState, useRef } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { extractYouTubeVideoId } from "@/lib/youtube";
import { RefreshCw, Upload, Download, Loader2, Link as LinkIcon } from "lucide-react";

interface ConverterToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function ConverterTool({ lang, dict }: ConverterToolProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [targetFormat, setTargetFormat] = useState<string>("png");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formats = [
    { key: "png", name: "PNG", desc: "Lossless quality, transparent background support" },
    { key: "jpeg", name: "JPG", desc: "Best compatibility, standard web standard" },
    { key: "webp", name: "WEBP", desc: "Modern Google format, 30% smaller file sizes" },
    { key: "avif", name: "AVIF", desc: "Next-gen compression format, ultra compact" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObject(file);
      setImageSrc(URL.createObjectURL(file));
    }
  };

  const handleYoutubeFetch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeVideoId(youtubeUrl);
    if (id) {
      setImageSrc(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      setFileObject(null);
    }
  };

  const handleConvert = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    // 1. Try instant client-side Canvas conversion
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image load error"));
        img.src = imageSrc;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 1280;
      canvas.height = img.naturalHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mime = targetFormat === "png" ? "image/png" : (targetFormat === "webp" ? "image/webp" : "image/jpeg");
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), mime, 0.95)
        );

        if (blob) {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `ytsnap-converted.${targetFormat === "jpeg" ? "jpg" : targetFormat}`;
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
      formData.append("action", "convert");
      formData.append("format", targetFormat);

      if (fileObject) {
        formData.append("file", fileObject);
      } else {
        formData.append("imageUrl", imageSrc);
      }

      const res = await fetch("/api/image-process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Conversion failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `ytsnap-converted.${targetFormat === "jpeg" ? "jpg" : targetFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert(lang === "hi" ? "इमेज फॉर्मेट बदलने में समस्या आई। कृपया पुनः प्रयास करें।" : "Conversion failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {dict.converterTool.uploadPrompt}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
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
              Select image to convert
            </span>
            <span className="text-xs text-slate-400 mt-1">Accepts any common image format</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-center bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-primary" />
              <span>Convert from YouTube URL</span>
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
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                Load
              </button>
            </form>
          </div>
        </div>

        {/* Target Format Selector */}
        <div className="space-y-3 pt-2">
          <label className="text-sm font-bold text-slate-900 dark:text-white">
            {dict.converterTool.targetFormat}:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formats.map((fmt) => (
              <div
                key={fmt.key}
                onClick={() => setTargetFormat(fmt.key)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  targetFormat === fmt.key
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    {fmt.name}
                  </span>
                  {targetFormat === fmt.key && (
                    <span className="text-xs font-bold text-primary">Selected</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{fmt.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Convert Action Button */}
        {imageSrc && (
          <div className="pt-4">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting Format...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{dict.converterTool.convertBtn} ({targetFormat.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
