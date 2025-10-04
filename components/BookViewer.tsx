"use client";
import { useState, useEffect } from 'react';

interface BookViewerProps {
  panels: string[];
  title?: string;
  episodeNumber?: number;
}

export default function BookViewer({ panels, title = "Drama Series", episodeNumber = 1 }: BookViewerProps) {
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

  const openBook = () => {
    setBookOpen(true);
  };

  const closeBook = () => {
    setBookOpen(false);
    setCurrentPage(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!bookOpen) return;
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'Escape') {
        closeBook();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [bookOpen, currentPage, isFlipping]);

  if (!bookOpen) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Comic Book View</h2>
          <p className="text-gray-400">Experience your episode as a traditional comic book</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {panels.slice(0, 6).map((panel, index) => (
            <div key={index} className="aspect-[4/5] bg-gray-800 rounded-xl overflow-hidden">
              <img 
                src={panel} 
                alt={`Panel ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        <button 
          onClick={openBook}
          className="btn-primary text-lg px-8 py-4"
        >
          <span className="mr-2">📖</span>
          Open Comic Book
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl h-full max-h-[90vh]">
        {/* Book Container */}
        <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-2xl overflow-hidden">
          {/* Book Spine */}
          <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-amber-800 to-amber-900 shadow-lg"></div>
          
          {/* Book Content */}
          <div className="flex h-full">
            {/* Left Page */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
                <h2 className="text-2xl text-gray-600">Episode {episodeNumber}</h2>
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
        <div className="absolute inset-0 pointer-events-none">
          {/* Left Arrow */}
          <button
            onClick={prevPage}
            disabled={isFirstPage || isFlipping}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center pointer-events-auto transition-all ${
              isFirstPage || isFlipping 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 hover:scale-110'
            }`}
          >
            <span className="text-2xl">←</span>
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={nextPage}
            disabled={isLastPage || isFlipping}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center pointer-events-auto transition-all ${
              isLastPage || isFlipping 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/20 hover:scale-110'
            }`}
          >
            <span className="text-2xl">→</span>
          </button>
        </div>
        
        {/* Close Button */}
        <button
          onClick={closeBook}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <span className="text-xl">×</span>
        </button>
        
        {/* Keyboard Instructions */}
        <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="text-white text-xs">
            <div>← → Navigate</div>
            <div>ESC Close</div>
          </div>
        </div>
        
        {/* Page Flip Animation */}
        {isFlipping && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
