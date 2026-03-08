import React, { useState, useEffect } from 'react';
import { socialMediaAPI, progressAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const StudentSocialMediaTracker = ({ moduleId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [moduleConnections, setModuleConnections] = useState('');
  const [previousModuleConnections, setPreviousModuleConnections] = useState(null);
  
  const [formData, setFormData] = useState({
    category: '',
    topic: '',
    scheduledDate: '',
    moduleId: moduleId,
    impressions: {
      day3: ''
    }
  });

  const categories = ['Learning Progress', 'Achievement', 'Poll Questions', 'Project Progress', 'Job Related'];

  useEffect(() => {
    if (moduleId) {
      fetchPosts();
      loadModuleConnections();
    }
  }, [moduleId]);

  const loadModuleConnections = async () => {
    try {
      const response = await progressAPI.getProgress();
      if (response.success && response.progress.moduleReviews) {
        // Find current module connections
        const moduleReview = response.progress.moduleReviews.find(
          mr => mr.moduleId?.toString() === moduleId?.toString()
        );
        if (moduleReview && moduleReview.connections) {
          setModuleConnections(moduleReview.connections.toString());
        } else {
          setModuleConnections('');
        }

        // Find previous module connections (assuming sequential module numbers)
        // Get all module reviews sorted by moduleId
        const sortedReviews = response.progress.moduleReviews
          .filter(mr => mr.connections > 0)
          .sort((a, b) => a.moduleId.toString().localeCompare(b.moduleId.toString()));
        
        const currentIndex = sortedReviews.findIndex(
          mr => mr.moduleId?.toString() === moduleId?.toString()
        );
        
        if (currentIndex > 0) {
          setPreviousModuleConnections(sortedReviews[currentIndex - 1].connections);
        } else {
          setPreviousModuleConnections(null);
        }
      }
    } catch (err) {
      console.error('Failed to load connections:', err);
    }
  };

  const saveModuleConnections = async (connections) => {
    try {
      await progressAPI.updateModuleConnections(moduleId, connections);
    } catch (err) {
      console.error('Failed to save connections:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await socialMediaAPI.getAll({ includeModulePosts: 'true' });
      if (response.success) {
        console.log('All posts:', response.data);
        console.log('Current moduleId:', moduleId);
        // Filter posts by moduleId - convert both to strings for comparison
        const modulePosts = response.data.filter(post => post.moduleId?.toString() === moduleId?.toString());
        console.log('Filtered posts for this module:', modulePosts);
        setPosts(modulePosts);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        accountName: 'My Account', // Default for students
        platform: 'LinkedIn', // Default platform to satisfy backend validation
        category: formData.category,
        topic: formData.topic,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        status: 'Scheduled',
        moduleId: moduleId, // Add moduleId to associate post with current module
        impressions: {
          day1: 0,
          day2: 0,
          day3: formData.impressions.day3 ? parseInt(formData.impressions.day3) : 0,
          week2: 0
        }
      };

      console.log('Submitting payload:', payload);

      if (selectedPost) {
        const response = await socialMediaAPI.update(selectedPost._id, payload);
        console.log('Update response:', response);
      } else {
        const response = await socialMediaAPI.create(payload);
        console.log('Create response:', response);
      }

      fetchPosts();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save post:', err);
      alert(`Failed to save post: ${err.message || 'Please try again.'}`);
    }
  };

  const handleEdit = (post) => {
    const date = new Date(post.scheduledDate);
    setSelectedPost(post);
    setFormData({
      category: post.category,
      topic: post.topic,
      scheduledDate: date.toISOString().split('T')[0],
      impressions: post.impressions || { day3: '' }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await socialMediaAPI.delete(id);
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setFormData({
      category: '',
      topic: '',
      scheduledDate: '',
      moduleId: moduleId,
      impressions: { day3: '' }
    });
  };

  const canEditImpressions = (post) => {
    const postDate = new Date(post.scheduledDate);
    const threeDaysLater = new Date(postDate);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    return new Date() >= threeDaysLater;
  };

  return (
    <div className="space-y-6">
      {/* Compact Header with Connections and Add Post Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="moduleConnections" className="text-sm font-medium text-slate-400 whitespace-nowrap">
            Connections:
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            id="moduleConnections"
            value={moduleConnections}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d+$/.test(val)) {
                setModuleConnections(val);
              }
            }}
            onBlur={(e) => {
              if (e.target.value) {
                saveModuleConnections(e.target.value);
              }
            }}
            className="w-32 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500"
            placeholder="0"
          />
          {previousModuleConnections !== null && moduleConnections && (
            <div className="flex items-center gap-1">
              {(() => {
                const increment = parseInt(moduleConnections) - previousModuleConnections;
                const isPositive = increment > 0;
                const isNegative = increment < 0;
                
                return (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    isPositive ? 'text-green-400 bg-green-900/20' : 
                    isNegative ? 'text-red-400 bg-red-900/20' : 
                    'text-slate-400 bg-slate-800'
                  }`}>
                    {isPositive && '+'}{increment}
                  </span>
                );
              })()}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-lg hover:shadow-teal-500/20"
        >
          <FaPlus size={14} /> Add Post
        </button>
      </div>

      {/* Posts Table */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No posts tracked yet. Click "Add Post" to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Impressions</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {posts.map((post) => {
                  const date = new Date(post.scheduledDate);
                  const canEdit = canEditImpressions(post);
                  
                  return (
                    <tr key={post._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">
                        {date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{post.category}</td>
                      <td className="px-6 py-4 text-slate-300">{post.topic}</td>
                      <td className="px-6 py-4">
                        {post.impressions?.day3 && post.impressions.day3 > 0 ? (
                          <span className="text-teal-400 font-medium">
                            {post.impressions.day3}
                          </span>
                        ) : canEdit ? (
                          <span className="text-slate-500 text-xs italic">
                            Not entered
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs italic">
                            Available in {Math.ceil((new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000) - new Date()) / (24 * 60 * 60 * 1000))} days
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-700">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">
                {selectedPost ? 'Edit Post' : 'Add New Post'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500"
                  placeholder="Enter post topic"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Impressions Count
                  <span className="text-xs text-slate-500 ml-2">(Enter after 3 days from post date)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.impressions.day3}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setFormData({ 
                        ...formData, 
                        impressions: { ...formData.impressions, day3: val }
                      });
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-teal-500"
                  placeholder="Enter total impressions"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors"
                >
                  {selectedPost ? 'Update' : 'Add'} Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSocialMediaTracker;
