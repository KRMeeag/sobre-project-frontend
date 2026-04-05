interface POSHeaderProps {
  userName: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
}

export default function POSHeader({ userName, searchQuery, setSearchQuery, isLoading, isScanning, setIsScanning }: POSHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 shrink-0 w-full">
      <h1
        className="text-xl md:text-2xl font-bold text-[#223843] tracking-tight truncate capitalize"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        Hello, {userName}
      </h1>

      {/* FIXED: Proper Flexbox layout for Button + Search Bar */}
      <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[350px] lg:min-w-[400px]">
        
        {/* QR Scanner Toggle Button */}
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all shrink-0 shadow-sm
            ${isScanning ? "bg-[#087ca7] text-white border-[#087ca7]" : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"}`}
          title={isScanning ? "Close Scanner" : "Open QR Scanner"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 h-10 flex items-center bg-white border border-gray-300 rounded-lg px-3 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-[#087ca7] focus-within:border-transparent">
          <input
            type="text"
            placeholder="Search for Items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isScanning}
            className="w-full text-sm text-gray-700 focus:outline-none bg-transparent disabled:opacity-50"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          />
          {isLoading && !isScanning ? (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#087ca7] animate-spin ml-2 shrink-0"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          )}
        </div>

      </div>
    </div>
  );
}