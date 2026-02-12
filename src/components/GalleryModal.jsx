"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image as ImageIcon,
  Search,
  Filter,
  Grid,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { Modal, ModalContent, ModalBody } from "./ui/Modal";

export default function GalleryModal({ isOpen, onClose, gallery }) {
  // Fallback if empty (handling async state or empty DB)
  const safeGallery = useMemo(
    () =>
      (Array.isArray(gallery) ? gallery : [])
        .map((photo) => ({
          ...photo,
          src: photo?.src || photo?.url || "",
          url: photo?.url || photo?.src || "",
        }))
        .filter((photo) => !!photo.src),
    [gallery],
  );

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = safeGallery.flatMap((photo) => {
      if (Array.isArray(photo.tags)) return photo.tags;
      if (typeof photo.tags === "string")
        return photo.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      return [];
    });
    return Array.from(new Set(tags)).sort();
  }, [safeGallery]);

  // Showroom State
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("curadoria"); // curadoria | az
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  // Helper to check if photo has a tag
  const hasTag = (photo, targetTag) => {
    if (Array.isArray(photo.tags)) return photo.tags.includes(targetTag);
    if (typeof photo.tags === "string") {
      return photo.tags
        .split(",")
        .map((t) => t.trim())
        .includes(targetTag);
    }
    return false;
  };

  // Filtering Logic
  const filteredPhotos = useMemo(() => {
    let result = [...safeGallery];

    // Filter by Tag
    if (filter !== "Todos") {
      result = result.filter((p) => hasTag(p, filter));
    }

    // Filter by Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const captionMatch = p.caption?.toLowerCase().includes(q);
        const tagsList = Array.isArray(p.tags)
          ? p.tags
          : typeof p.tags === "string"
            ? p.tags.split(",").map((t) => t.trim())
            : [];
        const tagMatch = tagsList.some((t) => t.toLowerCase().includes(q));
        return titleMatch || captionMatch || tagMatch;
      });
    }

    // Sorting
    if (sort === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [filter, search, sort, safeGallery]);

  // Lightbox Handlers
  const openLightbox = (index) => setSelectedPhotoIndex(index);
  const closeLightbox = () => setSelectedPhotoIndex(null);
  const nextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
    }
  };
  const prevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(
        (selectedPhotoIndex - 1 + filteredPhotos.length) %
          filteredPhotos.length,
      );
    }
  };

  /** @type {any} */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0 },
  };

  /** @type {any} */
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const handleModalClose = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(null);
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <ModalContent size="xl" className="bg-paper p-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-[110] group flex items-center gap-2 bg-white/50 hover:bg-gold border border-stone-100 pl-3 pr-2 py-2 rounded-full text-primary hover:text-white transition-all duration-300 shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary hover:translate-y-[-1px]"
          aria-label="Fechar Galeria"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
            Fechar
          </span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 group-hover:bg-white/20 transition-colors">
            <X size={14} />
          </div>
        </button>

        <ModalBody className="p-0">
          <div className="min-h-full py-10 px-4 md:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-7xl mx-auto space-y-12"
            >
              {/* HEADER */}
              <motion.header
                variants={itemVariants}
                className="text-center pt-10"
              >
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gold/10 text-gold mb-6">
                  <ImageIcon size={32} />
                </div>
                <h1 className="font-serif text-4xl md:text-6xl text-primary font-bold mb-4">
                  Galeria de Imagens
                </h1>
                <p className="text-text/60 text-lg font-light max-w-2xl mx-auto">
                  Um registro visual dos encontros, vivências e da beleza que
                  floresce no Instituto Figura Viva.
                </p>
              </motion.header>

              {/* SHOWROOM CONTROLS */}
              <motion.section
                variants={itemVariants}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col xl:flex-row gap-8 justify-between items-end"
              >
                {/* Stats & Search */}
                <div className="w-full xl:w-auto flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <p className="text-xs uppercase tracking-widest font-bold text-text/40">
                      {filteredPhotos.length} Registros
                    </p>
                    <div className="h-4 w-px bg-stone-200"></div>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-primary/60">
                      <button
                        onClick={() => setSort("curadoria")}
                        className={
                          sort === "curadoria"
                            ? "text-gold underline decoration-2 underline-offset-4"
                            : "hover:text-primary"
                        }
                      >
                        Recentes
                      </button>
                      <button
                        onClick={() => setSort("az")}
                        className={
                          sort === "az"
                            ? "text-gold underline decoration-2 underline-offset-4"
                            : "hover:text-primary"
                        }
                      >
                        A-Z
                      </button>
                    </div>
                  </div>

                  <div className="relative group w-full max-w-md">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-gold transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar momentos..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl outline-none bg-stone-50 border border-stone-200 focus:border-gold/50 text-primary placeholder-text/30 transition-all font-light"
                    />
                  </div>
                </div>

                {/* Tags Filter */}
                <div className="w-full xl:w-auto flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text/40">
                    <Filter size={10} /> Filtros
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => setFilter("Todos")}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border
                                            ${
                                              filter === "Todos"
                                                ? "bg-primary border-primary text-white shadow-lg"
                                                : "bg-white border-stone-200 text-text/60 hover:border-gold hover:text-gold"
                                            }
                                        `}
                    >
                      Todos
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setFilter(tag)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border
                                                ${
                                                  filter === tag
                                                    ? "bg-gold border-gold text-white shadow-lg"
                                                    : "bg-white border-stone-200 text-text/60 hover:border-gold hover:text-gold"
                                                }
                                            `}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* GRID CONTENT */}
              <AnimatePresence mode="wait">
                {selectedPhotoIndex === null ? (
                  /* --- GRID MODE --- */
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
                  >
                    {filteredPhotos.map((photo, index) => (
                      <motion.div
                        key={photo.id}
                        layoutId={photo.id}
                        className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden bg-stone-100 shadow-sm hover:shadow-xl transition-all duration-500"
                        onClick={() => openLightbox(index)}
                        whileHover={{ y: -5 }}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.title}
                          width={0}
                          height={0}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                          style={{ width: "100%", height: "auto" }}
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                          <h3 className="text-white font-serif text-lg leading-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            {photo.title}
                          </h3>
                          <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                            {(Array.isArray(photo.tags)
                              ? photo.tags
                              : typeof photo.tags === "string"
                                ? photo.tags
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean)
                                : []
                            )
                              .slice(0, 2)
                              .map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] uppercase font-bold tracking-widest text-white/80 bg-white/20 px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {filteredPhotos.length === 0 && (
                      <div className="col-span-full h-64 flex flex-col items-center justify-center text-text/40">
                        <ImageIcon size={48} className="mb-4 opacity-50" />
                        <p className="font-serif text-xl">
                          Nenhuma imagem encontrada.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* --- DETAIL VIEW (LIGHTBOX) --- */
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-stone-100 flex flex-col lg:flex-row max-h-[90vh]"
                  >
                    {/* Image Container */}
                    <div className="flex-1 bg-stone-50 relative flex items-center justify-center p-4 lg:p-12">
                      <div className="relative w-full h-full max-h-[70vh]">
                        <Image
                          src={filteredPhotos[selectedPhotoIndex].src}
                          alt={filteredPhotos[selectedPhotoIndex].title}
                          fill
                          className="object-contain rounded-lg shadow-lg"
                          sizes="100vw"
                          priority
                        />
                      </div>

                      {/* Nav Buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevPhoto();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 hover:bg-gold hover:text-white text-primary rounded-full transition-all shadow-lg backdrop-blur"
                      >
                        <ArrowRight className="rotate-180" size={24} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextPhoto();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 hover:bg-gold hover:text-white text-primary rounded-full transition-all shadow-lg backdrop-blur"
                      >
                        <ArrowRight size={24} />
                      </button>
                    </div>

                    {/* Sidebar Info */}
                    <div className="w-full lg:w-96 bg-white p-8 lg:p-12 border-l border-stone-100 flex flex-col overflow-y-auto">
                      <button
                        onClick={closeLightbox}
                        className="self-end mb-8 text-xs text-text/40 hover:text-gold flex items-center gap-2 uppercase tracking-widest font-bold transition-colors"
                      >
                        <Grid size={14} /> Voltar
                      </button>

                      <h3 className="font-serif text-3xl text-primary mb-6 leading-tight">
                        {filteredPhotos[selectedPhotoIndex].title}
                      </h3>

                      <div className="w-12 h-1 bg-gold/30 mb-8 rounded-full"></div>

                      <p className="text-text/70 text-base leading-relaxed mb-auto whitespace-pre-line font-light">
                        {filteredPhotos[selectedPhotoIndex].caption ||
                          "Sem descrição disponível para esta imagem."}
                      </p>

                      <div className="mt-8 pt-8 border-t border-stone-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text/30 mb-4">
                          Tags Relacionadas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(
                            filteredPhotos[selectedPhotoIndex].tags,
                          )
                            ? filteredPhotos[selectedPhotoIndex].tags
                            : typeof filteredPhotos[selectedPhotoIndex].tags ===
                                "string"
                              ? filteredPhotos[selectedPhotoIndex].tags
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                              : []
                          ).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] uppercase tracking-widest text-primary/60 bg-stone-100 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors cursor-default"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
