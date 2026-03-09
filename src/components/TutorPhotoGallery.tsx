import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorPhotoGalleryProps {
  photos: { id: string; photo_url: string }[];
  tutorName: string;
}

export function TutorPhotoGallery({ photos, tutorName }: TutorPhotoGalleryProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) return null;

  const goNext = () => setCurrentIndex(i => (i + 1) % photos.length);
  const goPrev = () => setCurrentIndex(i => (i - 1 + photos.length) % photos.length);

  return (
    <>
      {/* Thumbnail grid */}
      <div className="flex gap-2 flex-wrap">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => { setCurrentIndex(i); setOpen(true); }}
            className="h-16 w-16 overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={photo.photo_url}
              alt={`${tutorName} photo ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Slideshow dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="relative aspect-[4/3] w-full bg-muted">
              <img
                src={photos[currentIndex]?.photo_url}
                alt={`${tutorName} photo ${currentIndex + 1}`}
                className="h-full w-full object-contain"
              />
            </div>

            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={goNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        'h-2 w-2 rounded-full transition-all',
                        i === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/40'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="px-4 pb-3 pt-1 text-center text-sm text-muted-foreground">
            {currentIndex + 1} / {photos.length}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
