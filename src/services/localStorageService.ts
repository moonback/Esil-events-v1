const STORAGE_KEY = 'announcements';

export interface Announcement {
  id: number;
  message: string;
  link?: string;
  background_color: string;
  text_color: string;
  active: boolean;
}

export const getAnnouncements = (): Announcement[] => {
  const storedAnnouncements = localStorage.getItem(STORAGE_KEY);
  if (!storedAnnouncements) {
    // Initialiser avec les annonces par défaut
    const defaultAnnouncements = [
      {
        id: 1,
        message: "🎉 Livraison gratuite à partir de 50€ d'achat !",
        link: "/delivery",
        background_color: "#8854d0",
        text_color: "#ffffff",
        active: true
      },
      {
        id: 2,
        message: "🎨 Découvrez nos nouveaux artistes du mois",
        link: "/artists",
        background_color: "#6c5ce7",
        text_color: "#ffffff",
        active: true
      },
      {
        id: 3,
        message: "🌟 -10% sur tous les produits ce week-end avec le code WEEKEND10",
        link: "/products",
        background_color: "#a55eea",
        text_color: "#ffffff",
        active: true
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAnnouncements));
    return defaultAnnouncements;
  }
  return JSON.parse(storedAnnouncements);
};

export const getActiveAnnouncements = (): Announcement[] => {
  const announcements = getAnnouncements();
  return announcements.filter(announcement => announcement.active);
};

export const updateAnnouncement = (updatedAnnouncement: Announcement): void => {
  const announcements = getAnnouncements();
  const index = announcements.findIndex(a => a.id === updatedAnnouncement.id);
  if (index !== -1) {
    announcements[index] = updatedAnnouncement;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
  }
};

export const addAnnouncement = (newAnnouncement: Omit<Announcement, 'id'>): void => {
  const announcements = getAnnouncements();
  const newId = Math.max(...announcements.map(a => a.id), 0) + 1;
  const announcement = { ...newAnnouncement, id: newId };
  announcements.push(announcement);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
};

export const deleteAnnouncement = (id: number): void => {
  const announcements = getAnnouncements();
  const filteredAnnouncements = announcements.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAnnouncements));
};