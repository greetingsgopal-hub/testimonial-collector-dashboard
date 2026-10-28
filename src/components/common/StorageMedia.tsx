import React from 'react';
import { getFreshUrl } from '../../firebase-adapters/firebase';

export interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  storagePath?: string;
  fallbackSrc?: string;
}

export const StorageImage: React.FC<StorageImageProps> = ({
  src,
  storagePath,
  fallbackSrc,
  onError,
  ...props
}) => {
  return (
    <img 
      src={src} 
      onError={(e) => {
        // 4xx -> token expired, refetch
        if (e.currentTarget.src.includes('fbcdn.net') || e.currentTarget.src.includes('firebasestorage')) {
          if (storagePath) {
            getFreshUrl(storagePath)
              .then((newUrl) => {
                e.currentTarget.src = newUrl;
              })
              .catch(() => {
                if (fallbackSrc) e.currentTarget.src = fallbackSrc;
              });
          } else if (fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        } else if (fallbackSrc) {
          e.currentTarget.src = fallbackSrc;
        }
        onError?.(e);
      }} 
      {...props}
    />
  );
};

export interface StorageVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  storagePath?: string;
  fallbackSrc?: string;
}

export const StorageVideo: React.FC<StorageVideoProps> = ({
  src,
  storagePath,
  fallbackSrc,
  onError,
  ...props
}) => {
  return (
    <video 
      src={src} 
      onError={(e) => {
        // 4xx -> token expired, refetch
        if (e.currentTarget.src.includes('fbcdn.net') || e.currentTarget.src.includes('firebasestorage')) {
          if (storagePath) {
            getFreshUrl(storagePath)
              .then((newUrl) => {
                e.currentTarget.src = newUrl;
              })
              .catch(() => {
                if (fallbackSrc) e.currentTarget.src = fallbackSrc;
              });
          } else if (fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        } else if (fallbackSrc) {
          e.currentTarget.src = fallbackSrc;
        }
        onError?.(e);
      }} 
      {...props}
    />
  );
};

export default StorageImage;
