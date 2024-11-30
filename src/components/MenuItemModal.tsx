import React, { useState, useEffect } from 'react';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string | File;
  category: MenuCategory | string;
  isAvailable: boolean;
}

interface MenuCategory {
  _id: string;
  name: string;
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  item: MenuItem;
  setItem: React.Dispatch<React.SetStateAction<MenuItem | null>>;
  title: string;
  submitButtonText: string;
  categories: MenuCategory[];
  onImageUpload: (file: File) => Promise<string>;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  setItem,
  title,
  submitButtonText,
  categories,
  onImageUpload
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPreviewImage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && item.image) {
      if (typeof item.image === 'string') {
        const imageUrl = `${import.meta.env.VITE_BACKEND_ASSET_URL}/${item.image.replace(/\\/g, '/')}`;
        setPreviewImage(imageUrl);
      } else if (item.image instanceof File) {
        setPreviewImage(URL.createObjectURL(item.image));
      }
    }
  }, [item.image, isOpen]);

  const handleClose = () => {
    setPreviewImage(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onImageUpload(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        setPreviewImage(null);
      }
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-500 text-xl">×</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Item Image
            </label>
            <div className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg 
                          flex flex-col items-center justify-center overflow-hidden bg-gray-50">
              {previewImage ? (
                <div className="relative w-full h-full group">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 
                                group-hover:opacity-100 transition-opacity 
                                flex items-center justify-center">
                    <label className="cursor-pointer px-4 py-2 bg-white rounded-md 
                                   text-gray-700 hover:bg-gray-100 transition-colors
                                   text-sm sm:text-base">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer text-center p-4">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" 
                         stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm sm:text-base">Click to upload image</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter item name"
                value={item.name}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                          focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                  Description
              </label>
              <textarea
                placeholder="Description"
                value={item.description}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                className="w-full p-2 border rounded min-h-[100px] mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => {
                  const value = e.target.value;
                  setItem({ 
                    ...item, 
                    price: value === '' ? 0 : parseFloat(value) 
                  });
                }}
                step="0.01"
                min="0"
                className="w-full p-2 border rounded mt-1"
              />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={typeof item.category === 'string' ? item.category : item.category._id}
              onChange={(e) => setItem({
                ...item,
                category: e.target.value
              })}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSubmit();
                setPreviewImage(null);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {submitButtonText}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;