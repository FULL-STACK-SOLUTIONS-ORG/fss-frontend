import React, { useState, useEffect } from 'react';
import { programModuleAPI } from '../../services/api';
import { FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp, FaLock, FaUnlock } from 'react-icons/fa';

const ProgramManagement = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  
  // Edit States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);

  const [formData, setFormData] = useState({
    moduleNumber: '',
    title: '',
    description: ''
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    category: 'Technical',
    requiresLink: false
  });

  const CATEGORIES = ['Technical', 'Miscellaneous', 'Personal Branding'];

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await programModuleAPI.getAll();
      if (response.success) {
        setModules(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && editingModuleId) {
        const response = await programModuleAPI.update(editingModuleId, formData);
        if (response.success) {
          setModules(modules.map(m => m._id === editingModuleId ? response.data : m));
          setIsModalOpen(false);
          setFormData({ moduleNumber: '', title: '', description: '' });
          setIsEditMode(false);
          setEditingModuleId(null);
        }
      } else {
        const response = await programModuleAPI.create(formData);
        if (response.success) {
          setModules([...modules, response.data]);
          setIsModalOpen(false);
          setFormData({ moduleNumber: '', title: '', description: '' });
        }
      }
    } catch (error) {
      alert(error.message || 'Failed to save module');
    }
  };

  const handleEditModule = (module) => {
    setIsEditMode(true);
    setEditingModuleId(module._id);
    setFormData({
      moduleNumber: module.moduleNumber,
      title: module.title,
      description: module.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      await programModuleAPI.delete(id);
      setModules(modules.filter(m => m._id !== id));
    } catch (error) {
      alert('Failed to delete module');
    }
  };

  const handleToggleLock = async (e, module) => {
    e.stopPropagation();
    try {
      const response = await programModuleAPI.update(module._id, { isLocked: !module.isLocked });
      if (response.success) {
        setModules(modules.map(m => m._id === module._id ? response.data : m));
      }
    } catch (error) {
      alert('Failed to update module lock status');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedModule) return;

    try {
      if (editingTask) {
        // Update Task
        const response = await programModuleAPI.updateTask(selectedModule._id, editingTask._id, taskFormData);
        if (response.success) {
           setModules(modules.map(m => m._id === selectedModule._id ? response.data : m));
           setIsTaskModalOpen(false);
           setEditingTask(null);
           setTaskFormData({ title: '', category: 'Technical', requiresLink: false });
        }
      } else {
        // Create Task
        const response = await programModuleAPI.addTask(selectedModule._id, taskFormData);
        if (response.success) {
          setModules(modules.map(m => m._id === selectedModule._id ? response.data : m));
          setIsTaskModalOpen(false);
          setTaskFormData({ title: '', category: 'Technical', requiresLink: false });
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save task');
    }
  };

  const handleEditTask = (module, task) => {
    setSelectedModule(module);
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      category: task.category,
      requiresLink: task.requiresLink || false
    });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTaskFromModal = async () => {
    if (!selectedModule || !editingTask) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    await handleDeleteTask(selectedModule._id, editingTask._id);
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = async (moduleId, taskId) => {
    try {
      const response = await programModuleAPI.deleteTask(moduleId, taskId);
      if (response.success) {
         setModules(modules.map(m => m._id === moduleId ? response.data : m));
      } else {
         // Fallback if API doesn't return updated module, fetch all
         fetchModules();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Program Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus /> Add Module
        </button>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <div key={module._id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-750 transition-colors"
              onClick={() => setExpandedModuleId(expandedModuleId === module._id ? null : module._id)}
            >
              <div className="flex items-center gap-4">
                <span className="bg-teal-900/50 text-teal-400 px-3 py-1 rounded-lg text-sm font-bold border border-teal-500/30">
                  Module {module.moduleNumber}
                </span>
                <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                <span className="text-slate-400 text-sm">({module.tasks.length} tasks)</span>
                {module.isLocked && (
                    <span className="ml-2 bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs border border-red-500/20">Locked</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditModule(module);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Edit Module"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={(e) => handleToggleLock(e, module)}
                  className={`p-2 rounded-lg transition-colors ${module.isLocked ? 'text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  title={module.isLocked ? "Unlock Module" : "Lock Module"}
                >
                  {module.isLocked ? <FaLock size={14} /> : <FaUnlock size={14} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteModule(module._id);
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <FaTrash size={14} />
                </button>
                {expandedModuleId === module._id ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {expandedModuleId === module._id && (
              <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                 <div className="mb-4 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedModule(module);
                        setEditingTask(null);
                        setTaskFormData({ title: '', category: 'Technical', requiresLink: false });
                        setIsTaskModalOpen(true);
                      }}
                      className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FaPlus size={12} /> Add Task
                    </button>
                 </div>
                 
                 <div className="grid gap-4 md:grid-cols-3">
                    {CATEGORIES.map(category => (
                      <div key={category} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                         <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2 flex justify-between items-center">
                            {category}
                            <span className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">
                              {module.tasks.filter(t => t.category === category).length}
                            </span>
                         </h4>
                          <div className="space-y-2">
                            {module.tasks.filter(t => t.category === category).map((task) => (
                              <div key={task._id} className="bg-slate-700/50 p-2 rounded border border-slate-600/50 hover:border-teal-500/30 transition-colors group">
                                <div className="flex justify-between items-start gap-3">
                                    <p className="text-sm font-medium text-white whitespace-pre-wrap flex-1">{task.title}</p>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        <button 
                                            onClick={() => handleEditTask(module, task)}
                                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded"
                                            title="Edit Task"
                                        >
                                            <FaEdit size={12} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(window.confirm('Delete this task?')) {
                                                    handleDeleteTask(module._id, task._id);
                                                }
                                            }}
                                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                                            title="Delete Task"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </div>
                              </div>
                            ))}
                            {module.tasks.filter(t => t.category === category).length === 0 && (
                              <p className="text-xs text-slate-500 text-center py-2 italic bg-slate-800/50 rounded">
                                No tasks
                              </p>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        ))}

        {modules.length === 0 && !loading && (
           <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             No modules found. Create one to get started.
           </div>
        )}
      </div>

      {/* Module Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{isEditMode ? 'Edit Module' : 'Create New Module'}</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Module Number</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={formData.moduleNumber}
                  onChange={e => setFormData({...formData, moduleNumber: e.target.value})}
                  className="w-full bg-slate-700 border-slate-600 rounded-lg text-white px-4 py-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-700 border-slate-600 rounded-lg text-white px-4 py-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., Module 1: Introduction"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingModuleId(null);
                    setFormData({ moduleNumber: '', title: '', description: '' });
                  }}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  {isEditMode ? 'Update Module' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
                {editingTask ? `Edit Task in ${selectedModule?.title}` : `Add Task to ${selectedModule?.title}`}
            </h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Content</label>
                <textarea
                  required
                  rows="4"
                  value={taskFormData.title}
                  onChange={e => setTaskFormData({...taskFormData, title: e.target.value})}
                  className="w-full bg-slate-700 border-slate-600 rounded-lg text-white px-4 py-3 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
                  placeholder="Describe the task in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={taskFormData.category}
                  onChange={e => setTaskFormData({...taskFormData, category: e.target.value})}
                  className="w-full bg-slate-700 border-slate-600 rounded-lg text-white px-4 py-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="requiresLink"
                  checked={taskFormData.requiresLink}
                  onChange={e => setTaskFormData({...taskFormData, requiresLink: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-600 text-teal-600 focus:ring-teal-500 bg-slate-700 cursor-pointer"
                />
                <label htmlFor="requiresLink" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Requires Link Submission
                </label>
              </div>
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-700">
                <div>
                  {editingTask && (
                    <button
                      type="button"
                      onClick={handleDeleteTaskFromModal}
                      className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <FaTrash size={10} /> Delete Task
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                        setIsTaskModalOpen(false);
                        setEditingTask(null);
                        setTaskFormData({ title: '', category: 'Technical', requiresLink: false });
                    }}
                    className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold"
                  >
                    {editingTask ? 'Save Changes' : 'Add Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;
