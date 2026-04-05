interface POSHeaderProps {
  userName: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
}

export default function POSHeader({ userName, searchQuery, setSearchQuery, isLoading }: POSHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 shrink-0 w-full">
      <h1
        className="text-xl md:text-2xl font-bold text-[#223843] tracking-tight truncate capitalize"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        Hello, {userName}
      </h1>

      <div className="relative w-full md:max-w-xs lg:max-w-sm h-10 flex items-center bg-white border border-gray-300 rounded-lg px-3 shrink-0 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-[#087ca7] focus-within:border-transparent">
        <input
          type="text"
          placeholder="Search for Items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm text-gray-700 focus:outline-none bg-transparent"
          style={{ fontFamily: "Work Sans, sans-serif" }}
        />
        {isLoading ? (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#087ca7] animate-spin ml-2 shrink-0"></div>
        ) : (
          <svg className="w-4 h-4 text-gray-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        )}
      </div>
    </div>
  );
}