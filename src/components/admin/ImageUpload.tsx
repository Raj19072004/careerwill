import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Plus, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  featuredIndex: number;
  onFeaturedChange: (index: number) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  featuredIndex,
  onFeaturedChange,
  maxImages = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of filesToProcess) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        // Convert to base64 for demo purposes
        // In a real app, you would upload to a cloud storage service
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        onImagesChange(updatedImages);
        
        // If this is the first image, make it featured
        if (images.length === 0) {
          onFeaturedChange(0);
        }
        
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Adjust featured index if necessary
    if (featuredIndex === index) {
      onFeaturedChange(Math.max(0, Math.min(featuredIndex, newImages.length - 1)));
    } else if (featuredIndex > index) {
      onFeaturedChange(featuredIndex - 1);
    }
    
    toast.success('Image removed');
  };

  const setFeatured = (index: number) => {
    onFeaturedChange(index);
    toast.success('Featured image updated');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
        Product Images ({images.length}/{maxImages})
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-600 font-inter">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-inter mb-2">
              {images.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : 'Click to upload or drag and drop images here'
              }
            </p>
            <p className="text-sm text-gray-500 font-inter">
              PNG, JPG up to 5MB each
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={index}
                className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Featured Badge */}
                {featuredIndex === index && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-inter font-medium flex items-center gap-1">
                    <Star size={12} className="fill-current" />
                    Featured
                  </div>
                )}

                {/* Overlay with Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    {featuredIndex !== index && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeatured(index);
                        }}
                        className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Set as featured"
                      >
                        <Star size={16} />
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Image Number */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-inter">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add More Button */}
          {images.length < maxImages && (
            <motion.div
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-inter">Add More</p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-inter font-semibold text-blue-800 mb-2">Image Guidelines:</h4>
        <ul className="text-sm text-blue-700 font-inter space-y-1">
          <li>• Upload high-quality images (minimum 800x800px recommended)</li>
          <li>• Use well-lit photos with good contrast</li>
          <li>• Show different angles and details of the product</li>
          <li>• The featured image will be displayed as the main product image</li>
          <li>• Supported formats: PNG, JPG, JPEG</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;