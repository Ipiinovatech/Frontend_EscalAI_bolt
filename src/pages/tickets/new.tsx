import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { TicketPriority, TicketType } from '../../types';
import { ticketService, CreateTicketData } from '../../services/ticketService';

interface FileWithPreview extends File {
  preview?: string;
}

const NewTicketPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    type: '',
    category: '',
    subcategory: '',
  });

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories from your system
  const categories = [
    { id: '1', name: 'Technical Support', subcategories: ['Hardware', 'Software', 'Network'] },
    { id: '2', name: 'Billing', subcategories: ['Invoice', 'Payment', 'Refund'] },
    { id: '3', name: 'Account', subcategories: ['Access', 'Security', 'Profile'] },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user makes changes
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const validSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return validTypes.includes(file.type) && validSize;
    });

    const filesWithPreviews = validFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });

    setFiles(prev => [...prev, ...filesWithPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.title || !formData.description || !formData.priority || !formData.type) {
      setError(t('errors.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData: CreateTicketData = {
        ...formData,
        files: files,
      };

      await ticketService.createTicket(ticketData);

      // Clean up file previews
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      toast.success(t('tickets.createSuccess'));
      navigate('/tickets');
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(t('errors.somethingWentWrong'));
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/tickets')}
            className="mr-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold">{t('tickets.create')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">
                  {t('tickets.title')} *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  placeholder={t('tickets.title')}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
                  {t('tickets.description')} *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input"
                  placeholder={t('tickets.description')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">
                    {t('tickets.type')} *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="select"
                  >
                    <option value="">{t('common.select')}</option>
                    {Object.values(TicketType).map(type => (
                      <option key={type} value={type}>
                        {t(`tickets.types.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-text-secondary mb-1">
                    {t('tickets.priority')} *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="select"
                  >
                    <option value="">{t('common.select')}</option>
                    {Object.values(TicketPriority).map(priority => (
                      <option key={priority} value={priority}>
                        {t(`tickets.priorities.${priority}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">
                    {t('tickets.category')}
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="select"
                  >
                    <option value="">{t('common.select')}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-text-secondary mb-1">
                    {t('tickets.subcategory')}
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="select"
                    disabled={!formData.category}
                  >
                    <option value="">{t('common.select')}</option>
                    {formData.category && categories
                      .find(cat => cat.id === formData.category)
                      ?.subcategories.map(sub => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {t('tickets.attachments')}
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isDragging
                      ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload
                      size={24}
                      className="mx-auto text-text-secondary mb-2"
                    />
                    <p className="text-sm text-text-secondary mb-1">
                      {t('common.dragAndDrop')}
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn btn-ghost text-sm inline-block mt-2"
                    >
                      {t('common.uploadFile')}
                    </label>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-800 rounded-lg p-2"
                      >
                        <div className="flex items-center space-x-2">
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt="preview"
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                              <Upload size={16} className="text-text-secondary" />
                            </div>
                          )}
                          <span className="text-sm text-text-primary truncate max-w-xs">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <X size={16} className="text-text-secondary" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-error-500 bg-error-500 bg-opacity-10 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="btn btn-ghost"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {t('common.loading')}
                </div>
              ) : (
                t('common.create')
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewTicketPage;