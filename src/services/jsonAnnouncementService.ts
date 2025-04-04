import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

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

const ANNOUNCEMENTS_FILE = path.join(process.cwd(), 'src', 'data', 'announcements.json');

const readAnnouncementsFile = async (): Promise<{ announcements: Announcement[] }> => {
  try {
    const data = await fs.readFile(ANNOUNCEMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { announcements: [] };
  }
};

const writeAnnouncementsFile = async (data: { announcements: Announcement[] }): Promise<void> => {
  await fs.writeFile(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2));
};

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  const { announcements } = await readAnnouncementsFile();
  return announcements;
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id'>): Promise<Announcement> => {
  const data = await readAnnouncementsFile();
  const newAnnouncement = {
    ...announcement,
    id: uuidv4()
  };
  data.announcements.push(newAnnouncement);
  await writeAnnouncementsFile(data);
  return newAnnouncement;
};

export const updateAnnouncement = async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
  const data = await readAnnouncementsFile();
  const index = data.announcements.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Announcement not found');
  
  data.announcements[index] = {
    ...data.announcements[index],
    ...announcement
  };
  await writeAnnouncementsFile(data);
  return data.announcements[index];
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const data = await readAnnouncementsFile();
  data.announcements = data.announcements.filter(a => a.id !== id);
  await writeAnnouncementsFile(data);
};