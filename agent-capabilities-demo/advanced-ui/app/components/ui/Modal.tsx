// Modal.tsx
import React from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ModalProps } from "../../../types/types";

const Modal: React.FC<ModalProps> = React.memo(
  ({ title, children, onClose }) => {
    if (typeof document === "undefined") return null;

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-[#151929] w-full max-w-lg mx-auto rounded-lg shadow-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h2 className="text-xl text-white font-medium mb-4">{title}</h2>
          {children}
        </div>
      </div>,
      document.body
    );
  }
);

export default Modal;
