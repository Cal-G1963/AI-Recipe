import React, { useEffect, useRef } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  recipeName: string;
  t: (key: string) => string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, recipeName, t }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
        // Autoplay was prevented, user might need to click play.
        // The `controls` attribute is present, so they can.
      });
    }
  }, [isOpen, videoUrl]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${recipeName.replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('videoModalAriaLabel')}
    >
      <div
        className="bg-black rounded-xl shadow-2xl w-full max-w-4xl aspect-video relative transition-transform duration-300 transform scale-95"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'enter 0.3s ease-out forwards' }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full rounded-xl"
          key={videoUrl} // Re-mount component if URL changes to ensure autoplay
        >
          {t('videoNotSupported')}
        </video>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-gray-700 hover:text-black hover:bg-white transition-all z-10"
          aria-label={t('closeVideoLabel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute top-2 left-2 flex flex-wrap gap-2 z-10">
            <button
                onClick={handleDownload}
                className="bg-white/80 rounded-full p-2 pr-4 flex items-center gap-2 text-gray-700 hover:text-black hover:bg-white transition-all"
                aria-label={t('downloadVideoLabel')}
            >
                <DownloadIcon className="h-5 w-5" />
                <span className="font-semibold text-sm">{t('downloadAndShare')}</span>
            </button>
        </div>
      </div>
       <style>{`
        @keyframes enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VideoModal;