import { useState } from "react";

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setResults([]);
    setError(null);

    try {
      // Vercel ke simple API route ko call karna
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong on the server.');
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setError("No deals found for this product. Try another search!");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center text-white p-8 font-sans">
      
      <header className="w-full max-w-4xl mb-12">
        <h1 className="text-5xl font-bold text-center text-blue-400">
          DealMagnet
        </h1>
        <p className="text-center text-gray-400 mt-2">
          Your Ultimate Deal Finder
        </p>
      </header>

      <main className="w-full max-w-2xl">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Search for any product (e.g., iPhone 15)"
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </div>
      </main>

      <div className="w-full max-w-5xl mt-12">
        {isLoading && <p className="text-center text-lg">Searching for the best deals...</p>}
        
        {error && <p className="text-center text-lg text-red-400">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product, index) => (
            <a 
              key={index} 
              href={product.productUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-800 rounded-lg p-4 flex flex-col hover:scale-105 transition-transform duration-200 border border-gray-700"
            >
              <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-contain rounded-md mb-4" />
              <h3 className="text-md font-semibold text-gray-200 mb-2 flex-grow">{product.title}</h3>
              <div className="flex justify-between items-center mt-4">
                <p className="text-2xl font-bold text-blue-400">{product.price}</p>
                <span className="bg-gray-700 text-white text-xs font-semibold px-2.5 py-1 rounded">
                  {product.source}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;