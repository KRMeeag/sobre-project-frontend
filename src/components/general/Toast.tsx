import { useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ToastType } from "../../types";

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // Duration in milliseconds
}

export default function Toast({
  message,
  type = "info",
  isVisible,
  onClose,
  duration = 4000,
}: ToastProps) {
  // Auto-dismiss logic
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  // Configuration map for colors and icons based on the toast type
  const config = {
    success: {
      icon: <CheckCircleIcon className="w-6 h-6 text-[#2aa564]" />,
      bg: "bg-[#f2fbf5]",
      border: "border-[#2aa564]/30",
      text: "text-[#1d7346]",
      progress: "bg-[#2aa564]",
    },
    error: {
      icon: <XCircleIcon className="w-6 h-6 text-[#b13e3e]" />,
      bg: "bg-[#fdf4f4]",
      border: "border-[#b13e3e]/30",
      text: "text-[#8c2d2d]",
      progress: "bg-[#b13e3e]",
    },
    warning: {
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-[#e6d04f]" />,
      bg: "bg-[#fffdf2]",
      border: "border-[#e6d04f]/50",
      text: "text-[#8c7e00]",
      progress: "bg-[#e6d04f]",
    },
    info: {
      icon: <InformationCircleIcon className="w-6 h-6 text-[#087CA7]" />,
      bg: "bg-[#f2f9fd]",
      border: "border-[#087CA7]/30",
      text: "text-[#055877]",
      progress: "bg-[#087CA7]",
    },
  };

  const currentConfig = config[type];

  return (
    <div className="fixed top-6 right-6 z-100 animate-in slide-in-from-top-5 fade-in duration-300 font-['Work_Sans']">
      <div
        className={`relative flex items-start gap-3 p-4 pr-10 rounded-xl border shadow-lg overflow-hidden min-w-75 max-w-sm ${currentConfig.bg} ${currentConfig.border}`}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">{currentConfig.icon}</div>

        {/* Message */}
        <div className="flex-1">
          <p className={`text-sm font-semibold ${currentConfig.text}`}>
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Progress Bar Animation (Optional stylistic touch) */}
        <div
          className={`absolute bottom-0 left-0 h-1 ${currentConfig.progress} animate-[shrink_linear_forwards]`}
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      </div>

      {/* Tailwind Custom Keyframe for the progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
