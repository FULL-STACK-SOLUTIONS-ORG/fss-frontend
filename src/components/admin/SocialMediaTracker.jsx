import React, { useState, useEffect } from 'react';
import { socialMediaAPI } from '../../services/api';

const SocialMediaTracker = ({ statusFilter = 'all' }) => {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    Scheduled: 0,
    Posted: 0,
    Missed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  const [formData, setFormData] = useState({
    accountName: '',
    platform: 'LinkedIn',
    category: 'Educational',
    topic: '',
    scheduledDate: '',
    status: 'Scheduled',
    impressions: {
      day1: 0,
      day2: 0,
      day3: 0
    }
  });

  const [categories, setCategories] = useState([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [accounts, setAccounts] = useState([]);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const platforms = ['LinkedIn', 'Instagram', 'YouTube'];

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [statusFilter]);

  // Derive accounts and categories from existing posts
  useEffect(() => {
    if (posts.length > 0) {
      const uniqueAccounts = [...new Set(posts.map(post => post.accountName).filter(Boolean))];
      const uniqueCategories = [...new Set(posts.map(post => post.category).filter(Boolean))];
      
      // Sort them alphabetically for better UX
      uniqueAccounts.sort();
      uniqueCategories.sort();

      setAccounts(uniqueAccounts);
      setCategories(uniqueCategories);
    }
  }, [posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await socialMediaAPI.getAll(params);
      if (response.success) {
        setPosts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await socialMediaAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        accountName: formData.accountName,
        platform: formData.platform,
        category: formData.category,
        topic: formData.topic,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        status: formData.status,
        impressions: formData.impressions
        // Note: moduleId is NOT included for admin posts
      };

      console.log('Admin submitting payload:', payload);

      if (selectedPost) {
        await socialMediaAPI.update(selectedPost._id, payload);
      } else {
        await socialMediaAPI.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchPosts();
      fetchStats();
    } catch (err) {
      console.error('Failed to save post:', err);
      alert(`Failed to save post: ${err.message || 'Please check console for details'}`);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
      setIsAddCategoryOpen(false);
    }
  };

  const handleAddAccount = () => {
    if (newAccount.trim() && !accounts.includes(newAccount.trim())) {
      setAccounts([...accounts, newAccount.trim()]);
      setFormData({ ...formData, accountName: newAccount.trim() });
      setNewAccount('');
      setIsAddAccountOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await socialMediaAPI.delete(id);
      fetchPosts();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
    }
  };

  const resetForm = () => {
    setFormData({
      accountName: '',
      platform: 'LinkedIn',
      category: '',
      topic: '',
      scheduledDate: '',
      status: 'Scheduled',
      impressions: { day1: 0, day2: 0, day3: 0 }
    });
    setSelectedPost(null);
  };

  const openEditModal = (post) => {
    setSelectedPost(post);
    
    // Convert UTC date to local datetime string for input
    const date = new Date(post.scheduledDate);
    const localDatetime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);

    setFormData({
      accountName: post.accountName,
      platform: post.platform,
      category: post.category || 'Educational',
      topic: post.topic,
      scheduledDate: localDatetime,
      status: post.status,
      impressions: post.impressions || { day1: 0, day2: 0, day3: 0 }
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>


      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">All Posts</h2>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Post
        </button>
      </div>

      {/* Date-Centric List View */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl">
          <p className="text-slate-400 text-lg">No posts found</p>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-black-md overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-700/50 text-slate-300 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold border-b border-slate-600">Date</th>
                  <th className="p-4 font-semibold border-b border-slate-600">Time</th>
                  <th className="p-4 font-semibold border-b border-slate-600">Account</th>
                  <th className="p-4 font-semibold border-b border-slate-600">Platform</th>
                  <th className="p-4 font-semibold border-b border-slate-600">Category</th>
                  <th className="p-4 font-semibold border-b border-slate-600 w-1/5">Topic</th>
                  <th className="p-4 font-semibold border-b border-slate-600 text-center">Day 1</th>
                  <th className="p-4 font-semibold border-b border-slate-600 text-center">Day 2</th>
                  <th className="p-4 font-semibold border-b border-slate-600 text-center">Day 3</th>
                  <th className="p-4 font-semibold border-b border-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {(() => {
                  const sortedPosts = [...posts].sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
                  const indexOfLastPost = currentPage * itemsPerPage;
                  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
                  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
                  
                  return currentPosts.map(post => (
                  <tr key={post._id} className="hover:bg-slate-750 transition-colors">
                    <td className="p-4 text-sm text-white font-semibold">
                      {new Date(post.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-sm text-slate-400 font-mono">
                      {new Date(post.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-sm text-white font-medium">{post.accountName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                         post.platform === 'LinkedIn' ? 'bg-blue-900/50 text-blue-300 border border-blue-900' :
                         post.platform === 'Instagram' ? 'bg-pink-900/50 text-pink-300 border border-pink-900' :
                         'bg-red-900/50 text-red-300 border border-red-900'
                      }`}>
                        {post.platform}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      <span className="px-2 py-1 rounded bg-slate-700/50 border border-slate-600 text-xs">
                        {post.category || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <div className="line-clamp-2" title={post.topic}>{post.topic || '-'}</div>
                    </td>
                    <td className="p-4 text-center text-sm font-bold text-white bg-slate-800/30">
                      {post.impressions?.day1 || 0}
                    </td>
                    <td className="p-4 text-center text-sm font-bold text-white bg-slate-800/30">
                      {post.impressions?.day2 || 0}
                    </td>
                    <td className="p-4 text-center text-sm font-bold text-white bg-slate-800/30">
                      {post.impressions?.day3 || 0}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(post)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(post._id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {posts.length > itemsPerPage && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, posts.length)} of {posts.length} posts
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === 1
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(posts.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(posts.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(posts.length / itemsPerPage)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === Math.ceil(posts.length / itemsPerPage)
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">{selectedPost ? 'Edit Post' : 'Add Post'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Account Name</label>
                <div className="flex gap-2">
                  <select
                    value={formData.accountName}
                    onChange={e => setFormData({...formData, accountName: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {!formData.accountName && <option value="">Select Account</option>}
                    {accounts.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddAccountOpen(true)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white font-bold text-xl"
                    title="Add Account"
                  >
                    +
                  </button>
                </div>
              </div>
              {isAddAccountOpen && (
                <div className="flex gap-2 items-center bg-slate-700 p-2 rounded-lg">
                  <input
                    type="text"
                    value={newAccount}
                    onChange={e => setNewAccount(e.target.value)}
                    placeholder="New account name"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddAccount}
                    className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-500"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddAccountOpen(false)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  >
                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Category</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryOpen(true)}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white font-bold text-xl"
                      title="Add Category"
                    >
                      +
                    </button>
                  </div>
                </div>
                {isAddCategoryOpen && (
                  <div className="col-span-2 flex gap-2 items-center bg-slate-700 p-2 rounded-lg">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="New category name"
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-500"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryOpen(false)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledDate}
                    onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="Enter post topic..."
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Posted">Posted</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>

              <div className="border-t border-slate-700 pt-4 mt-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Impression Tracking
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Day 1 Impressions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.impressions.day1}
                      onChange={e => setFormData({ ...formData, impressions: { ...formData.impressions, day1: parseInt(e.target.value) || 0 } })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Day 2 Impressions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.impressions.day2}
                      onChange={e => setFormData({ ...formData, impressions: { ...formData.impressions, day2: parseInt(e.target.value) || 0 } })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Day 3 Impressions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.impressions.day3}
                      onChange={e => setFormData({ ...formData, impressions: { ...formData.impressions, day3: parseInt(e.target.value) || 0 } })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
              


              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  {selectedPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTracker;
