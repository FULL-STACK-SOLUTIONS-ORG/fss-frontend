import React, { useState, useEffect } from 'react';
import { progressAPI } from '../../services/api';
import { FaTrash } from 'react-icons/fa';

const TaskVerification = () => {
    const [rawTasks, setRawTasks] = useState([]);
    const [groupedSessions, setGroupedSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal State
    const [activeSession, setActiveSession] = useState(null); // The session (user+module) currently open
    const [taskComments, setTaskComments] = useState({}); // Map taskId -> comment
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            // Fetch all pending/all tasks. For now default to all, or maybe filter?
            // "verify all the tasks submitted by user".
            // Let's fetch 'all' to be safe, or 'pending' if we only want new ones.
            // The user didn't specify filter, but usually "verification" implies pending.
            // However, seeing old ones is useful. Let's fetch all and let user decide?
            // Or maybe just fetch recently submitted.
            // Using existing API which supports filtering.
            const response = await progressAPI.getAllSubmittedTasks({ limit: 1000, status: 'all' });
            if (response.success) {
                setRawTasks(response.data);
                processGroups(response.data);
            }
        } catch (error) {
            console.error('Error fetching tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const processGroups = (tasks) => {
        // Group by User + Module
        const groups = {};
        tasks.forEach(task => {
            const key = `${task.userId}-${task.moduleNumber}`;
            if (!groups[key]) {
                groups[key] = {
                    key,
                    userId: task.userId,
                    userName: task.userName,
                    userEmail: task.userEmail,
                    moduleNumber: task.moduleNumber,
                    moduleTitle: task.moduleTitle,
                    tasks: [],
                    lastSubmitted: task.checkedAt
                };
            }
            groups[key].tasks.push(task);
            // Update lastSubmitted if this task is newer
            if (new Date(task.checkedAt) > new Date(groups[key].lastSubmitted)) {
                groups[key].lastSubmitted = task.checkedAt;
            }
        });

        // Convert to array and sort by most recent submission
        const sortedGroups = Object.values(groups).sort((a, b) => new Date(b.lastSubmitted) - new Date(a.lastSubmitted));
        
        // Filter out sessions where ALL tasks are already approved
        const pendingGroups = sortedGroups.filter(group => 
            !group.tasks.every(t => t.status === 'approved')
        );

        setGroupedSessions(pendingGroups);
    };

    const openSessionModal = (session) => {
        // Initialize comments with existing ones
        const initialComments = {};
        session.tasks.forEach(t => {
            initialComments[t.taskId.toString()] = t.adminComment || '';
        });
        setTaskComments(initialComments);
        setActiveSession(session);
    };

    const handleCommentChange = (taskId, value) => {
        setTaskComments(prev => ({
            ...prev,
            [taskId.toString()]: value
        }));
    };

    const handleSubmitAll = async () => {
        if (!activeSession) return;
        setSubmitting(true);
        try {
            // Process all tasks in the session
            // We need to save comments. status is implied "checked"/"verified"? 
            // User said "no need approval". But backend requires status enum.
            // I'll set status to 'approved' (meaning verified/seen) for all processed tasks.
            
            const promises = activeSession.tasks.map(task => {
                const comment = taskComments[task.taskId.toString()];
                // Use the task's current status if it was already updated individually,                 // otherwise default to 'approved' if we're bulk-verifying.
                const status = task.status === 'rejected' ? 'rejected' : 'approved';
                
                return progressAPI.verifyTask(
                    task.userId,
                    task.taskId,
                    status,
                    comment
                );
            });

            await Promise.all(promises);
            
            // Refresh Data
            await fetchTasks();
            setActiveSession(null);
            alert('Feedback submitted successfully!');

        } catch (error) {
            console.error('Error submitting feedback', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSession = async (session) => {
        if (!window.confirm(`Are you sure you want to delete ALL task submissions for ${session.userName} in Module ${session.moduleNumber}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await progressAPI.deleteModuleTasks(session.userId, session.moduleNumber);
            if (response.success) {
                alert('Tasks deleted successfully');
                fetchTasks(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting session', error);
            alert('Failed to delete tasks. Please try again.');
        }
    };

    const handleDeleteIndividualTask = async (task) => {
        if (!window.confirm(`Are you sure you want to delete the submission for "${task.taskTitle}"?`)) {
            return;
        }

        try {
            const response = await progressAPI.deleteTaskProgress(task.userId, task.taskId);
            if (response.success) {
                // Remove task from active session local state
                setActiveSession(prev => ({
                    ...prev,
                    tasks: prev.tasks.filter(t => t.taskId !== task.taskId)
                }));
                // If no tasks left in session, close modal and refresh
                if (activeSession.tasks.length <= 1) {
                    setActiveSession(null);
                    fetchTasks();
                }
            }
        } catch (error) {
            console.error('Error deleting task', error);
            alert('Failed to delete task submission');
        }
    };

    const handleUpdateIndividualTaskStatus = async (task, newStatus) => {
        const comment = taskComments[task.taskId.toString()] || '';
        if (newStatus === 'rejected' && !comment.trim()) {
            alert('Please provide a comment for rejected tasks.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await progressAPI.verifyTask(
                task.userId,
                task.taskId,
                newStatus,
                comment
            );
            if (response.success) {
                // Update local session state
                setActiveSession(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t => 
                        t.taskId.toString() === task.taskId.toString() ? { ...t, status: newStatus, adminComment: comment } : t
                    )
                }));
                
                // Refresh background tasks
                fetchTasks();
            }
        } catch (error) {
            console.error('Error updating task status', error);
            alert('Failed to update task status');
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <div className="space-y-6">

            {/* Grouped List */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
                 {loading ? (
                   <div className="p-12 text-center text-slate-400">Loading modules...</div>
                ) : groupedSessions.length === 0 ? (
                   <div className="p-12 text-center text-slate-400">No submitted tasks found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User Name</th>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">Last Activity</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {groupedSessions.map(session => (
                                    <tr key={session.key} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{session.userName}</div>
                                            <div className="text-xs text-slate-500">{session.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-300">
                                                <span className="text-teal-400 font-bold">Module {session.moduleNumber}</span>: {session.moduleTitle}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(session.lastSubmitted).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openSessionModal(session)}
                                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    Review Tasks
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSession(session)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete all submissions for this module"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detailed Review Modal */}
            {activeSession && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full border border-slate-700 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold text-white">Review Tasks</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    {activeSession.userName} • Module {activeSession.moduleNumber}
                                </p>
                            </div>
                            <button 
                                onClick={() => setActiveSession(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content - Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeSession.tasks.map((task, index) => (
                                <div key={task.taskId} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                                    #{index + 1}
                                                </span>
                                                <h4 className="font-semibold text-slate-200">{task.taskTitle}</h4>
                                            </div>
                                            <span className="text-xs text-slate-500 mt-1 inline-block">
                                                Category: {task.category}
                                            </span>
                                            {task.submissionLink && (
                                                <div className="mt-2">
                                                    <div className="text-[10px] text-slate-500 mb-1 font-mono truncate max-w-xs bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                                                        {task.submissionLink}
                                                    </div>
                                                    <a 
                                                        href={task.submissionLink?.match(/^https?:\/\//i) ? task.submissionLink : `https://${task.submissionLink}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 text-xs hover:text-blue-300 hover:underline flex items-center gap-1 font-medium"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        Open Link
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    task.status === 'approved' ? 'text-green-400 bg-green-900/20 border border-green-500/20' : 
                                                    task.status === 'rejected' ? 'text-red-400 bg-red-900/20 border border-red-500/20' : 
                                                    'text-yellow-400 bg-yellow-900/20 border border-yellow-500/20'
                                                }`}>
                                                    {task.status}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteIndividualTask(task)}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                                    title="Delete this submission"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                            
                                            <div className="flex gap-2 mt-1">
                                                <button
                                                    disabled={submitting || task.status === 'approved'}
                                                    onClick={() => handleUpdateIndividualTaskStatus(task, 'approved')}
                                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${
                                                        task.status === 'approved'
                                                        ? 'bg-green-500/20 text-green-500 border border-green-500/30 cursor-not-allowed'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-green-600 hover:text-white border border-slate-600'
                                                    }`}
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    disabled={submitting || task.status === 'rejected'}
                                                    onClick={() => handleUpdateIndividualTaskStatus(task, 'rejected')}
                                                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${
                                                        task.status === 'rejected'
                                                        ? 'bg-red-500/20 text-red-500 border border-red-500/30 cursor-not-allowed'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white border border-slate-600'
                                                    }`}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Admin Comment / Feedback</label>
                                        <textarea
                                            value={taskComments[task.taskId] || ''}
                                            onChange={(e) => handleCommentChange(task.taskId, e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-500 min-h-[60px]"
                                            placeholder="Write your feedback here..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-800 bg-slate-800/50 rounded-b-xl flex justify-end gap-3">
                            <button
                                onClick={() => setActiveSession(null)}
                                className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitAll}
                                disabled={submitting}
                                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-teal-900/20 transition-all flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Submit All Reviews'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskVerification;
