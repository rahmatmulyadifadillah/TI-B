/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { API } from "../api";

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
}

export default function GaleriPage() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "fasilitas" | "event" | "lainnya"
  >("all");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    API.getGallery().then(setGalleryItems).catch(console.error);
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return galleryItems;
    return galleryItems.filter((item) => item.category === activeFilter);
  }, [activeFilter, galleryItems]);

  return (
    <div className="font-sans py-16 bg-gray-50 dark:bg-sport-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300 font-sans">
      <div className="responsive-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 flex flex-col gap-2">
          <span className="text-xs font-black text-sport-green tracking-widest uppercase">
            Dokumentasi UTM
          </span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Galeri Foto UTM Arena
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Intip dokumentasi kegiatan turnamen, keseruan tanding komunitas,
            serta kemegahan sarana fasilitas lapangan kami.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-10">
          {[
            { id: "all", label: "Semua" },
            { id: "fasilitas", label: "Fasilitas" },
            { id: "event", label: "Event & Turnamen" },
            { id: "lainnya", label: "Lainnya" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                activeFilter === cat.id
                  ? "bg-sport-navy dark:bg-sport-navy-light text-white"
                  : "bg-white dark:bg-sport-slate text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item.imageUrl)}

              className="bg-white dark:bg-sport-slate rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md group cursor-pointer relative"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.imageUrl}

                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/25">
                    <Eye className="w-5 h-5" />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <span className="text-[9px] bg-sport-navy/5 text-sport-navy dark:bg-sport-green/10 dark:text-sport-green px-2 py-0.5 rounded font-black uppercase">
                  {item.category}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-gray-800 dark:text-white mt-2 leading-tight">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
          >
            <div className="max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
              <img
                src={lightboxImage}
                className="w-full h-full object-contain"
                alt="lightbox"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full font-bold hover:bg-black"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
