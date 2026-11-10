"use client";

import React, { useState, useRef } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/lib/i18n";
import { extractYouTubeVideoId } from "@/lib/youtube";
import {
  Minimize2,
  Upload,
  Link as LinkIcon,
  Download,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface CompressorToolProps {
  lang: SupportedLanguage;
  dict: TranslationDictionary;
}

export function CompressorTool({ lang, dict }: CompressorToolProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<string>("jpeg");
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObject(file);
      setOriginalSize(file.size);
      setImageSrc(URL.createObjectURL(file));
      setCompressedBlob(null);
      setCompressedSize(null);
    }
  };

  const handleYoutubeFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeVideoId(youtubeUrl);
    if (id) {
      const url = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      setImageSrc(url);
      setFileObject(null);
      setOriginalSize(850 * 1024); // approx estimate
      setCompressedBlob(null);
      setCompressedSize(null);
    }
  };

  const handleCompress = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("action", "compress");
      formData.append("quality", quality.toString());
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

      if (!res.ok) throw new Error("Compression failed");

      const blob = await res.blob();
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
    } catch (err) {
      console.error(err);
      alert("Failed to compress image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob) return;
    const downloadUrl = window.URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `mediasnap-compressed-${quality}q.${format === "jpeg" ? "jpg" : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const savingsPct =
    originalSize && compressedSize
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {dict.compressorTool.uploadPrompt}
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
              Select image to compress
            </span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (reduces under 2MB)</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-center bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-primary" />
              <span>Compress from YouTube URL</span>
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

        {/* Quality Controls */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 dark:text-white">
              {dict.compressorTool.quality}: <span className="text-primary">{quality}%</span>
            </label>
            <span className="text-xs text-slate-400">
              {quality > 80 ? "Ultra Quality" : quality > 50 ? "Balanced" : "Maximum Savings"}
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="95"
            step="5"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value, 10))}
            className="w-full accent-primary h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-slate-400">{dict.compressorTool.outputFormat}:</span>
            {["jpeg", "webp", "png"].map((fmt) => (
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
        </div>

        {/* Action Button */}
        {imageSrc && (
          <div className="pt-2">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compressing Image...</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-5 h-5" />
                  <span>Run Compression</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Card */}
        {compressedSize && (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-xs text-slate-400 block">{dict.compressorTool.originalSize}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                  {originalSize ? `${(originalSize / 1024).toFixed(1)} KB` : "—"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{dict.compressorTool.compressedSize}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                  {(compressedSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{dict.compressorTool.savings}</span>
                <span className="font-bold text-primary text-sm sm:text-base">
                  {savingsPct !== null ? `-${savingsPct}%` : "—"}
                </span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>{dict.compressorTool.compressBtn} ({(compressedSize / 1024).toFixed(1)} KB)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
