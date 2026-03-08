import React, { useState, useEffect } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending');

  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
  });

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('adminTodos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    setIsLoaded(true);
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('adminTodos', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTodo) {
      setTodos(todos.map(todo => 
        todo.id === selectedTodo.id 
          ? { ...todo, title: formData.title, dueDate: formData.dueDate, updatedAt: new Date().toISOString() }
          : todo
      ));
    } else {
      const newTodo = {
        id: Date.now(),
        title: formData.title,
        dueDate: formData.dueDate,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      setTodos([newTodo, ...todos]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this task?')) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const newStatus = todo.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...todo, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return todo;
    }));
  };

  const resetForm = () => {
    setFormData({ title: '', dueDate: '' });
    setSelectedTodo(null);
  };

  const calculateRemaining = (dueDate) => {
    if (!dueDate) return 'No deadline';
    const now = new Date();
    const target = new Date(dueDate);
    const diff = target - now;
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    
    return `${days}d ${hours}h`;
  };

  const filteredTodos = todos
    .filter(todo => todo.status === activeTab)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">To-Do Tasks</h2>
          <p className="text-slate-400 mt-1">Manage your deadlines and activities</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800/50 p-1 rounded-xl w-fit mb-6 border border-slate-700/50">
        <button
          onClick={() => setActiveTab('Pending')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'Pending' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'Pending' ? 'bg-indigo-700' : 'bg-slate-700'
          }`}>
            {todos.filter(t => t.status === 'Pending').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('Completed')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'Completed' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'Completed' ? 'bg-indigo-700' : 'bg-slate-700'
          }`}>
            {todos.filter(t => t.status === 'Completed').length}
          </span>
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Remark / Task Name</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">{activeTab === 'Pending' ? 'Remaining' : 'Status'}</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredTodos.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                  No {activeTab.toLowerCase()} tasks found.
                </td>
              </tr>
            ) : (
              filteredTodos.map((todo) => (
                <tr key={todo.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className={`text-white font-medium ${todo.status === 'Completed' ? 'line-through text-slate-500' : ''}`}>
                      {todo.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {activeTab === 'Pending' ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        calculateRemaining(todo.dueDate) === 'Expired' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                      }`}>
                        {calculateRemaining(todo.dueDate)}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-green-500/10 text-green-400 border-green-500/20">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleStatus(todo.id)}
                        className={`text-sm font-bold ${activeTab === 'Pending' ? 'text-teal-400 hover:text-teal-300' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                        {activeTab === 'Pending' ? 'Complete' : 'Undo'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTodo(todo);
                          setFormData({ title: todo.title, dueDate: todo.dueDate.slice(0, 16) });
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-red-400 hover:text-red-300"
                      >
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6">
              {selectedTodo ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Remark / Task Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  placeholder="What needs to be done?"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-semibold mb-2">Deadline (Date & Time)</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                >
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
