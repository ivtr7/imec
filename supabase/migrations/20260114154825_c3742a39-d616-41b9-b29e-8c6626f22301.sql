-- Create sessions table for tracking conversations
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for storing conversation messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content_text TEXT NOT NULL,
  attachments_json JSONB,
  flags_json JSONB
);

-- Create appointments table for scheduled appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  doctor_id TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  patient_name TEXT NOT NULL,
  notes TEXT
);

-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  password_hash TEXT NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public access policies for sessions (anonymous access from edge functions)
CREATE POLICY "Allow insert sessions from edge functions"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select sessions from edge functions"
  ON public.sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow update sessions from edge functions"
  ON public.sessions FOR UPDATE
  USING (true);

-- Public access policies for messages
CREATE POLICY "Allow insert messages from edge functions"
  ON public.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select messages from edge functions"
  ON public.messages FOR SELECT
  USING (true);

-- Public access policies for appointments
CREATE POLICY "Allow insert appointments from edge functions"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select appointments from edge functions"
  ON public.appointments FOR SELECT
  USING (true);

-- Admin users policies (only readable for admin verification)
CREATE POLICY "Allow select admin_users"
  ON public.admin_users FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_sessions_ip_address ON public.sessions(ip_address);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_appointments_session_id ON public.appointments(session_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);

-- Insert default admin (password: admin123 - should be changed)
INSERT INTO public.admin_users (password_hash) VALUES ('$2a$10$defaultAdminHash123');