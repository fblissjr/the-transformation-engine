import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

/**
 * ConfirmModal component
 *
 * A reusable modal dialog for confirming user actions, such as deletions or important changes.
 *
 * @param isOpen - Boolean indicating if the modal is visible.
 * @param title - The title of the modal.
 * @param message - The confirmation message to display.
 * @param onConfirm - Callback function executed when the user confirms.
 * @param onCancel - Callback function executed when the user cancels.
 * @param confirmText - (Optional) Text for the confirm button. Defaults to 'Confirm'.
 * @param cancelText - (Optional) Text for the cancel button. Defaults to 'Cancel'.
 * @param confirmButtonClass - (Optional) CSS classes for styling the confirm button. Defaults to 'bg-red-600 hover:bg-red-500'.
 * @returns The rendered ConfirmModal component.
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-500',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="w-full bg-gray-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`w-full text-white font-semibold py-2 px-4 rounded-md transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
