import React, { useState, useEffect } from 'react';
import { socialMediaAPI } from '../../services/api';
import { FaUser, FaCalendar, FaHashtag, FaEye } from 'react-icons/fa';

const StudentsSocialMedia = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStudentPosts(); }, []);

  const fetchStudentPosts = async () => {
    try {
      setLoading(true);
      const response = await socialMediaAPI.getAllStudentPosts();
      if (response.success) setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch student posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1C1A17]">Students Social Media Tracker</h2>
        <div className="text-sm text-[#5A5550]">
          Total Posts: <span className="text-[#1C1A17] font-semibold">{posts.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#D4C9B8] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#5A5550]">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-[#5A5550]">No posts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF7F2] text-[#5A5550] text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Impressions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D4]">
                {posts.map((post) => {
                  const date = new Date(post.scheduledDate);
                  return (
                    <tr key={post._id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-[#9A8A7A]" size={14} />
                          <div>
                            <div className="text-[#1C1A17] font-medium">{post.userId?.name || 'Unknown'}</div>
                            <div className="text-xs text-[#9A8A7A]">{post.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaHashtag className="text-[#9A8A7A]" size={12} />
                          <span className="text-[#5A5550]">Module {post.moduleId?.moduleNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-[#9A8A7A]" size={12} />
                          <span className="text-[#5A5550]">{date.toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#5A5550]">{post.topic}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaEye className="text-[#9A8A7A]" size={14} />
                          <span className="text-[#9B7D43] font-medium">
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
