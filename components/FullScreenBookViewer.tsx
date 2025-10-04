"use client";
import { useState, useEffect } from 'react';

interface FullScreenBookViewerProps {
  panels: string[];
  title: string;
  episodeNumber: number;
  onClose: () => void;
}

export default function FullScreenBookViewer({ panels, title, episodeNumber, onClose }: FullScreenBookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  
  // Group panels into pages (2 panels per page for book format)
  const pages = [];
  for (let i = 0; i < panels.length; i += 2) {
    pages.push(panels.slice(i, i + 2));
  }
  
  const totalPages = pages.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  const nextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, isFlipping]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-7xl h-full max-h-[95vh]">
        {/* Book Container */}
        <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl shadow-2xl overflow-hidden">
          {/* Book Spine */}
          <div className="absolute left-0 top-0 w-3 h-full bg-gradient-to-b from-amber-800 to-amber-900 shadow-lg z-10"></div>
          
          {/* Book Content */}
          <div className="flex h-full">
            {/* Left Page */}
            <div className="flex-1 p-12 flex flex-col justify-center">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">{title}</h1>
                <h2 className="text-3xl text-gray-600">Episode {episodeNumber}</h2>
              </div>
              
              {pages[currentPage] && pages[currentPage][0] && (
                <div className="aspect-[4/5] max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                  <img 
                    src={pages[currentPage][0]} 
                    alt={`Panel ${currentPage * 2 + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Book Crease */}
            <div className="w-2 bg-gradient-to-b from-amber-300 to-amber-400 shadow-inner"></div>
            
            {/* Right Page */}
            <div className="flex-1 p-12 flex flex-col justify-center">
              {pages[currentPage] && pages[currentPage][1] ? (
                <div className="aspect-[4/5] max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
                  <img 
                    src={pages[currentPage][1]} 
                    alt={`Panel ${currentPage * 2 + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] max-w-lg mx-auto bg-gray-100 rounded-xl shadow-2xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">📄</div>
                    <div className="text-xl">End of Episode</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Page Numbers */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-white text-lg font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left Arrow */}
          <button
            onClick={prevPage}
            disabled={isFirstPage || isFlipping}
            className={`absolute left-8 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full glass flex items-center justify-center pointer-events-auto transition-all ${
              isFirstPage || isFlipping 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 hover:scale-110'
            }`}
          >
            <span className="text-3xl">←</span>
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={nextPage}
            disabled={isLastPage || isFlipping}
            className={`absolute right-8 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full glass flex items-center justify-center pointer-events-auto transition-all ${
              isLastPage || isFlipping 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 hover:scale-110'
            }`}
          >
            <span className="text-3xl">→</span>
          </button>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <span className="text-2xl">×</span>
        </button>
        
        {/* Keyboard Instructions */}
        <div className="absolute bottom-6 left-6 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-3">
          <div className="text-white text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span>←</span>
              <span>→</span>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span>ESC</span>
              <span>Close</span>
            </div>
          </div>
        </div>
        
        {/* Page Flip Animation */}
        {isFlipping && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
