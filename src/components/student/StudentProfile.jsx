import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { FaUser, FaIdBadge, FaCalendar, FaMapMarkerAlt, FaVenusMars, FaGraduationCap, FaEnvelope, FaPhone, FaLaptopCode, FaLinkedin, FaCode } from 'react-icons/fa';

const StudentProfile = () => {
    const { user, updateUser } = useAuth(); // Assuming updateUser updates context
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        place: '',
        gender: '',
        educationalQualification: '',
        mobileNo: '',
        domain: '',
        linkedinId: '',
        leetcodeId: ''
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                place: user.place || '',
                gender: user.gender || '',
                educationalQualification: user.educationalQualification || '',
                mobileNo: user.mobileNo || '',
                domain: user.domain || '',
                linkedinId: user.linkedinId || '',
                leetcodeId: user.leetcodeId || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancelEdit = () => {
        // Reset form data to original user data
        if (user) {
            setFormData({
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                place: user.place || '',
                gender: user.gender || '',
                educationalQualification: user.educationalQualification || '',
                mobileNo: user.mobileNo || '',
                domain: user.domain || '',
                linkedinId: user.linkedinId || '',
                leetcodeId: user.leetcodeId || ''
            });
        }
        setIsEditing(false);
        setMsg({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            const response = await userAPI.updateProfile(formData);
            if (response.success) {
                setMsg({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);
                // If context provides updateUser, call it
                // Assuming it might fail if context doesn't expose it, checking existence first if possible, 
                // but usually auth context should have it. If not, page reload might be needed to see reflected static data like name.
                // However, updated fields are in formData.
            }
        } catch (error) {
            console.error('Update error', error);
            setMsg({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-white">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                    My Profile
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-transparent border border-teal-500 text-teal-400 font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Update Profile
                    </button>
                )}
            </div>

            {msg.text && (
                <div className={`p-4 rounded-lg border ${msg.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'}`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Read Only Section */}
                <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                    <h3 className="text-xl font-semibold text-slate-200 mb-4 border-b border-slate-700 pb-2">Basic Info (Read Only)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                <FaUser className="text-teal-500" /> Full Name
                            </label>
                            <input 
                                type="text" 
                                value={user.name} 
                                disabled 
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                <FaIdBadge className="text-teal-500" /> Registration Number
                            </label>
                            <input 
                                type="text" 
                                value={user.registrationNumber || 'Not Assigned'} 
                                disabled 
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                <FaEnvelope className="text-teal-500" /> Email ID
                            </label>
                            <input 
                                type="text" 
                                value={user.email} 
                                disabled 
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Editable Section */}
                <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 shadow-xl">
                    <h3 className="text-xl font-semibold text-slate-200 mb-4 border-b border-slate-700 pb-2">Personal Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaCalendar className="text-blue-500" /> Date of Birth
                            </label>
                            <input 
                                type="date" 
                                name="dateOfBirth"
                                value={formData.dateOfBirth} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaMapMarkerAlt className="text-blue-500" /> Place
                            </label>
                            <input 
                                type="text" 
                                name="place"
                                value={formData.place} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g. Cochin, Kerala"
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                         <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaVenusMars className="text-blue-500" /> Gender
                            </label>
                            <select 
                                name="gender"
                                value={formData.gender} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                         <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaGraduationCap className="text-blue-500" /> Educational Qualification
                            </label>
                            <input 
                                type="text" 
                                name="educationalQualification"
                                value={formData.educationalQualification} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g. B.Tech in CSE"
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaPhone className="text-blue-500" /> Mobile No
                            </label>
                            <input 
                                type="text" 
                                name="mobileNo"
                                value={formData.mobileNo} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g. +91 9876543210"
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaLaptopCode className="text-blue-500" /> Domain
                            </label>
                            <input 
                                type="text" 
                                name="domain"
                                value={formData.domain} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g. MERN Stack"
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                         <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaLinkedin className="text-blue-500" /> Linkedin ID (URL)
                            </label>
                            <input 
                                type="text" 
                                name="linkedinId"
                                value={formData.linkedinId} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="https://linkedin.com/in/..."
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                         <div className="space-y-2">
                             <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                <FaCode className="text-blue-500" /> LeetCode ID (URL)
                            </label>
                            <input 
                                type="text" 
                                name="leetcodeId"
                                value={formData.leetcodeId} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="https://leetcode.com/..."
                                className={`w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-transparent border border-slate-600 text-slate-400 font-bold py-3 px-8 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-transparent border border-blue-500 text-blue-400 font-bold py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default StudentProfile;
