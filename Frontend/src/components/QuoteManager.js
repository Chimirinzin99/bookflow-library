"use client";
import { useState, useEffect } from "react";
import { getAllQuotes, addQuote, updateQuote, deleteQuote } from "@/services/api";

export default function QuoteManager() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [formData, setFormData] = useState({
    quote_text: "",
    author: "",
    is_active: true
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const res = await getAllQuotes();
      setQuotes(res.data);
    } catch (error) {
      console.error("Error loading quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuote) {
        await updateQuote(editingQuote.id, formData);
        alert("✅ Quote updated successfully!");
      } else {
        await addQuote(formData);
        alert("✅ Quote added successfully!");
      }
      setShowForm(false);
      setEditingQuote(null);
      setFormData({ quote_text: "", author: "", is_active: true });
      loadQuotes();
    } catch (error) {
      alert("❌ Failed to save quote: " + error.response?.data?.error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this quote?")) {
      try {
        await deleteQuote(id);
        alert("✅ Quote deleted!");
        loadQuotes();
      } catch (error) {
        alert("❌ Failed to delete quote");
      }
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setFormData({
      quote_text: quote.quote_text,
      author: quote.author || "",
      is_active: quote.is_active
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-8">Loading quotes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">📝 Quote Management</h3>
        <button
          onClick={() => {
            setEditingQuote(null);
            setFormData({ quote_text: "", author: "", is_active: true });
            setShowForm(true);
          }}
          className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800"
        >
          ➕ Add New Quote
        </button>
      </div>

      {/* Quote Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingQuote ? "Edit Quote" : "Add New Quote"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Text</label>
                <textarea
                  rows="4"
                  value={formData.quote_text}
                  onChange={(e) => setFormData({...formData, quote_text: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Walt Disney"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-teal-600"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Set as active quote (shown on homepage)</label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800">
                  {editingQuote ? "Update" : "Add"} Quote
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotes List */}
      <div className="space-y-3">
        {quotes.map((quote) => (
          <div key={quote.id} className={`p-4 rounded-lg border ${quote.is_active ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-800 italic">"{quote.quote_text}"</p>
                <p className="text-sm text-gray-500 mt-2">— {quote.author || 'Unknown'}</p>
                {quote.is_active && (
                  <span className="inline-block mt-2 text-xs bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full">Active</span>
                )}
                <p className="text-xs text-gray-400 mt-2">Last updated: {new Date(quote.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(quote)} className="text-teal-600 hover:text-teal-800">✏️ Edit</button>
                <button onClick={() => handleDelete(quote.id)} className="text-red-500 hover:text-red-700">🗑️ Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}