import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { Announcement, getActiveAnnouncements } from '../services/announcementService';

interface TopBarProps {
  onClose?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onClose }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getActiveAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error("Erreur lors du chargement des annonces:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1 && !isPaused) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
        );
      }, 7000); // Augmenté à 7 secondes pour une meilleure lisibilité

      return () => clearInterval(timer);
    }
  }, [announcements.length, isPaused]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!announcements.length) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div
      className="relative py-2 sm:py-3 px-3 sm:px-4 text-center transition-all duration-300 shadow-md"
      style={{
        backgroundColor: currentAnnouncement.background_color || '#6366f1',
        color: currentAnnouncement.text_color || '#ffffff'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {announcements.length > 1 && (
          <button
            onClick={handlePrevious}
            className="hidden md:flex absolute left-2 sm:left-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            aria-label="Annonce précédente"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" />
          
          {currentAnnouncement.link ? (
            <Link 
              to={currentAnnouncement.link}
              className="text-xs sm:text-sm md:text-base font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-0.5 sm:px-1"
            >
              {currentAnnouncement.message}
            </Link>
          ) : (
            <p className="text-xs sm:text-sm md:text-base font-medium">{currentAnnouncement.message}</p>
          )}
        </div>

        {announcements.length > 1 && (
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-8 sm:right-12 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            aria-label="Annonce suivante"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        {announcements.length > 1 && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2 mb-0.5 sm:mb-1">
            {announcements.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/40 hover:bg-white/70'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Voir l'annonce ${index + 1}`}
              />
            ))}
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 sm:right-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;