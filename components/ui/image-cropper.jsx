'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import { Loader2, RotateCcw, Check, X } from 'lucide-react';
import Image from 'next/image';
// Styles handled globally in globals.css

/**
 * ImageCropper component for cropping profile pictures
 * @param {Object} props
 * @param {string} props.imageSrc - Source URL of the image to crop
 * @param {Function} props.onCropComplete - Callback when cropping is completed with cropped image data
 * @param {Function} props.onCancel - Callback when cropping is cancelled
 * @param {number} props.aspect - Aspect ratio for cropping (default: 1 for square)
 * @param {number} props.outputSize - Output size in pixels (default: 400)
 */
export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspect = 1,
  outputSize = 400
}) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    
    // Create a centered crop
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80, // Start with 80% of the image
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
    setCompletedCrop(crop);
  }, [aspect]);

  // Generate cropped image canvas
  const getCroppedCanvas = useCallback((image, crop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx || !crop) {
      throw new Error('No 2d context or crop data');
    }

    // Convert percentage crop to pixel crop
    const pixelCrop = convertToPixelCrop(crop, image.naturalWidth, image.naturalHeight);
    
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate scaling factor
    const scaleX = outputSize / pixelCrop.width;
    const scaleY = outputSize / pixelCrop.height;

    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas;
  }, [outputSize]);

  // Handle crop completion
  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsLoading(true);
    
    try {
      const canvas = getCroppedCanvas(imgRef.current, completedCrop);
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to create cropped image blob');
          }

          // Create file from blob
          const croppedFile = new File([blob], 'cropped-profile.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          // Create data URL for preview
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

          onCropComplete({
            file: croppedFile,
            dataUrl,
            canvas
          });
        },
        'image/jpeg',
        0.9
      );
    } catch (error) {
      console.error('Error creating cropped image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset crop to center
  const handleReset = () => {
    if (imgRef.current) {
      const { naturalWidth: width, naturalHeight: height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          aspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          Bild zuschneiden
        </h3>
        <p className="text-sm text-gray-300">
          Ziehe die Ecken um dein Profilbild zu positionieren
        </p>
      </div>

      {/* Crop Area */}
      <div className="relative bg-black/20 rounded-xl p-4 overflow-hidden">
        <div className="crop-container">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            minWidth={50}
            minHeight={50}
            className="max-w-full max-h-[400px] mx-auto"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full max-h-[400px] object-contain"
              style={{ display: 'block' }}
            />
          </ReactCrop>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          <span>Abbrechen</span>
        </button>
        
        <button
          onClick={handleCropComplete}
          disabled={isLoading || !completedCrop}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-gray-500 to-white text-gray-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span className="font-semibold">
            {isLoading ? 'Verarbeite...' : 'Bestätigen'}
          </span>
        </button>
      </div>

      {/* Hidden canvas for cropping operations */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={outputSize}
        height={outputSize}
      />
    </div>
  );
}
