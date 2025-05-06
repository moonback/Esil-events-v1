import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Announcement, getActiveAnnouncements } from '../services/announcementService';

interface TopBarProps {
  onClose?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onClose }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const data = await getActiveAnnouncements();
      setAnnouncements(data);
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change announcement every 5 seconds

      return () => clearInterval(timer);
    }
  }, [announcements.length]);

  if (!announcements.length) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div
      className="relative py-2 px-4 text-center"
      style={{
        backgroundColor: currentAnnouncement.background_color || '#8854d0',
        color: currentAnnouncement.text_color || '#ffffff'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {currentAnnouncement.link ? (
          <Link 
            to={currentAnnouncement.link}
            className="text-sm font-medium hover:underline"
          >
            {currentAnnouncement.message}
          </Link>
        ) : (
          <p className="text-sm font-medium">{currentAnnouncement.message}</p>
        )}

        {announcements.length > 1 && (
          <div className="absolute right-12 flex space-x-1">
            {announcements.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white opacity-100' : 'bg-white/50 hover:bg-white/75'}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Voir l'annonce ${index + 1}`}
              />
            ))}
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 p-1 rounded-full hover:bg-black/10 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;