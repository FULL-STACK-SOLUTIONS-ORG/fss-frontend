import React, { useState, useEffect } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending');
  const [formData, setFormData] = useState({ title: '', dueDate: '' });

  useEffect(() => {
    const saved = localStorage.getItem('adminTodos');
    if (saved) setTodos(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('adminTodos', JSON.stringify(todos));
  }, [todos, isLoaded]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTodo) {
      setTodos(todos.map(t => t.id === selectedTodo.id ? { ...t, title: formData.title, dueDate: formData.dueDate, updatedAt: new Date().toISOString() } : t));
    } else {
      setTodos([{ id: Date.now(), title: formData.title, dueDate: formData.dueDate, status: 'Pending', createdAt: new Date().toISOString() }, ...todos]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this task?')) setTodos(todos.filter(t => t.id !== id));
  };

  const toggleStatus = (id) => {
    setTodos(todos.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed', updatedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  const resetForm = () => { setFormData({ title: '', dueDate: '' }); setSelectedTodo(null); };

  const calculateRemaining = (dueDate) => {
    if (!dueDate) return 'No deadline';
    const diff = new Date(dueDate) - new Date();
    if (diff < 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`;
  };

  const filteredTodos = todos
    .filter(t => t.status === activeTab)
    .sort((a, b) => { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate) - new Date(b.dueDate); });

  const inputCls = "w-full bg-white border border-[#D4C9B8] rounded-xl px-4 py-3 text-[#1C1A17] focus:ring-2 focus:ring-[#9B7D43] focus:outline-none transition-all";

  return (
    <div className="bg-[#F5F0E8] min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#1C1A17] tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>To-Do Tasks</h2>
          <p className="text-[#5A5550] mt-1">Manage your deadlines and activities</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-6 py-2.5 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-xl transition-all font-semibold flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl w-fit mb-6 border border-[#D4C9B8]">
        {['Pending', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-[#9B7D43] text-white shadow-sm' : 'text-[#5A5550] hover:text-[#1C1A17]'
            }`}
          >
            {tab}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab ? 'bg-[#7A6235]' : 'bg-[#F5F0E8] border border-[#D4C9B8]'
            }`}>
              {todos.filter(t => t.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#D4C9B8] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FAF7F2] text-[#5A5550] text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Remark / Task Name</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">{activeTab === 'Pending' ? 'Remaining' : 'Status'}</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D4]">
            {filteredTodos.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-[#5A5550] font-medium">
                  No {activeTab.toLowerCase()} tasks found.
                </td>
              </tr>
            ) : (
              filteredTodos.map((todo) => (
                <tr key={todo.id} className="hover:bg-[#FAF7F2] transition-colors group">
                  <td className="px-6 py-4">
                    <div className={`font-medium ${todo.status === 'Completed' ? 'line-through text-[#9A8A7A]' : 'text-[#1C1A17]'}`}>
                      {todo.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#5A5550]">
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-[#5A5550]">
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === 'Pending' ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        calculateRemaining(todo.dueDate) === 'Expired'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-[#9B7D43]/10 text-[#9B7D43] border-[#9B7D43]/30'
                      }`}>
                        {calculateRemaining(todo.dueDate)}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-200">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleStatus(todo.id)}
                        className={`text-sm font-bold ${activeTab === 'Pending' ? 'text-[#9B7D43] hover:text-[#7A6235]' : 'text-[#5A5550] hover:text-[#1C1A17]'}`}
                      >
                        {activeTab === 'Pending' ? 'Complete' : 'Undo'}
                      </button>
                      <button
                        onClick={() => { setSelectedTodo(todo); setFormData({ title: todo.title, dueDate: todo.dueDate.slice(0, 16) }); setIsModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(todo.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-[#D4C9B8]">
            <h3 className="text-2xl font-bold text-[#1C1A17] mb-6">
              {selectedTodo ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[#5A5550] text-sm font-semibold mb-2">Remark / Task Name</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls}
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-[#5A5550] text-sm font-semibold mb-2">Deadline (Date & Time)</label>
                <input
                  type="datetime-local" required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#D4C9B8]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[#5A5550] hover:text-[#1C1A17] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2.5 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-xl font-bold transition-all shadow-sm">
                  {selectedTodo ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
