"use client";
import { useState } from 'react';
import FullScreenBookViewer from './FullScreenBookViewer';

interface ComicBookLayoutProps {
  panels: string[];
  title: string;
  episodeNumber: number;
  onClose?: () => void;
}

export default function ComicBookLayout({ panels, title, episodeNumber, onClose }: ComicBookLayoutProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  
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

  if (showFullScreen) {
    return (
      <FullScreenBookViewer
        panels={panels}
        title={title}
        episodeNumber={episodeNumber}
        onClose={() => setShowFullScreen(false)}
      />
    );
  }

  return (
    <div className="glass rounded-3xl p-8">
      {/* Book Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">📚 Comic Book</h2>
        <p className="text-gray-400">Experience your episode as a traditional comic book</p>
        <button
          onClick={() => setShowFullScreen(true)}
          className="mt-4 btn-primary"
        >
          <span className="mr-2">🔍</span>
          Full Screen Reading
        </button>
      </div>

      {/* Book Container */}
      <div className="relative max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-2xl overflow-hidden">
          {/* Book Spine */}
          <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-amber-800 to-amber-900 shadow-lg z-10"></div>
          
          {/* Book Content */}
          <div className="flex min-h-[600px]">
            {/* Left Page */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
                <h2 className="text-xl text-gray-600">Episode {episodeNumber}</h2>
              </div>
              
              {pages[currentPage] && pages[currentPage][0] && (
                <div className="aspect-[4/5] max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={pages[currentPage][0]} 
                    alt={`Panel ${currentPage * 2 + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Book Crease */}
            <div className="w-1 bg-gradient-to-b from-amber-300 to-amber-400 shadow-inner"></div>
            
            {/* Right Page */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              {pages[currentPage] && pages[currentPage][1] ? (
                <div className="aspect-[4/5] max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={pages[currentPage][1]} 
                    alt={`Panel ${currentPage * 2 + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] max-w-sm mx-auto bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="text-sm">End of Episode</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Page Numbers */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={prevPage}
            disabled={isFirstPage || isFlipping}
            className={`w-12 h-12 rounded-full glass flex items-center justify-center transition-all ${
              isFirstPage || isFlipping 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 hover:scale-110'
            }`}
          >
            <span className="text-2xl">←</span>
          </button>
          
          <button
            onClick={nextPage}
            disabled={isLastPage || isFlipping}
            className={`w-12 h-12 rounded-full glass flex items-center justify-center transition-all ${
              isLastPage || isFlipping 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 hover:scale-110'
            }`}
          >
            <span className="text-2xl">→</span>
          </button>
        </div>
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <span className="text-xl">×</span>
          </button>
        )}
        
        {/* Page Flip Animation */}
        {isFlipping && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-2xl"></div>
        )}
      </div>
    </div>
  );
}
