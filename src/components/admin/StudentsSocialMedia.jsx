import React, { useState, useEffect } from 'react';
import { socialMediaAPI } from '../../services/api';
import { FaUser, FaCalendar, FaHashtag, FaEye } from 'react-icons/fa';

const StudentsSocialMedia = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentPosts();
  }, []);

  const fetchStudentPosts = async () => {
    try {
      setLoading(true);
      
      const response = await socialMediaAPI.getAllStudentPosts();
      console.log('API Response:', response);
      if (response.success) {
        console.log('Posts data:', response.data);
        console.log('Sample post:', response.data[0]);
        setPosts(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch student posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Students Social Media Tracker</h2>
        <div className="text-sm text-slate-400">
          Total Posts: <span className="text-white font-semibold">{posts.length}</span>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No posts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Impressions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {posts.map((post) => {
                  const date = new Date(post.scheduledDate);
                  
                  return (
                    <tr key={post._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-slate-500" size={14} />
                          <div>
                            <div className="text-slate-300 font-medium">{post.userId?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{post.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaHashtag className="text-slate-500" size={12} />
                          <span className="text-slate-300">
                            Module {post.moduleId?.moduleNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-slate-500" size={12} />
                          <span className="text-slate-300">{date.toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-900/20 text-purple-400 rounded text-xs font-medium">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{post.topic}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaEye className="text-slate-500" size={14} />
                          <span className="text-teal-400 font-medium">
                            {post.impressions?.day3 || 0}
                          </span>
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
    </div>
  );
};

export default StudentsSocialMedia;
