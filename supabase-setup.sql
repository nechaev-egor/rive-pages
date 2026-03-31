-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the demos table
CREATE TABLE IF NOT EXISTS lottie_demos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  scroll_height INTEGER NOT NULL DEFAULT 3000,
  breakpoints JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lottie_demos
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

-- 2. Index for fast slug lookups (used on public demo pages)
CREATE INDEX IF NOT EXISTS idx_lottie_demos_slug ON lottie_demos (slug);

-- 3. Enable Row Level Security (open read, open write — adjust as needed)
ALTER TABLE lottie_demos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads"   ON lottie_demos FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON lottie_demos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON lottie_demos FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes" ON lottie_demos FOR DELETE USING (true);

-- -------------------------------------------------------
-- Storage bucket setup (do this in Supabase Dashboard UI):
--
--   Storage → New bucket → Name: "lottie-files" → Public: ON
--
-- After creating the bucket, set CORS policy:
--   Storage → lottie-files → bucket settings → CORS
--   Or via SQL below:
-- -------------------------------------------------------

-- 4. Storage bucket (if not created via UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lottie-files', 'lottie-files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS: allow public reads
CREATE POLICY "Public read lottie files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lottie-files');

CREATE POLICY "Allow uploads to lottie files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lottie-files');

CREATE POLICY "Allow deletes from lottie files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lottie-files');
