"use client";
import { useState, useEffect } from "react";
import { getBooks, getActiveQuote } from "@/services/api";

export default function HomePage({ onBookClick, setActivePage }) {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [quote, setQuote] = useState({
    quote_text: "There is more treasure in books than in all the pirate's loot on Treasure Island.",
    author: "Walt Disney"
  });

  const categories = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Science",
    "History",
    "Children",
    "Fantasy",
    "Mystery",
    "Biography",
    "Romance",
    "Thriller"
  ];

  useEffect(() => {
    loadBooks();
    fetchQuote();
  }, []);

  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter(book =>
        book.category?.toLowerCase() === activeCategory.toLowerCase() ||
        book.section?.toLowerCase() === activeCategory.toLowerCase()
      ));
    }
  }, [activeCategory, books]);

  const loadBooks = async () => {
    try {
      const response = await getBooks();
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    try {
      const response = await getActiveQuote();
      setQuote(response.data);
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  };

  const rows = Array.from({ length: 5 }, (_, rowIndex) => ({
    id: rowIndex,
    title: `Row ${rowIndex + 1}`,
    books: filteredBooks.slice(rowIndex * 10, (rowIndex + 1) * 10),
  }));

  const newArrivals = books.slice(0, 6);

  if (loading) {
    return <div className="text-center py-20">Loading books...</div>;
  }

  return (
    <>
      {/* Quote + New Arrivals Banner */}
      {/* Quote + New Arrivals Banner */}
<div className="grid grid-cols-3 gap-6 mb-8">
  <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 to-teal-600 text-white p-6 rounded-xl col-span-2 shadow-lg min-h-[180px]">
    <div className="absolute inset-0">
      <img src="ll.png" alt="Library Background" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-black/40"></div>
    <div className="relative z-10">
      <h3 className="font-semibold mb-2 text-lg">Today's Quote</h3>
      <p className="text-l mb-4 italic">"{quote.quote_text}"</p>
      <p className="text-right text-sm">- {quote.author || 'Unknown'}</p>
    </div>
  </div>

  {/* New Arrivals */}
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col" style={{ height: "180px", overflow: "hidden" }}>
  <div className="bg-[#001D39] px-4 py-2 flex items-center gap-2 flex-shrink-0">
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] font-semibold tracking-widest text-purple-300 uppercase">Latest</span>
      <h3 className="font-bold text-white text-sm tracking-wide">New Arrivals</h3>
    </div>
  </div>
  <div
    className="flex-1 px-3 py-3"
    style={{
      overflowY: "hidden",
      overflowX: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: "#1f2937 #1c1e20",
    }}
  >
    <div className="flex gap-3" style={{ width: "max-content" }}>
      {newArrivals.map((book) => (
        <div
          key={book.id}
          className="cursor-pointer flex-shrink-0 relative group"
          onClick={() => onBookClick(book)}
        >
          <img
            src={book.img}
            alt={book.title}
            className="rounded-lg hover:scale-105 transition-transform duration-200 w-14 h-20 object-cover shadow-sm"
          />
          <div className="absolute bottom-1 right-1">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-black ${
              book.status === 'available' ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
</div>

      {/* Category Filter Buttons */}
 <div className="mb-6">
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => setActiveCategory(category)}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap  ${
          activeCategory === category
            ? "bg-gray-700 text-white dark:bg-gray-600 dark:text-white shadow-md"
            : "border border-gray-300 text-gray-800 dark:border-gray-600 dark:text-gray-300 hover:border-gray-900 dark:hover:border-purple-700"
        }`}
      >
        {category}
      </button>
    ))}
  

          {/* View All button */}
          <button
            onClick={() => {
              localStorage.setItem("viewAllCategory", "all");
              setActivePage("viewall");
            }}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 
            bg-gray-50 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 
                       hover:border-purple-500 dark:hover:border-purple-400 flex-shrink-0"
          >
            View All →
          </button>
        </div>
      </div>

      

      {/* BookVault */}
     <div className="space-y-8">
  <div className="flex justify-between items-center mb-4">
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Explore</span>
      <h2 className="text-xl font-extrabold text-gray-800 dark:text-white tracking-tight">
        Book<span className="text-gray-600">Vault</span>
      </h2>
    </div>
  </div>

        {rows.map((row) => (
          <section key={row.id}>
           <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {row.books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white p-3 rounded-lg shadow-sm min-w-[140px] w-[140px] hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
                  onClick={() => onBookClick(book)}
                >
                  <img
                    src={book.img}
                    alt={book.title}
                    className="rounded-md mb-2 group-hover:scale-105 transition-transform duration-200 w-full h-[140px] object-cover"
                  />
                  <p className="text-sm font-medium truncate mt-2">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.author}</p>
                  <p className="text-xs text-teal-600 mt-1">{book.year}</p>
                  <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-medium shadow-sm ${
                    book.status === 'available'
                      ? 'bg-green-500 text-black'
                      : 'bg-red-500 text-black'
                  }`}>
                    {book.status === 'available' ? 'Available' : 'Taken'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}