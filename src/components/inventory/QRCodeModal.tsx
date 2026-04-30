import { useRef } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: string; // The stringified JSON
  itemName: string;
  barcode: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  payload,
  itemName,
  barcode,
}: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    // Convert canvas to image URL
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    // Create a temporary link to trigger download
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${itemName.replace(/\s+/g, "_")}_${barcode}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-[#f8f9fa]">
          <h2 className="text-lg font-bold text-[#004385] font-['Raleway']">
            Batch QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#b13e3e] transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center bg-gray-50">
          <div
            ref={qrRef}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4"
          >
            <QRCodeCanvas
              value={payload}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#223843"}
              level={"M"} // Medium error correction
              includeMargin={false}
            />
          </div>

          <div className="text-center mb-6 w-full">
            <p className="font-bold text-[#223843] truncate">{itemName}</p>
            <p className="text-sm font-mono text-gray-500 mt-1">
              {barcode || "No Barcode"}
            </p>
          </div>

          <button
            onClick={downloadQRCode}
            className="w-full bg-[#087CA7] text-white py-2.5 rounded-lg shadow font-bold flex items-center justify-center gap-2 hover:bg-[#066185] transition"
          >
            <ArrowDownTrayIcon className="w-5 h-5" /> Download Label
          </button>
        </div>
      </div>
    </div>
  );
}
