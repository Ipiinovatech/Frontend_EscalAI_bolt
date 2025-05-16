import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { TicketPriority, TicketType } from '../../types';
import toast from 'react-hot-toast';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    type: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
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
      await ticketService.createTicket(formData);
      toast.success(t('tickets.createSuccess'));
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(t('errors.somethingWentWrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-lg rounded-xl bg-background-card shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-800 p-4">
                <h2 className="text-xl font-semibold">{t('tickets.create')}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-text-secondary">
                      {t('tickets.title')} *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input mt-1"
                      placeholder={t('tickets.title')}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
                      {t('tickets.description')} *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="input mt-1"
                      placeholder={t('tickets.description')}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-text-secondary">
                        {t('tickets.type')} *
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="select mt-1"
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
                      <label htmlFor="priority" className="block text-sm font-medium text-text-secondary">
                        {t('tickets.priority')} *
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="select mt-1"
                      >
                        <option value="">{t('common.select')}</option>
                        {Object.values(TicketPriority).map(priority => (
                          <option key={priority} value={priority}>
                            {t(`tickets.priorities.${priority}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 rounded-lg bg-error-500 bg-opacity-10 p-3 text-error-500">
                      <AlertCircle size={16} />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-ghost"
                    disabled={isSubmitting}
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
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTicketModal;