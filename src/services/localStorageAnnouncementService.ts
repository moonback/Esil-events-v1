import { v4 as uuidv4 } from 'uuid';

export interface Announcement {
  id: string;
  message: string;
  link?: string;
  active: boolean;
  start_date: string;
  end_date: string;
  background_color: string;
  text_color: string;
}

const STORAGE_KEY = 'announcements';

const getStoredAnnouncements = (): Announcement[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const saveAnnouncements = (announcements: Announcement[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  return getStoredAnnouncements();
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id'>): Promise<Announcement> => {
  const announcements = getStoredAnnouncements();
  const newAnnouncement = {
    ...announcement,
    id: uuidv4()
  };
  announcements.push(newAnnouncement);
  saveAnnouncements(announcements);
  return newAnnouncement;
};

export const updateAnnouncement = async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
  const announcements = getStoredAnnouncements();
  const index = announcements.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Announcement not found');
  
  announcements[index] = {
    ...announcements[index],
    ...announcement
  };
  saveAnnouncements(announcements);
  return announcements[index];
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const announcements = getStoredAnnouncements();
  const filteredAnnouncements = announcements.filter(a => a.id !== id);
  saveAnnouncements(filteredAnnouncements);
};