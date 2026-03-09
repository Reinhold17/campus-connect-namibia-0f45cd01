import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function TutorPhotoUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: photos = [] } = useQuery({
    queryKey: ['tutor-photos', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutor_photos' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('display_order');
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (photos.length >= 6) {
      toast.error('Maximum 6 photos allowed');
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tutor-photos')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tutor-photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('tutor_photos' as any)
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          display_order: photos.length,
        });
      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['tutor-photos'] });
      toast.success('Photo uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string, photoUrl: string) => {
    try {
      // Extract path from URL
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split('/tutor-photos/');
      if (pathParts[1]) {
        await supabase.storage.from('tutor-photos').remove([decodeURIComponent(pathParts[1])]);
      }

      await supabase.from('tutor_photos' as any).delete().eq('id', photoId);
      queryClient.invalidateQueries({ queryKey: ['tutor-photos'] });
      toast.success('Photo removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove photo');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">Profile Photos</h3>
        <span className="text-xs text-muted-foreground">{photos.length}/6</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {photos.map((photo: any) => (
          <div key={photo.id} className="relative group h-20 w-20 overflow-hidden rounded-lg border">
            <img src={photo.photo_url} alt="Profile" className="h-full w-full object-cover" />
            <button
              onClick={() => handleDelete(photo.id, photo.photo_url)}
              className="absolute inset-0 flex items-center justify-center bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5 text-background" />
            </button>
          </div>
        ))}

        {photos.length < 6 && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-primary/50 hover:bg-muted/30">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            )}
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Upload up to 6 profile photos. Students can view them as a slideshow.</p>
    </div>
  );
}
