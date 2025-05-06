-- Create realizations table
CREATE TABLE IF NOT EXISTS public.realizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    objective TEXT NOT NULL,
    mission TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    category TEXT,
    event_date DATE,
    testimonial TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.realizations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Realizations are viewable by everyone" 
    ON public.realizations 
    FOR SELECT 
    USING (true);

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert realizations" 
    ON public.realizations 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Create policy for users to update their own realizations
CREATE POLICY "Users can update their own realizations" 
    ON public.realizations 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = created_by);

-- Create policy for users to delete their own realizations
CREATE POLICY "Users can delete their own realizations" 
    ON public.realizations 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = created_by);

-- Allow admins to manage all realizations
CREATE POLICY "Admins can manage all realizations" 
    ON public.realizations 
    FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );