import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const latestOnScan = useRef(onScan);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  // Keep the scan callback up to date without triggering re-renders
  useEffect(() => {
    latestOnScan.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let isMounted = true;

    const initializeScanner = async () => {
      try {
        // Use the CORE engine, not the messy UI wrapper
        scannerRef.current = new Html5Qrcode("pos-qr-reader");
        
        // Auto-start the camera (requests permission natively via the browser)
        await scannerRef.current.start(
          { facingMode: "environment" }, // Prioritizes the back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (isMounted) latestOnScan.current(decodedText);
          },
          (errorMessage) => {
            // Ignore background frame errors (e.g., when no QR is in frame)
          }
        );
      } catch (err) {
        if (isMounted) {
          console.error("Scanner failed to start:", err);
          setCamError("Camera permission denied or no camera found. Please allow camera access in your browser settings.");
        }
      }
    };

    // Slight delay ensures the DOM <div> is fully painted before injecting the video
    const timer = setTimeout(() => {
      initializeScanner();
    }, 100);

    // CLEANUP: This securely destroys the camera when you navigate away or spam click
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => scannerRef.current?.clear())
          .catch(console.error);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-start pt-10 w-full h-full bg-white rounded-[15px] shadow-sm border border-gray-100 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#033860]" style={{ fontFamily: "Raleway, sans-serif" }}>
        Scan Product QR / Barcode
      </h2>
      
      {camError ? (
        <div className="text-[#b13e3e] font-medium p-4 border border-red-200 bg-red-50 rounded-lg text-center max-w-md">
          {camError}
        </div>
      ) : (
        <div className="relative w-full max-w-md bg-black rounded-xl overflow-hidden shadow-inner border-2 border-dashed border-gray-300 min-h-[300px] flex items-center justify-center">
          {/* The clean video feed injects here. No buttons, no hand icon! */}
          <div id="pos-qr-reader" className="w-full h-full object-cover"></div>
          
          {/* A sleek scanning overlay line for UX */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-3/4 h-0.5 bg-[#087ca7] opacity-50 shadow-[0_0_8px_#087ca7] animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}