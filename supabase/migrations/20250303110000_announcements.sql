-- Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  background_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active announcements
CREATE POLICY "Anyone can read active announcements" 
  ON announcements FOR SELECT 
  USING (active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);

-- Allow authenticated users with admin role to manage announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" 
  ON announcements FOR ALL 
  USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert default announcement
INSERT INTO announcements (message, link, background_color, text_color, active, start_date, end_date)
VALUES ('🚧Site en construction 🚧', '/', 'rgb(255, 0, 0)', '#ffffff', true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');