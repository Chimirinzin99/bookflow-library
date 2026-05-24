"use client";
import Image from "next/image";

export default function BookCard({ book, onClick, imageLoader }) {
  return (
    <div onClick={() => onClick(book)} className="bg-white p-3 rounded-lg shadow-sm min-w-[140px] w-[140px] hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100">
      <Image 
        loader={imageLoader} 
        src={book.img} 
        alt={book.title} 
        width={140} 
        height={140} 
        className="rounded-md mb-2 group-hover:scale-105 transition-transform duration-200 w-full h-[140px] object-cover" 
        loading="lazy" 
      />
      <p className="text-sm font-medium truncate mt-2 text-teal-700">{book.title}</p>
      <p className="text-xs text-teal-700 truncate">{book.author}</p>
      <p className="text-xs text-teal-600 mt-1">{book.year}</p>
    </div>
  );
}