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

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);

  const [formData, setFormData] = useState({ moduleNumber: '', title: '', description: '' });
  const [taskFormData, setTaskFormData] = useState({ title: '', category: 'Technical', requiresLink: false });

  const CATEGORIES = ['Technical', 'Miscellaneous', 'Personal Branding'];

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    try {
      const response = await programModuleAPI.getAll();
      if (response.success) setModules(response.data);
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
    setFormData({ moduleNumber: module.moduleNumber, title: module.title, description: module.description || '' });
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
      if (response.success) setModules(modules.map(m => m._id === module._id ? response.data : m));
    } catch (error) {
      alert('Failed to update module lock status');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedModule) return;
    try {
      if (editingTask) {
        const response = await programModuleAPI.updateTask(selectedModule._id, editingTask._id, taskFormData);
        if (response.success) {
          setModules(modules.map(m => m._id === selectedModule._id ? response.data : m));
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setTaskFormData({ title: '', category: 'Technical', requiresLink: false });
        }
      } else {
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
    setTaskFormData({ title: task.title, category: task.category, requiresLink: task.requiresLink || false });
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
        fetchModules();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const inputCls = "w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] outline-none";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1C1A17]">Program Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus /> Add Module
        </button>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <div key={module._id} className="bg-white rounded-xl border border-[#D4C9B8] overflow-hidden">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAF7F2] transition-colors"
              onClick={() => setExpandedModuleId(expandedModuleId === module._id ? null : module._id)}
            >
              <div className="flex items-center gap-4">
                <span className="bg-[#9B7D43]/10 text-[#9B7D43] px-3 py-1 rounded-lg text-sm font-bold border border-[#9B7D43]/30">
                  Module {module.moduleNumber}
                </span>
                <h3 className="text-lg font-semibold text-[#1C1A17]">{module.title}</h3>
                <span className="text-[#5A5550] text-sm">({module.tasks.length} tasks)</span>
                {module.isLocked && (
                  <span className="ml-2 bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs border border-red-200">Locked</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditModule(module); }}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Module"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={(e) => handleToggleLock(e, module)}
                  className={`p-2 rounded-lg transition-colors ${module.isLocked ? 'text-red-500 hover:bg-red-50' : 'text-[#5A5550] hover:text-[#1C1A17] hover:bg-[#F5F0E8]'}`}
                  title={module.isLocked ? "Unlock Module" : "Lock Module"}
                >
                  {module.isLocked ? <FaLock size={14} /> : <FaUnlock size={14} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaTrash size={14} />
                </button>
                <span className="text-[#5A5550]">{expandedModuleId === module._id ? <FaChevronUp /> : <FaChevronDown />}</span>
              </div>
            </div>

            {expandedModuleId === module._id && (
              <div className="p-4 border-t border-[#D4C9B8] bg-[#FAF7F2]">
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setEditingTask(null);
                      setTaskFormData({ title: '', category: 'Technical', requiresLink: false });
                      setIsTaskModalOpen(true);
                    }}
                    className="text-sm bg-white hover:bg-[#F5F0E8] border border-[#D4C9B8] text-[#1C1A17] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaPlus size={12} /> Add Task
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {CATEGORIES.map(category => (
                    <div key={category} className="bg-white rounded-lg p-3 border border-[#D4C9B8]">
                      <h4 className="text-sm font-bold text-[#1C1A17] mb-3 border-b border-[#D4C9B8] pb-2 flex justify-between items-center">
                        {category}
                        <span className="bg-[#F5F0E8] text-[#5A5550] text-xs px-2 py-0.5 rounded-full border border-[#D4C9B8]">
                          {module.tasks.filter(t => t.category === category).length}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {module.tasks.filter(t => t.category === category).map((task) => (
                          <div key={task._id} className="bg-[#FAF7F2] p-2 rounded border border-[#D4C9B8] hover:border-[#9B7D43]/40 transition-colors group">
                            <div className="flex justify-between items-start gap-3">
                              <p className="text-sm font-medium text-[#1C1A17] whitespace-pre-wrap flex-1">{task.title}</p>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => handleEditTask(module, task)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                  title="Edit Task"
                                >
                                  <FaEdit size={12} />
                                </button>
                                <button
                                  onClick={() => { if (window.confirm('Delete this task?')) handleDeleteTask(module._id, task._id); }}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Delete Task"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {module.tasks.filter(t => t.category === category).length === 0 && (
                          <p className="text-xs text-[#9A8A7A] text-center py-2 italic bg-[#FAF7F2] rounded">
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
          <div className="text-center py-12 text-[#5A5550] bg-white rounded-xl border border-dashed border-[#D4C9B8]">
            No modules found. Create one to get started.
          </div>
        )}
      </div>

      {/* Module Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-[#D4C9B8] shadow-2xl">
            <h3 className="text-xl font-bold text-[#1C1A17] mb-4">{isEditMode ? 'Edit Module' : 'Create New Module'}</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-1">Module Number</label>
                <input
                  type="number" required min="1" max="30"
                  value={formData.moduleNumber}
                  onChange={e => setFormData({...formData, moduleNumber: e.target.value})}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-1">Title</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className={inputCls}
                  placeholder="e.g., Module 1: Introduction"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setIsEditMode(false); setEditingModuleId(null); setFormData({ moduleNumber: '', title: '', description: '' }); }}
                  className="px-4 py-2 text-[#5A5550] hover:bg-[#F5F0E8] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors">
                  {isEditMode ? 'Update Module' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-[#D4C9B8] shadow-2xl">
            <h3 className="text-xl font-bold text-[#1C1A17] mb-4">
              {editingTask ? `Edit Task in ${selectedModule?.title}` : `Add Task to ${selectedModule?.title}`}
            </h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-1">Task Content</label>
                <textarea
                  required rows="4"
                  value={taskFormData.title}
                  onChange={e => setTaskFormData({...taskFormData, title: e.target.value})}
                  className={`${inputCls} text-sm resize-none`}
                  placeholder="Describe the task in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-1">Category</label>
                <select
                  value={taskFormData.category}
                  onChange={e => setTaskFormData({...taskFormData, category: e.target.value})}
                  className={inputCls}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox" id="requiresLink"
                  checked={taskFormData.requiresLink}
                  onChange={e => setTaskFormData({...taskFormData, requiresLink: e.target.checked})}
                  className="w-4 h-4 rounded border-[#D4C9B8] text-[#9B7D43] focus:ring-[#9B7D43] cursor-pointer"
                />
                <label htmlFor="requiresLink" className="text-sm font-medium text-[#5A5550] cursor-pointer">
                  Requires Link Submission
                </label>
              </div>
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#D4C9B8]">
                <div>
                  {editingTask && (
                    <button
                      type="button"
                      onClick={handleDeleteTaskFromModal}
                      className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <FaTrash size={10} /> Delete Task
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsTaskModalOpen(false); setEditingTask(null); setTaskFormData({ title: '', category: 'Technical', requiresLink: false }); }}
                    className="px-4 py-2 text-[#5A5550] hover:bg-[#F5F0E8] rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg text-sm font-bold transition-colors">
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
