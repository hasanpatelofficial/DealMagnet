function App() {
  return (
    // Yeh sab Tailwind classes hain!
    <div className="bg-gray-900 min-h-screen flex flex-col items-center text-white p-8">
      
      {/* Header Section */}
      <header className="w-full max-w-4xl mb-12">
        <h1 className="text-5xl font-bold text-center text-blue-400">
          DealMagnet
        </h1>
        <p className="text-center text-gray-400 mt-2">
          Your Ultimate Deal Finder
        </p>
      </header>

      {/* Search Bar Section */}
      <main className="w-full max-w-2xl">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Search for any product..."
            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg">
            Search
          </button>
        </div>
      </main>

    </div>
  )
}

export default App