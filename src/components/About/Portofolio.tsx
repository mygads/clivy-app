"use client"
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PortfolioItem {
  id: string;
  title: string;
  image: string; // primary image
  gallery: string[]; // additional images for detail dialog
  tech: string[];
  category?: string;
  description?: string;
  link?: string;
}

interface PortfolioProps {
  data: PortfolioItem[];
  desc?: boolean;
}

// Portfolio component now receives data from server-side (ISR)
function Portfolio({ data, desc = true }: PortfolioProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [centerHover, setCenterHover] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState<number | null>(null);
  // Portfolio data now comes from props (server-side ISR)
  const portfolioData = data;
  const dragStartRef = useRef<{ x: number; startIndex: number } | null>(null);
  const didDragRef = useRef(false);
  // Auto-next carousel logic
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to start auto-next interval
  const startAutoNext = useCallback(() => {
    if (autoNextIntervalRef.current) return;
    autoNextIntervalRef.current = setInterval(() => {
      setCurrentIndex(idx => (idx + 1) % portfolioData.length);
    }, 4000);
  }, [portfolioData.length]);
  
  // Helper to stop auto-next interval
  const stopAutoNext = useCallback(() => {
    if (autoNextIntervalRef.current) {
      clearInterval(autoNextIntervalRef.current);
      autoNextIntervalRef.current = null;
    }
  }, []);
  
  // Helper to restart auto-next after 5s
  const restartAutoNextAfterDelay = useCallback(() => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    autoNextTimeoutRef.current = setTimeout(() => {
      startAutoNext();
    }, 5000);
  }, [startAutoNext]);

  // Effect to manage auto-next based on hover/drag state
  useEffect(() => {
    if (centerHover || isDragging) {
      stopAutoNext();
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
        autoNextTimeoutRef.current = null;
      }
    } else {
      stopAutoNext();
      restartAutoNextAfterDelay();
    }
    return () => {
      stopAutoNext();
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
        autoNextTimeoutRef.current = null;
      }
    };
  }, [centerHover, isDragging, restartAutoNextAfterDelay, stopAutoNext]);

  // Responsive breakpoint tracking
  type BP = 'mobile' | 'tablet' | 'desktop';
  const [bp, setBp] = useState<BP>('desktop');
  useEffect(() => {
    const calcBP = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
      if (w < 640) return 'mobile'; // < sm
      if (w < 1024) return 'tablet'; // < lg
      return 'desktop';
    };
    const handler = () => setBp(calcBP());
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const totalItems = portfolioData.length;
  
  // Dimensions per breakpoint & position
  const getDims = (position: number) => {
    const group = position === 0 ? 'center' : (Math.abs(position) === 1 ? 'adj' : 'other');
    if (bp === 'desktop') {
      // Desktop - Reduced sizes for better fit
      if (group === 'center') return { width: 400, height: 540 };
      if (group === 'adj') return { width: 320, height: 430 };
      return { width: 260, height: 350 };
    } else if (bp === 'tablet') {
      // Tablet - Reduced sizes for better fit
      if (group === 'center') return { width: 320, height: 430 };
      if (group === 'adj') return { width: 260, height: 350 };
      return { width: 200, height: 270 };
    }
    // Mobile - Keep existing sizes (already good)
    if (group === 'center') return { width: 280, height: 380 };
    if (group === 'adj') return { width: 220, height: 320 };
    return { width: 180, height: 260 };
  };

  // Calculate card widths dynamically - no gaps between cards
  const getCardWidth = (position: number) => getDims(position).width;

  // Calculate cumulative positioning for no gaps between cards
  const getCardLeft = (position: number) => {
    if (position === 0) return 0; // Center card
    const half = (pos: number) => getCardWidth(pos) / 2;
    let offset = 0;
    if (position > 0) {
      // Sum pairwise half-widths between consecutive positions: (k -> k+1)
      for (let k = 0; k < position; k++) {
        offset += half(k) + half(k + 1);
      }
    } else {
      // Left side: subtract pairwise half-widths between (k -> k-1)
      for (let k = 0; k > position; k--) {
        offset -= half(k) + half(k - 1);
      }
    }
    return offset;
  };

  // Mouse drag functionality
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    didDragRef.current = false;
    dragStartRef.current = { x: e.clientX, startIndex: currentIndex };
    setDragOffset(0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    setDragOffset(deltaX);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    didDragRef.current = Math.abs(deltaX) > 5;
    // Enhanced multi-jump calculation
    const dragDistance = Math.abs(deltaX);
    let itemsMoved;
    
    if (dragDistance < 50) {
      itemsMoved = 0; // No movement for small drags
    } else if (dragDistance < 150) {
      itemsMoved = Math.sign(-deltaX) * 1; // Single item for medium drags
    } else if (dragDistance < 300) {
      itemsMoved = Math.sign(-deltaX) * 2; // Two items for larger drags
    } else if (dragDistance < 500) {
      itemsMoved = Math.sign(-deltaX) * 3; // Three items for very large drags
    } else {
      // For extremely large drags, calculate based on distance
      const currentCardWidth = getCardWidth(dragStartRef.current.startIndex);
      itemsMoved = Math.round(-deltaX / (currentCardWidth * 0.8));
    }
    
    if (itemsMoved !== 0) {
      const newIndex = (dragStartRef.current.startIndex + itemsMoved + totalItems) % totalItems;
      setCurrentIndex(newIndex);
    }
    
    setIsDragging(false);
    setDragOffset(0);
    dragStartRef.current = null;
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      dragStartRef.current = null;
    }
  };

  // Touch functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    didDragRef.current = false;
    dragStartRef.current = { x: e.targetTouches[0].clientX, startIndex: currentIndex };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !dragStartRef.current) return;
    
    const deltaX = e.targetTouches[0].clientX - dragStartRef.current.x;
    setDragOffset(deltaX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !dragStartRef.current) return;
    
    const deltaX = e.changedTouches[0].clientX - dragStartRef.current.x;
    didDragRef.current = Math.abs(deltaX) > 5;
    // Enhanced multi-jump calculation for touch
    const dragDistance = Math.abs(deltaX);
    let itemsMoved;
    
    if (dragDistance < 50) {
      itemsMoved = 0; // No movement for small drags
    } else if (dragDistance < 150) {
      itemsMoved = Math.sign(-deltaX) * 1; // Single item for medium drags
    } else if (dragDistance < 300) {
      itemsMoved = Math.sign(-deltaX) * 2; // Two items for larger drags
    } else if (dragDistance < 500) {
      itemsMoved = Math.sign(-deltaX) * 3; // Three items for very large drags
    } else {
      // For extremely large drags, calculate based on distance
      const currentCardWidth = getCardWidth(dragStartRef.current.startIndex);
      itemsMoved = Math.round(-deltaX / (currentCardWidth * 0.8));
    }
    
    if (itemsMoved !== 0) {
      const newIndex = (dragStartRef.current.startIndex + itemsMoved + totalItems) % totalItems;
      setCurrentIndex(newIndex);
    }
    
    setDragOffset(0);
    setTouchStart(null);
    dragStartRef.current = null;
  };

  // Click a non-center card to center it smoothly
  const handleCardClick = (position: number, actualIndex: number) => {
    // Ignore clicks right after a drag
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (position === 0) return;
    setIsDragging(false);
    setDragOffset(0);
    setCurrentIndex(actualIndex);
  };

  // Generate all items with proper positioning
  const getAllItems = () => {
    const items = [];
    // Clamp visibleRange to portfolioData.length (always odd)
    const maxRange = Math.min(21, totalItems % 2 === 0 ? totalItems - 1 : totalItems);
    const halfRange = Math.floor(maxRange / 2);
    for (let i = -halfRange; i <= halfRange; i++) {
      const index = (currentIndex + i + totalItems) % totalItems;
      const item = portfolioData[index];
      if (item) {
        items.push({
          ...item,
          position: i,
          actualIndex: index,
          dataId: item.id
        });
      }
    }
    return items;
  };

  // Numeric heights for spacing calculations
  const getCardHeight = (position: number) => getDims(position).height;

  // Removed fixed Tailwind width/height classes; use inline style from getDims to stay gapless across breakpoints

  const getCardOpacity = (_position: number) => 'opacity-100';

  const getCardZIndex = (position: number) => {
    const absPos = Math.abs(position);
    if (absPos === 0) return 'z-20';
    if (absPos === 1) return 'z-19';
    if (absPos === 2) return 'z-18';
    if (absPos === 3) return 'z-17';
    if (absPos === 4) return 'z-16';
    return 'z-10';
  };

  // Dark mode follows global theme via `dark:` classes

  const allItems = getAllItems();
  const activeItem = allItems.find(item => item.position === 0);

  // Reset gallery preview when dialog opens or activeItem changes
  useEffect(() => {
    if (showDialog) {
      setSelectedGalleryIdx(null);
    }
  }, [showDialog, activeItem?.id]);

  // Show empty state if no portfolio items (data fetched server-side via ISR)
  if (!portfolioData || portfolioData.length === 0) {
    return (
      <div className="w-full transition-colors duration-300">
        <div className="w-full py-20">
          <div className="w-full px-4">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-muted-foreground">No portfolio items available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full transition-colors duration-300 dark:bg-dark">
      {/* Portfolio Section */}
      <div className="w-full py-20">
        {desc && (
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Our <span className="text-primary">Portfolio</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-2 sm:mt-2">
                Explore the projects we have delivered for clients across various industries. Each project reflects our commitment to providing best-in-class digital solutions.
              </p>
            </div>
          </div>
        )}
        <div className="w-full px-4">
          {/* Carousel Container */}
          <div className="w-full">
            <div
              className="relative w-full overflow-hidden flex items-center justify-center select-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab', height: getCardHeight(0) + 80 }}
            >
              {allItems.map((item, index) => {
                const isCenter = item.position === 0;
                return (
                  <div
                    key={`${item.dataId}-${item.position}-${currentIndex}`}
                    className={`absolute ${isDragging ? 'transition-none' : 'transition-all duration-800 ease-out'} ${getCardOpacity(item.position)} ${getCardZIndex(item.position)}`}
                    style={{
                      left: `calc(50% + ${getCardLeft(item.position) + dragOffset}px)`,
                      transform: 'translateX(-50%)',
                      userSelect: 'none',
                      willChange: isDragging ? 'transform' : 'auto',
                      cursor: item.position !== 0 ? (isDragging ? 'grabbing' : 'pointer') : (isDragging ? 'grabbing' : 'default')
                    }}
                    onClick={() => handleCardClick(item.position, item.actualIndex)}
                    role={item.position !== 0 ? 'button' : undefined}
                    aria-label={item.position !== 0 ? `Focus ${item.title}` : undefined}
                    onMouseEnter={isCenter ? () => setCenterHover(true) : undefined}
                    onMouseLeave={isCenter ? () => setCenterHover(false) : undefined}
                  >
                    <div
                      className={`overflow-hidden transition-all duration-800 ease-out shadow-lg hover:shadow-xl pointer-events-none ${isCenter && centerHover ? 'bg-black/40 dark:bg-white/10' : ''}`}
                      style={{ width: getCardWidth(item.position), height: getCardHeight(item.position), position: 'relative' }}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={600}
                        height={800}
                        className={`w-full h-full object-cover object-top pointer-events-none transition-all duration-800 ease-out ${item.position === 0 ? '' : 'grayscale'}`}
                        draggable={false}
                      />
                      {/* Overlay for center card hover darken effect */}
                      {isCenter && centerHover && (
                        <>
                          <div className="absolute inset-0 bg-black/40 transition-all duration-300 pointer-events-none" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white dark:bg-indigo-900 rounded-full p-4 shadow hover:bg-blue-600 hover:text-white transition-colors duration-200 flex items-center justify-center"
                                title="Go to Page"
                                style={{marginBottom: '16px'}}>
                                <FaExternalLinkAlt className="w-3 h-3 md:w-4 md:h-4" />
                              </a>
                            )}
                            <button
                              className="bg-white/80 dark:bg-indigo-900 rounded-full p-3.5 shadow hover:bg-indigo-600 hover:text-white transition-colors duration-200 flex items-center justify-center"
                              title="View Detail"
                              onClick={e => { e.stopPropagation(); setShowDialog(true); }}>
                              <FaEye className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {activeItem && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `calc(50% + ${dragOffset}px)`,
                    transform: 'translateX(-50%)',
                    top: `calc(50% + ${getCardHeight(0) / 2}px)`,
                    width: `${getCardWidth(0)}px`,
                  }}
                >
                  <div className="bg-indigo-950 text-white text-center py-2 shadow-lg">
                    <h3 className="text-xs md:text-base font-medium">{activeItem.title}</h3>
                  </div>
                </div>
              )}
              {/* Dialog/modal for card detail */}
              {showDialog && activeItem && (
                <div
                  className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 dark:bg-gray-800/40 backdrop-blur-sm transition-all duration-300"
                  onClick={e => {
                    if (e.target === e.currentTarget) setShowDialog(false);
                  }}
                >
                  <div className="relative bg-white dark:bg-dark rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl p-3 sm:p-4 md:p-6 lg:p-10 flex flex-col gap-3 sm:gap-4 md:gap-6 border border-gray-100 dark:border-gray-700 max-h-[95vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-white/80 dark:bg-indigo-900/80 rounded-full p-1.5 sm:p-2 shadow hover:bg-red-500 hover:text-white transition-colors duration-200 border border-gray-200 dark:border-indigo-800 z-10"
                      onClick={() => setShowDialog(false)}
                      title="Close"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* Gallery */}
                    <div className="w-full flex flex-col items-center gap-2 sm:gap-4">
                      <div className="flex items-center justify-center gap-2 sm:gap-4">
                        <div className="w-full max-w-[280px] sm:max-w-xs md:max-w-sm aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-indigo-200 dark:from-indigo-900 dark:via-indigo-950 dark:to-indigo-900 flex items-center justify-center shadow-lg relative mx-auto">
                          <div className="relative w-full h-full flex items-center justify-center bg-white dark:bg-indigo-950">
                            <Image
                              src={selectedGalleryIdx !== null && activeItem.gallery && activeItem.gallery[selectedGalleryIdx] ? activeItem.gallery[selectedGalleryIdx] : activeItem.image}
                              alt={activeItem.title}
                              width={800}
                              height={800}
                              className="w-full h-full object-contain bg-white"
                              style={{height: '100%', width: '100%'}}
                            />
                          </div>
                        </div>
                        {/* Next image preview stacked to the right, outside main image */}
                      </div>
                      {activeItem.gallery && activeItem.gallery.length > 0 && (
                        <div className="flex gap-1 sm:gap-2 mt-1 sm:mt-2 items-center w-full justify-center">
                          {activeItem.gallery.length > 1 && (
                            <button
                              className="rounded-full p-1.5 sm:p-2 bg-gray-100 dark:bg-indigo-900 text-gray-700 dark:text-white shadow hover:bg-blue-600 hover:text-white transition-colors duration-200 shrink-0"
                              onClick={() => setSelectedGalleryIdx(idx => {
                                const galleryLength = activeItem.gallery?.length ?? 0;
                                if (galleryLength < 2) return idx;
                                return idx === null ? 0 : (idx - 1 + galleryLength) % galleryLength;
                              })}
                              title="Previous"
                              disabled={activeItem.gallery.length < 2}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 max-w-[220px] sm:max-w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {(() => {
                              const maxVisible = 5;
                              const currentSelected = selectedGalleryIdx ?? 0;
                              const totalImages = activeItem.gallery.length;
                              
                              // Calculate sliding window start index
                              let startIdx = Math.max(0, currentSelected - Math.floor(maxVisible / 2));
                              const endIdx = Math.min(totalImages, startIdx + maxVisible);
                              
                              // Adjust if we're near the end
                              if (endIdx === totalImages && totalImages > maxVisible) {
                                startIdx = Math.max(0, totalImages - maxVisible);
                              }
                              
                              return activeItem.gallery.slice(startIdx, endIdx).map((img: string, localIdx: number) => {
                                const actualIdx = startIdx + localIdx;
                                return (
                                  <div
                                    key={`${img}-${actualIdx}`}
                                    className={`w-16 h-12 sm:w-20 sm:h-14 overflow-hidden flex-shrink-0 transition-transform duration-200 cursor-pointer ${selectedGalleryIdx === actualIdx ? 'border-2 border-blue-500 dark:border-blue-400' : 'border border-gray-200 dark:border-indigo-900'} ${selectedGalleryIdx === actualIdx ? 'shadow-lg' : 'shadow-sm'} hover:scale-105`}
                                    onClick={() => setSelectedGalleryIdx(actualIdx)}
                                    style={{borderBottom: 'none'}}
                                  >
                                    <Image src={img} alt={`Gallery ${actualIdx+1}`} width={80} height={56} className="w-full h-full object-cover" />
                                  </div>
                                );
                              });
                            })()}
                            {activeItem.gallery.length > 5 && (
                              <div className="flex items-center justify-center w-12 h-10 sm:w-16 sm:h-12 md:w-20 md:h-14 bg-gray-100 dark:bg-indigo-900 border border-gray-200 dark:border-indigo-900 flex-shrink-0">
                                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                                  {selectedGalleryIdx !== null ? `${selectedGalleryIdx + 1}/${activeItem.gallery.length}` : `1/${activeItem.gallery.length}`}
                                </span>
                              </div>
                            )}
                          </div>
                          {activeItem.gallery.length > 1 && (
                            <button
                              className="rounded-full p-1.5 sm:p-2 bg-gray-100 dark:bg-indigo-900 text-gray-700 dark:text-white shadow hover:bg-blue-600 hover:text-white transition-colors duration-200 shrink-0"
                              onClick={() => setSelectedGalleryIdx(idx => {
                                const galleryLength = activeItem.gallery?.length ?? 0;
                                if (galleryLength < 2) return idx;
                                return idx === null ? 0 : (idx + 1) % galleryLength;
                              })}
                              title="Next"
                              disabled={activeItem.gallery.length < 2}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Title & Category */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-indigo-900 dark:text-white flex-1 tracking-tight leading-tight">{activeItem.title}</h2>
                      {activeItem.category && (
                        <Badge variant="default" className="text-xs sm:text-sm font-semibold px-2 py-1 sm:px-3 rounded-full dark:text-white self-start sm:self-center">{activeItem.category}</Badge>
                      )}
                    </div>
                    {/* Tech stack */}
                    {activeItem.tech && activeItem.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        {activeItem.tech.map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-[10px] sm:text-xs font-medium dark:text-primary px-2 py-1">{tech}</Badge>
                        ))}
                      </div>
                    )}
                    {/* Description */}
                    {activeItem.description && (
                      <div className="max-h-32 sm:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent mt-3">
                        <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed tracking-wide pr-2">{activeItem.description}</p>
                      </div>
                    )}
                    {/* Go to Page button */}
                    {activeItem.link && (
                      <div className="mt-4 sm:mt-6">
                        <Button
                          asChild
                          variant="default"
                          size="lg"
                          className="w-full sm:w-auto text-sm sm:text-base"
                          title="Go to Page"
                        >
                          <a
                            href={activeItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7m0 0v7m0-7L10 14" />
                            </svg>
                            Go to Page
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;