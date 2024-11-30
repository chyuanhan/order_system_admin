import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../context/AuthContext';
import { message, Modal, Input } from 'antd';
const { confirm } = Modal;

interface Category {
  _id: string;
  name: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        message.error('Please enter a category name');
        return;
      }

      const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) throw new Error('Failed to add category');

      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory]);
      setIsModalOpen(false);
      setNewCategoryName('');
      message.success('Category added successfully');
    } catch (error) {
      console.error('Failed to add category:', error);
      message.error('Failed to add category');
    }
  };

  const handleEditCategory = async () => {
    try {
      if (!editingCategory || !editingCategory.name.trim()) {
        message.error('Please enter a category name');
        return;
      }

      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/categories/${editingCategory._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: editingCategory.name }),
        }
      );

      if (!response.ok) throw new Error('Failed to update category');

      const updatedCategory = await response.json();
      setCategories(prev =>
        prev.map(cat => (cat._id === editingCategory._id ? updatedCategory : cat))
      );
      setIsEditModalOpen(false);
      setEditingCategory(null);
      message.success('Category updated successfully');
    } catch (error) {
      console.error('Failed to update category:', error);
      message.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    confirm({
      title: `Are you sure you want to delete '${category.name}'?`,
      content: 'Once deleted, it cannot be recovered',
      okText: 'Confirm',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/categories/${category._id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete category');

          setCategories(prev => prev.filter(cat => cat._id !== category._id));
          message.success('Category deleted successfully');
        } catch (error) {
          console.error('Failed to delete category:', error);
          message.error('Failed to delete category');
        }
      },
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">Category Management</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        title="Add Category"
        open={isModalOpen}
        onOk={handleAddCategory}
        onCancel={() => {
          setIsModalOpen(false);
          setNewCategoryName('');
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Input
          placeholder="Please enter the category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </Modal>

      {/* edit category modal */}
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onOk={handleEditCategory}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Input
          placeholder="Please enter the category name"
          value={editingCategory?.name || ''}
          onChange={(e) =>
            setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)
          }
        />
      </Modal>
    </div>
  );
};

export default CategoryManagement; 