export default function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[70%] bg-[#031a6b] relative items-center justify-center p-12 overflow-hidden">
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("/assets/edited-image.png")', 
          backgroundSize: 'cover'
        }}
      ></div>

      {/* White Logo Header */}
      <div className="absolute top-10 left-10 flex items-center gap-3 z-20">
        <img src="/assets/background.png" className="w-10 h-10 object-contain" alt="Logo" />
        <span className="text-white text-3xl font-bold font-['Raleway'] tracking-tight">Sobre</span>
      </div>

      {/* Centered Image */}
      <div className="relative z-10 w-full max-w-4xl flex justify-center">
        <img 
          src="/assets/inventorycontrolsystemconceptprofessionalmanagerandworkerarecheckinggoodsandstocksupplyinventorymanagementwithgoodsdemandvector.png" 
          className="w-full h-auto drop-shadow-2xl" 
          alt="Illustration" 
        />
      </div>
    </div>
  );
}