-- 1. Crear tabla feedback_reports
CREATE TABLE feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  details text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Crear un bucket de storage para las imágenes si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('feedback_images', 'feedback_images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de seguridad (Opcional, pero recomendado)
-- Permitir lectura pública del bucket feedback_images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'feedback_images' );

-- Permitir a usuarios anónimos subir imágenes al bucket
CREATE POLICY "Anon Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'feedback_images' );

-- Permitir lectura/escritura anónima en feedback_reports (Para que puedan crear reportes y el backend leerlos si es necesario, o lo gestiona la API con Service Role)
-- Si usamos la API con server supabase client (service_role), las RLS en feedback_reports no bloquearán a la API.
