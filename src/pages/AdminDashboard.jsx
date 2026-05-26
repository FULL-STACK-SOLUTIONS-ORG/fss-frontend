import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { enquiryAPI, mentorAPI, applicantAPI, moduleAPI, userAPI, feedbackAPI, socialMediaAPI, programModuleAPI, progressAPI, clientAPI, activityAPI } from '../services/api';
import TopicQuizForm from '../components/admin/TopicQuizForm';
import StudentsSocialMedia from '../components/admin/StudentsSocialMedia';
import ProgramManagement from '../components/admin/ProgramManagement';
import TaskVerification from '../components/admin/TaskVerification';
import SortableModuleCard from '../components/admin/SortableModuleCard';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';


const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('forms');
  const [enquiries, setEnquiries] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [enquiryStats, setEnquiryStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    resolved: 0
  });

  const [mentorStats, setMentorStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    inactive: 0
  });

  const [applicantStats, setApplicantStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0
  });

  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0
  });

  const [socialMediaStats, setSocialMediaStats] = useState({
    total: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [userEditForm, setUserEditForm] = useState({ name: '', registrationNumber: '' });

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isMentorViewModalOpen, setIsMentorViewModalOpen] = useState(false);

  const [formsView, setFormsView] = useState('enquiries'); // Unified view: 'enquiries', 'feedbacks', 'mentors', 'applicants'
  const [usersView, setUsersView] = useState('registered'); // Unified view: 'registered', 'social-media'
  const [managementView, setManagementView] = useState('tasks'); // Unified view: 'tasks', 'reviews'

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pendingReviews, setPendingReviews] = useState([]);
  const [scheduledReviews, setScheduledReviews] = useState([]);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');

  const [modules, setModules] = useState([]);
  const [programModules, setProgramModules] = useState([]);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [moduleFormData, setModuleFormData] = useState({ title: '', topics: [] });
  const [topicFormData, setTopicFormData] = useState({
    name: '',
    isPracticalProblem: false,
    problemUrl: '',
    quizzes: []
  });

  const [newTopicName, setNewTopicName] = useState('');
  const [editingTopicIndex, setEditingTopicIndex] = useState(null);
  const [editingTopicName, setEditingTopicName] = useState('');

  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedUserForUnlock, setSelectedUserForUnlock] = useState(null);
  const [unlockTargetModule, setUnlockTargetModule] = useState('');

  // Client State
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    totalReceivables: 0,
    totalCollected: 0,
    totalPendingAmount: 0,
    pendingCount: 0,
    partialCount: 0,
    paidCount: 0
  });
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientDetailTab, setSelectedClientDetailTab] = useState('invoices'); // 'invoices' or 'payments'
  
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  const [clientFormData, setClientFormData] = useState({
    companyName: '',
    email: '',
    status: 'Pending'
  });

  const [invoiceFormData, setInvoiceFormData] = useState({
    clientId: '',
    number: '',
    date: '',
    amount: 0
  });

  const [paymentFormData, setPaymentFormData] = useState({
    clientId: '',
    date: '',
    amount: 0,
    remarks: '',
    allocations: {} // { invoiceId: amount }
  });

  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  const [draggedTopic, setDraggedTopic] = useState(null);
  const [draggedOverTopic, setDraggedOverTopic] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    moduleId: '',
    status: 'excellent',
    feedback: ''
  });

  // Activity Tracking State
  const [activities, setActivities] = useState([]);
  const [activityStats, setActivityStats] = useState({
    total: 0,
    totalDuration: 0,
    totalHours: 0,
    categoryStats: []
  });
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityFormData, setActivityFormData] = useState({
    startTime: '',
    endTime: '',
    duration: '',
    expiryTime: '',
    category: 'To-do',
    remarks: ''
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', color: 'bg-[#9B7D43]/10 text-[#9B7D43] border-[#9B7D43]/30' });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState('all');
  const [statsCategory, setStatsCategory] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLiveDuration = (startTime) => {
    if (!startTime) return '00:00:00';
    const start = new Date(startTime);
    const diff = Math.max(0, currentTime - start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };


  const handleOpenReviewModal = (user) => {
    setSelectedUser(user);
    // Default to the first module if available
    const firstModuleId = modules.length > 0 ? modules[0]._id : '';
    setReviewFormData({
      moduleId: firstModuleId,
      status: 'excellent',
      feedback: ''
    });
    setIsReviewModalOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleModuleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        const newModules = arrayMove(items, oldIndex, newIndex);
        
        // Sync with backend
        const reorderedModules = newModules.map((m, idx) => ({ _id: m._id, order: idx }));
        moduleAPI.reorder(reorderedModules).catch(err => {
            console.error("Failed to save module order", err);
            // Optionally revert state here if critical
        });

        return newModules;
      });
    }
  };


  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchEnquiryStats();
    fetchMentorStats();
    fetchApplicantStats();
    fetchUserStats();
    fetchSocialMediaStats();
    fetchUserStats();
    fetchSocialMediaStats();
    fetchModules();
    fetchProgramModules();
    fetchClientStats();
    fetchActivityStats();
  }, []);


  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        search: searchTerm
      };
      const response = await clientAPI.getAll(params);
      if (response.success) {
        setClients(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError('Failed to fetch clients');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async () => {
    try {
      const response = await clientAPI.getStats();
      if (response.success && response.data) {
        setClientStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching client stats:', err);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await clientAPI.create(clientFormData);
      setClientFormData({ companyName: '', email: '', status: 'Pending' });
      setIsClientModalOpen(false);
      fetchClients();
      fetchClientStats();
    } catch (err) {
      console.error('Error creating client:', err);
      alert('Failed to create client');
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      const updated = await clientAPI.update(selectedClient._id, clientFormData);
      setSelectedClient(updated.data || updated); // specific for invoice/payment tab updates
      setClientFormData({ companyName: '', email: '', status: 'Pending' });
      setIsClientModalOpen(false);
      fetchClients();
      fetchClientStats();
    } catch (err) {
      console.error('Error updating client:', err);
      alert('Failed to update client');
    }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      const targetClientId = selectedClient ? selectedClient._id : invoiceFormData.clientId;
      if (!targetClientId) {
          alert("Please select a client");
          return;
      }
      
      let response;
      if (editingInvoiceId) {
          response = await clientAPI.updateInvoice(targetClientId, editingInvoiceId, invoiceFormData);
      } else {
          response = await clientAPI.addInvoice(targetClientId, invoiceFormData);
      }

      if (response.success) {
         if (selectedClient && selectedClient._id === targetClientId) {
             setSelectedClient(response.data);
         }
         setIsAddInvoiceModalOpen(false);
         setEditingInvoiceId(null);
         setInvoiceFormData({ clientId: '', number: '', date: '', amount: 0 });
         fetchClients();
         fetchClientStats();
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
      alert('Failed to save invoice');
    }
  };

  const handleEditInvoice = (invoice, clientId) => {
      setInvoiceFormData({
          clientId: clientId,
          number: invoice.number,
          date: invoice.date.split('T')[0],
          amount: invoice.amount,
          description: invoice.description || ''
      });
      setEditingInvoiceId(invoice._id);
      setIsAddInvoiceModalOpen(true);
  };

  const handleDeleteInvoice = async (invoiceId, clientId) => {
      if (!window.confirm("Are you sure? This will remove the invoice and any payment allocations linked to it.")) return;
      try {
          const response = await clientAPI.deleteInvoice(clientId, invoiceId);
          if (response.success) {
              if (selectedClient && selectedClient._id === clientId) {
                  setSelectedClient(response.data);
              }
              fetchClients();
              fetchClientStats();
          }
      } catch (err) {
          console.error("Error deleting invoice:", err);
          alert("Failed to delete invoice");
      }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const targetClientId = selectedClient ? selectedClient._id : paymentFormData.clientId;
      if (!targetClientId) {
          alert("Please select a client");
          return;
      }

      // Transform allocations map to array
      const allocationArray = Object.entries(paymentFormData.allocations || {})
        .filter(([_, amount]) => Number(amount) > 0)
        .map(([invoiceId, amount]) => ({ invoiceId, amount: Number(amount) }));

      const payload = {
        date: paymentFormData.date,
        amount: paymentFormData.amount,
        remarks: paymentFormData.remarks,
        allocations: allocationArray
      };

      let response;
      if (editingPaymentId) {
          response = await clientAPI.updatePayment(targetClientId, editingPaymentId, payload);
      } else {
          response = await clientAPI.addPayment(targetClientId, payload);
      }

      if (response.success) {
        if (selectedClient && selectedClient._id === targetClientId) {
            setSelectedClient(response.data);
        }
        setIsAddPaymentModalOpen(false);
        setEditingPaymentId(null);
        setPaymentFormData({ clientId: '', date: '', amount: 0, remarks: '', allocations: {} });
        fetchClients();
        fetchClientStats();
      }
    } catch (err) {
      console.error('Error saving payment:', err);
      alert('Failed to save payment');
    }
  };

  const handleEditPayment = (payment, client) => {
      // Reconstruct allocations map
      const allocMap = {};
      if (payment.allocations) {
          payment.allocations.forEach(a => {
              allocMap[a.invoiceId] = a.amount;
          });
      }

      setPaymentFormData({
          clientId: client._id,
          date: payment.date.split('T')[0],
          amount: payment.amount,
          remarks: payment.remarks || '',
          allocations: allocMap
      });
      setEditingPaymentId(payment._id);
      setIsAddPaymentModalOpen(true);
  };

  const handleDeletePayment = async (paymentId, clientId) => {
      if (!window.confirm("Are you sure? This will remove the payment and revert any invoice allocations.")) return;
       try {
          const response = await clientAPI.deletePayment(clientId, paymentId);
          if (response.success) {
              if (selectedClient && selectedClient._id === clientId) {
                  setSelectedClient(response.data);
              }
              fetchClients();
              fetchClientStats();
          }
      } catch (err) {
          console.error("Error deleting payment:", err);
          alert("Failed to delete payment");
      }
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setClientFormData({
      companyName: client.companyName,
      email: client.email,
      status: client.status
    });
    setSelectedClientDetailTab('invoices');
    setIsClientModalOpen(true);
  };

  const generateStatementPDF = (client) => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFontSize(18);
    doc.text('Statement of Account', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Client: ${client.companyName}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    
    if (client.address) {
        doc.setFontSize(10);
        doc.text(client.address, 14, 42);
    }

    // -- Data Preparation --
    // Combine Invoices and Payments
    const ledger = [];
    
    client.invoices.forEach(inv => {
        ledger.push({
            date: new Date(inv.date),
            type: 'INVOICE',
            ref: inv.number,
            desc: inv.description, // Added description for PDF
            debit: inv.amount,
            credit: 0
        });
    });

    client.payments.forEach(pmt => {
        ledger.push({
            date: new Date(pmt.date),
            type: 'PAYMENT',
            ref: 'Payment', // Fixed Particulars for Payment
            desc: pmt.remarks || '', // Map remarks to description/comments
            debit: 0,
            credit: pmt.amount
        });
    });

    // Sort by Date
    ledger.sort((a, b) => a.date - b.date);

    // Calculate Running Balance
    let balance = 0;
    const tableRows = ledger.map(entry => {
        balance += entry.debit - entry.credit;
        const particular = entry.type === 'INVOICE' ? `Inv #${entry.ref}` : entry.ref;

        return [
            entry.date.toLocaleDateString(),
            particular,
            entry.desc || '', // Show empty string if no comment
            entry.debit > 0 ? entry.debit.toLocaleString() : '',
            entry.credit > 0 ? entry.credit.toLocaleString() : '',
            balance.toLocaleString()
        ];
    });

    // -- Table --
    autoTable(doc, {
        startY: 50,
        head: [['Date', 'Particulars', 'Comments', 'Debit', 'Credit', 'Balance']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: {
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right', fontStyle: 'bold' }
        },
        foot: [[
            'Total', 
            '', 
            '',
            (client.totalAmount || 0).toLocaleString(), 
            (client.receivedAmount || 0).toLocaleString(), 
            (client.totalAmount - client.receivedAmount || 0).toLocaleString()
        ]],
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', halign: 'right' }
    });

    // -- Summary Section --
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Billed: ${(client.totalAmount || 0).toLocaleString()}`, 14, finalY);
    doc.text(`Total Received: ${(client.receivedAmount || 0).toLocaleString()}`, 14, finalY + 6);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Net Pending: ${(client.totalAmount - client.receivedAmount || 0).toLocaleString()}`, 14, finalY + 14);

    // Save
    doc.save(`${client.companyName.replace(/\s+/g, '_')}_Statement.pdf`);
  };

  const fetchProgramModules = async () => {
    try {
      const response = await programModuleAPI.getAll();
      if (response.success) {
        setProgramModules(response.data);
      }
    } catch (err) {
      console.error('Error fetching program modules:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'forms') {
      if (formsView === 'enquiries') fetchEnquiries();
      else if (formsView === 'feedbacks') fetchFeedbacks();
      else if (formsView === 'mentors') fetchMentors();
      else if (formsView === 'applicants') fetchApplicants();
    } else if (activeTab === 'modules') {
      fetchModules();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [statusFilter, currentPage, activeTab, formsView, statsPeriod, statsCategory]);


  const fetchReviews = async () => {
      setLoading(true);
      try {
          const response = await userAPI.getAll({ limit: 1000 }); 
          if (response.success) {
              const users = response.data;
              const pReviews = [];
              const sReviews = [];
              
              users.forEach(user => {
                  user.progress?.moduleReviews?.forEach(review => {
                      const rObj = {
                          _id: review._id || `${user._id}-${review.moduleId}`,
                          user: user,
                          moduleId: review.moduleId,
                          reviewRequestStatus: review.reviewRequestStatus,
                          reviewedAt: review.reviewedAt,
                          meetLink: review.meetLink
                      };
                      
                      if (review.reviewRequestStatus === 'pending') {
                          pReviews.push(rObj);
                      } else if (review.reviewRequestStatus === 'scheduled') {
                          sReviews.push(rObj);
                      }
                  });
              });
              setPendingReviews(pReviews);
              setScheduledReviews(sReviews);
          }
      } catch (error) {
          console.error("Failed to fetch reviews", error);
      } finally {
          setLoading(false);
      }
  };

  const handleSaveReview = async () => {
    if (!selectedUser || !reviewFormData.moduleId) return;

    try {
      await userAPI.addReview(selectedUser._id, {
        moduleId: reviewFormData.moduleId,
        status: reviewFormData.status,
        feedback: typeof reviewFormData.feedback === 'string' ? reviewFormData.feedback.split('\n').filter(p => p.trim()) : reviewFormData.feedback,
        reviewRequestStatus: 'completed',
        recordingLink: reviewFormData.recordingLink
      });
      setIsReviewModalOpen(false);
      setReviewFormData({
        moduleId: '',
        status: 'excellent',
        feedback: '',
        recordingLink: ''
      });
      fetchReviews(); 
      fetchUsers();
    } catch (err) {
      console.error('Error saving review:', err);
      alert('Failed to save review');
    }
  };

  const handleEnterFeedback = (review) => {
      setSelectedUser(review.user);
      setReviewFormData({
          moduleId: review.moduleId, // Will be pre-selected in modal if matches module list
          status: review.status || 'excellent', // Use existing status if any
          feedback: Array.isArray(review.feedback) ? review.feedback.join('\n') : '', // Pre-fill feedback
          recordingLink: review.recordingLink || '' // Pre-fill recording link
      });
      setIsReviewModalOpen(true);
  };

  const handleScheduleReview = async (e) => {
      e.preventDefault();
      if (!selectedReview || !meetLink || !meetDate || !meetTime) return;
      
      try {
          const scheduledDateTime = new Date(`${meetDate}T${meetTime}`);
          
          await userAPI.addReview(selectedReview.user._id, {
              moduleId: selectedReview.moduleId,
              reviewRequestStatus: 'scheduled',
              meetLink: meetLink,
              meetDate: scheduledDateTime
          });
          
          setIsMeetModalOpen(false);
          setMeetLink('');
          setMeetDate('');
          setMeetTime('');
          
          fetchReviews(); // Refresh list
      } catch (error) {
          console.error("Failed to schedule review", error);
          // alert('Failed to schedule review');
      }
      return false; 
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await moduleAPI.getAll();
      if (response.success) {
        setModules(response.data || []);
      } else {
        setError('Failed to fetch modules');
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.message || 'Failed to fetch modules. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    try {
      const moduleData = {
        title: moduleFormData.title,
        topics: moduleFormData.topics.map((topic, index) => ({
          name: topic,
          order: index,
          completed: false
        }))
      };
      await moduleAPI.create(moduleData);
      setModuleFormData({ title: '', topics: [] });
      setIsModuleModalOpen(false);
      fetchModules();
    } catch (err) {
      console.error('Error creating module:', err);
      alert('Failed to create module. Please try again.');
    }
  };

  const handleTopicDragStart = (e, topic, moduleId) => {
    setDraggedTopic({ topic, moduleId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTopicDragOver = (e, topic) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverTopic(topic);
  };

  const handleTopicDrop = async (e, targetTopic, moduleId) => {
    e.preventDefault();
    if (!draggedTopic || draggedTopic.moduleId !== moduleId) return;

    const module = modules.find(m => m._id === moduleId);
    if (!module || !module.topics) return;

    const topics = [...module.topics];
    const draggedIndex = topics.findIndex(t => t._id === draggedTopic.topic._id);
    const targetIndex = topics.findIndex(t => t._id === targetTopic._id);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      setDraggedTopic(null);
      setDraggedOverTopic(null);
      return;
    }

    const [removed] = topics.splice(draggedIndex, 1);
    topics.splice(targetIndex, 0, removed);

    const updatedTopics = topics.map((topic, index) => ({
      ...topic,
      order: index
    }));

    try {
      await Promise.all(
        updatedTopics.map((topic, index) =>
          moduleAPI.updateTopic(moduleId, topic._id, { order: index })
        )
      );
      fetchModules();
    } catch (err) {
      console.error('Error updating topic order:', err);
      alert('Failed to update topic order. Please try again.');
    }
    setDraggedTopic(null);
    setDraggedOverTopic(null);
  };

  const handleTopicDragEnd = () => {
    setDraggedTopic(null);
    setDraggedOverTopic(null);
  };

  const handleUpdateModule = async () => {
    if (!selectedModule) return;
    try {
      await moduleAPI.update(selectedModule._id, {
        title: moduleFormData.title
      });
      setModuleFormData({ title: '', topics: [] });
      setIsEditModuleModalOpen(false);
      setSelectedModule(null);
      fetchModules();
    } catch (err) {
      console.error('Error updating module:', err);
      alert('Failed to update module. Please try again.');
    }
  };

  const handleAddTopic = async () => {
    if (!selectedModule) return;

    // LeetCode Problem Mode
    if (topicFormData.isPracticalProblem) {
      if (!topicFormData.name.trim()) {
        alert('Please enter the Problem Title');
        return;
      }
      if (!topicFormData.problemUrl.trim()) {
        alert('Please enter the Problem URL');
        return;
      }

      try {
        const currentOrder = selectedModule.topics?.length || 0;
        await moduleAPI.addTopic(selectedModule._id, {
          name: topicFormData.name.trim(),
          order: currentOrder,
          isPracticalProblem: true,
          problemUrl: topicFormData.problemUrl.trim(),
          quizzes: topicFormData.quizzes || []
        });

        setTopicFormData({
          name: '',
          isPracticalProblem: false,
          problemUrl: '',
          quizzes: []
        });
        setIsTopicModalOpen(false);
        setSelectedModule(null);
        fetchModules();
      } catch (err) {
        console.error('Error adding LeetCode problem:', err);
        alert('Failed to add LeetCode problem. Please try again.');
      }
      return;
    }

    // Regular Bulk Topics Mode
    if (!newTopicName.trim()) {
      alert('Please enter topic name(s)');
      return;
    }

    const topics = newTopicName
      .split('\n')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);

    if (topics.length === 0) {
      alert('Please enter at least one topic name');
      return;
    }

    try {
      let currentOrder = selectedModule.topics?.length || 0;
      for (const topicName of topics) {
        await moduleAPI.addTopic(selectedModule._id, {
           name: topicName,
           order: currentOrder,
          isPracticalProblem: false,
          quizzes: []
        });
        currentOrder++;
      }
      setNewTopicName('');
      setIsTopicModalOpen(false);
      setSelectedModule(null);
      fetchModules();
    } catch (err) {
      console.error('Error adding topics:', err);
      alert('Failed to add topics. Please try again.');
    }
  };

  const handleUpdateTopic = async () => {
    if (!selectedModule || !selectedTopic) return;
    if (!topicFormData.name.trim()) {
      alert('Please enter a topic name');
      return;
    }

    try {
      await moduleAPI.updateTopic(selectedModule._id, selectedTopic._id, {
         name: topicFormData.name.trim(),
        isPracticalProblem: topicFormData.isPracticalProblem,
        problemUrl: topicFormData.problemUrl,
        quizzes: topicFormData.quizzes
      });
      setTopicFormData({
         name: '',
         isPracticalProblem: false,
         problemUrl: '',
        quizzes: []
      });
      setIsEditTopicModalOpen(false);
      setSelectedModule(null);
      setSelectedTopic(null);
      fetchModules();
    } catch (err) {
      console.error('Error updating topic:', err);
      alert('Failed to update topic. Please try again.');
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module? This will also delete all its topics.')) {
      return;
    }
    try {
      await moduleAPI.delete(id);
      fetchModules();
    } catch (err) {
      console.error('Error deleting module:', err);
      alert('Failed to delete module. Please try again.');
    }
  };

  const handleDeleteTopic = async (moduleId, topicId) => {
    try {
      await moduleAPI.deleteTopic(moduleId, topicId);
      fetchModules();
    } catch (err) {
      console.error('Error deleting topic:', err);
    }
  };



  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await clientAPI.delete(id);
      fetchClients();
      fetchClientStats();
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client');
    }
  };

  const handleEditModule = (module) => {
    setSelectedModule(module);
    setModuleFormData({
      title: module.title,
      topics: []
    });
    setIsEditModuleModalOpen(true);
  };

  const handleEditTopic = async (module, topic) => {
    try {
      setLoading(true);
      const response = await moduleAPI.getTopicQuizzes(module._id, topic._id);
      if (response.success) {
        setSelectedModule(module);
        setSelectedTopic(topic);
        setTopicFormData({
          name: topic.name,
          isPracticalProblem: topic.isPracticalProblem || false,
          problemUrl: topic.problemUrl || '',
          quizzes: response.data || []
        });
        setIsEditTopicModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching topic quizzes:', err);
      alert('Failed to fetch topic details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const addTopicToForm = () => {
    if (newTopicName.trim()) {
      setModuleFormData({
        ...moduleFormData,
        topics: [...moduleFormData.topics, newTopicName.trim()]
      });
      setNewTopicName('');
    }
  };

  const removeTopicFromForm = (index) => {
    setModuleFormData({
      ...moduleFormData,
      topics: moduleFormData.topics.filter((_, i) => i !== index)
    });
  };

  const startEditingTopic = (index, currentName) => {
    setEditingTopicIndex(index);
    setEditingTopicName(currentName);
  };

  const saveEditedTopic = (index) => {
    if (editingTopicName.trim()) {
      const updatedTopics = [...moduleFormData.topics];
      updatedTopics[index] = editingTopicName.trim();
      setModuleFormData({
        ...moduleFormData,
        topics: updatedTopics
      });
      setEditingTopicIndex(null);
      setEditingTopicName('');
    }
  };

  const cancelEditingTopic = () => {
    setEditingTopicIndex(null);
    setEditingTopicName('');
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const response = await enquiryAPI.getAll(params);
      if (response.success) {
        setEnquiries(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError('Failed to fetch enquiries');
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError(err.message || 'Failed to fetch enquiries. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiryStats = async () => {
    try {
      const response = await enquiryAPI.getStats();
      if (response.success && response.data) {
        setEnquiryStats({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          contacted: response.data.contacted || 0,
          resolved: response.data.resolved || 0
        });
      }
    } catch (err) {
      console.error('Error fetching enquiry stats:', err);
    }
  };

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const response = await mentorAPI.getAll(params);
      if (response.success) {
        setMentors(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError('Failed to fetch mentors');
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setError(err.message || 'Failed to fetch mentors. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorStats = async () => {
    try {
      const response = await mentorAPI.getStats();
      if (response.success && response.data) {
        setMentorStats({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          approved: response.data.approved || 0,
          rejected: response.data.rejected || 0,
          active: response.data.active || 0,
          inactive: response.data.inactive || 0
        });
      }
    } catch (err) {
      console.error('Error fetching mentor stats:', err);
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const response = await applicantAPI.getAll(params);
      if (response.success) {
        setApplicants(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError('Failed to fetch applicants');
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError(err.message || 'Failed to fetch applicants. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantStats = async () => {
    try {
      const response = await applicantAPI.getStats();
      if (response.success && response.data) {
        setApplicantStats({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          reviewed: response.data.reviewed || 0,
          accepted: response.data.accepted || 0,
          rejected: response.data.rejected || 0
        });
      }
    } catch (err) {
      console.error('Error fetching applicant stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const response = await userAPI.getAll(params);
      if (response.success) {
        setUsers(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserEditOpen = (user) => {
      setSelectedUserForEdit(user);
      setUserEditForm({
          name: user.name,
          registrationNumber: user.registrationNumber || ''
      });
      setShowUserEditModal(true);
  };

  const handleUserEditSubmit = async () => {
        try {
            const response = await userAPI.updateUserAdmin(selectedUserForEdit._id, userEditForm);
            if (response.success) {
                setUsers(users.map(u => u._id === selectedUserForEdit._id ? { ...u, ...response.data } : u));
                setShowUserEditModal(false);
            }
        } catch (error) {
            console.error('Update failed', error);
            alert('Failed to update user');
        }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userAPI.getStats();
      if (response.success && response.data) {
        setUserStats({
          total: response.data.total || 0,
          verified: response.data.verified || 0,
          unverified: response.data.unverified || 0
        });
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchSocialMediaStats = async () => {
    try {
      const response = await socialMediaAPI.getStats();
      if (response.success && response.data) {
        setSocialMediaStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching social media stats:', err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getAll();
      if (response.success) {
        setFeedbacks(response.data);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Activity Functions
  const getDateRange = (period) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    if (period === 'daily') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      return {};
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const fetchCategories = async () => {
    try {
      const response = await activityAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await activityAPI.createCategory(newCategory);
      setNewCategory({ name: '', color: 'bg-[#9B7D43]/10 text-[#9B7D43] border-[#9B7D43]/30' });
      fetchCategories();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm('Delete this category?')) return;
    try {
      await activityAPI.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const dateParams = getDateRange(statsPeriod);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...dateParams,
        ...(statsCategory !== 'all' && { category: statsCategory })
      };
      const response = await activityAPI.getAll(params);
      if (response.success) {
        setActivities(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError('Failed to fetch activities');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const dateParams = getDateRange(statsPeriod);
      const params = {
        ...dateParams,
        ...(statsCategory !== 'all' && { category: statsCategory })
      };
      const response = await activityAPI.getStats(params);
      if (response.success && response.data) {
        setActivityStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching activity stats:', err);
    }
  };

  const calculateDurationMinutes = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return 0;
    return Math.round((e - s) / 60000); // returns minutes
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...activityFormData,
        startTime: activityFormData.startTime ? new Date(activityFormData.startTime).toISOString() : null,
        endTime: activityFormData.endTime ? new Date(activityFormData.endTime).toISOString() : null,
        expiryTime: activityFormData.expiryTime ? new Date(activityFormData.expiryTime).toISOString() : null,
        duration: calculateDurationMinutes(activityFormData.startTime, activityFormData.endTime)
      };
      if (payload.category === 'To-do') {
        delete payload.startTime;
        delete payload.endTime;
        delete payload.duration;
      } else {
        payload.endTime = payload.endTime || null;
      }
      
      await activityAPI.create(payload);
      
      // If the category is 'To-do', add it to the Todo List (localStorage)
      if (activityFormData.category === 'To-do') {
        const savedTodos = localStorage.getItem('adminTodos');
        const todos = savedTodos ? JSON.parse(savedTodos) : [];
        
        const newTodo = {
          id: Date.now(),
          title: activityFormData.remarks || 'New Activity Task',
          description: payload.expiryTime ? `Task expires on ${new Date(payload.expiryTime).toLocaleString()}` : 'No expiry set',
          category: 'Activity',
          priority: 'Medium',
          dueDate: payload.expiryTime || new Date().toISOString(),
          status: 'Pending', // New Todo should be Pending
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('adminTodos', JSON.stringify([newTodo, ...todos]));
      }

      setActivityFormData({
        startTime: '',
        endTime: '',
        duration: '',
        expiryTime: '',
        category: 'To-do',
        remarks: ''
      });
      setIsActivityModalOpen(false);
      fetchActivities();
      fetchActivityStats();
    } catch (err) {
      console.error('Error creating activity:', err);
      alert('Failed to create activity');
    }
  };

  const handleUpdateActivity = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...activityFormData,
        startTime: activityFormData.startTime ? new Date(activityFormData.startTime).toISOString() : null,
        endTime: activityFormData.endTime ? new Date(activityFormData.endTime).toISOString() : null,
        expiryTime: activityFormData.expiryTime ? new Date(activityFormData.expiryTime).toISOString() : null,
        duration: calculateDurationMinutes(activityFormData.startTime, activityFormData.endTime)
      };
      if (payload.category === 'To-do') {
        delete payload.startTime;
        delete payload.endTime;
        delete payload.duration;
      } else {
        payload.endTime = payload.endTime || null;
      }

      await activityAPI.update(selectedActivity._id, payload);
      setActivityFormData({
        startTime: '',
        endTime: '',
        duration: '',
        expiryTime: '',
        category: 'To-do',
        remarks: ''
      });
      setIsActivityModalOpen(false);
      setSelectedActivity(null);
      fetchActivities();
      fetchActivityStats();
    } catch (err) {
      console.error('Error updating activity:', err);
      alert('Failed to update activity');
    }
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    const toLocalISO = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setActivityFormData({
      startTime: toLocalISO(activity.startTime),
      endTime: toLocalISO(activity.endTime),
      expiryTime: toLocalISO(activity.expiryTime),
      duration: activity.duration || '',
      category: activity.category,
      remarks: activity.remarks || ''
    });
    setIsActivityModalOpen(true);
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    try {
      await activityAPI.delete(id);
      fetchActivities();
      fetchActivityStats();
    } catch (err) {
      console.error('Error deleting activity:', err);
      alert('Failed to delete activity');
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      if (activeTab === 'forms') {
        if (formsView === 'enquiries') {
          await enquiryAPI.updateStatus(id, newStatus);
          fetchEnquiries();
          fetchEnquiryStats();
        } else if (formsView === 'mentors') {
           await mentorAPI.updateStatus(id, newStatus);
           fetchMentors();
           fetchMentorStats();
        } else if (formsView === 'applicants') {
           await applicantAPI.updateStatus(id, newStatus);
           fetchApplicants();
           fetchApplicantStats();
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    const itemType = activeTab === 'forms' 
      ? (formsView === 'enquiries' ? 'enquiry' : formsView === 'feedbacks' ? 'feedback' : formsView === 'mentors' ? 'mentor application' : 'applicant')
      : activeTab === 'users' ? 'user' : 'item';

    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return;
    }
    try {
      if (activeTab === 'forms') {
         if (formsView === 'enquiries') {
            await enquiryAPI.delete(id);
            fetchEnquiries();
            fetchEnquiryStats();
         } else if (formsView === 'feedbacks') {
            await feedbackAPI.delete(id);
            fetchFeedbacks();
         } else if (formsView === 'mentors') {
            await mentorAPI.delete(id);
            fetchMentors();
            fetchMentorStats();
         } else if (formsView === 'applicants') {
            await applicantAPI.delete(id);
            fetchApplicants();
            fetchApplicantStats();
         }
      } else if (activeTab === 'users') {
        await userAPI.delete(id);
        fetchUsers();
        fetchUserStats();
      }
    } catch (err) {
      console.error(`Error deleting ${itemType}:`, err);
      alert(`Failed to delete ${itemType}. Please try again.`);
    }
  };

  const handleUnlockModules = async () => {
    try {
      if (!selectedUserForUnlock || !unlockTargetModule) return;

      const user = selectedUserForUnlock;
      const module = programModules.find(m => m._id === unlockTargetModule);

      if (!module) return;

      await userAPI.updateMaxUnlockedModule(user._id, module.moduleNumber);

      alert(`Modules unlocked up to ${module.title}`);
      setIsUnlockModalOpen(false);
      setSelectedUserForUnlock(null);
      setUnlockTargetModule('');
      fetchUsers();
    } catch (err) {
      console.error('Error unlocking modules:', err);
      alert('Failed to unlock modules');
    }
  };

  const handleDashboardApproval = async (userId, isApproved) => {
    try {
      const response = await userAPI.updateDashboardApproval(userId, isApproved);
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isDashboardApproved: isApproved } : user
        ));
      }
    } catch (err) {
      console.error('Error updating dashboard approval:', err);
      alert('Failed to update dashboard approval. Please try again.');
    }
  };



  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === 'forms') {
          if (formsView === 'enquiries') {
            await Promise.all([fetchEnquiries(), fetchEnquiryStats()]);
          } else if (formsView === 'feedbacks') {
            await fetchFeedbacks();
          } else if (formsView === 'mentors') {
            await Promise.all([fetchMentors(), fetchMentorStats()]);
          } else if (formsView === 'applicants') {
            await Promise.all([fetchApplicants(), fetchApplicantStats()]);
          }
        } else if (activeTab === 'users') {
           if (usersView === 'registered') {
              await Promise.all([fetchUsers(), fetchUserStats()]);
           } else {
              await fetchSocialMediaStats();
           }
        } else if (activeTab === 'modules') {
             // modules fetched
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, [activeTab, formsView, usersView, statusFilter, currentPage, statsPeriod, statsCategory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleViewMentor = (mentor) => {
    setSelectedMentor(mentor);
    setIsMentorViewModalOpen(true);
  };

  const closeMentorViewModal = () => {
    setIsMentorViewModalOpen(false);
    setSelectedMentor(null);
  };

  const getStatusBadge = (status, type = 'enquiry') => {
    const enquiryStatusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      contacted: 'bg-blue-100 text-blue-800 border-blue-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    const mentorStatusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      active: 'bg-blue-100 text-blue-800 border-blue-300',
      inactive: 'bg-[#E8E0D4] text-[#5A5550] border-[#D4C9B8]'
    };
    const applicantStatusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    const statusStyles = type === 'mentor' ? mentorStatusStyles : type === 'applicant' ? applicantStatusStyles : enquiryStatusStyles;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || 'bg-[#E8E0D4] text-[#5A5550] border-[#D4C9B8]'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && (activeTab === 'enquiries' ? enquiries.length === 0 : activeTab === 'mentors' ? mentors.length === 0 : activeTab === 'applicants' ? applicants.length === 0 : users.length === 0)) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9B7D43] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5A5550]">Loading {activeTab}...</p>
        </div>
      </div>
    );
  }

  const currentData = activeTab === 'forms' 
    ? (formsView === 'enquiries' ? enquiries : formsView === 'feedbacks' ? feedbacks : formsView === 'mentors' ? mentors : applicants) 
    : users;


  const menuItems = [
    {
      id: 'forms',
      name: 'Forms & Applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: enquiryStats.total + mentorStats.total + applicantStats.total
    },
    {
      id: 'modules',
      name: 'Modules & Topics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      count: modules.length
    },
    {
      id: 'users',
      name: 'Users & Social Media',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      count: userStats.total
    },
    {
      id: 'dashboard-management',
      name: 'Program Setup',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      id: 'management',
      name: 'Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
  ];


  const handleMenuClick = (menuId) => {
    setActiveTab(menuId);
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      {/* Sidebar for larger screens */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#FAF7F2] border-r border-[#D4C9B8] fixed h-screen transition-all duration-300 z-30 hidden lg:block`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#D4C9B8] flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-[#1C1A17]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Admin Panel
                </h1>
                <p className="text-xs text-[#5A5550] mt-1">Dashboard</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#F5F0E8] transition-colors"
            >
              <svg className="w-5 h-5 text-[#9A8A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#9B7D43] text-white shadow-lg'
                    : 'text-[#5A5550] hover:bg-[#F5F0E8]'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-semibold">{item.name}</span>
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[#D4C9B8]">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-semibold ${
                !sidebarOpen && 'justify-center'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#FAF7F2] border-r border-[#D4C9B8] z-50 transform transition-transform duration-300 lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-[#D4C9B8] flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1C1A17]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Admin Panel
              </h1>
              <p className="text-xs text-[#5A5550] mt-1">Dashboard</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#F5F0E8]"
            >
              <svg className="w-6 h-6 text-[#9A8A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-[#9B7D43] text-white shadow-lg'
                    : 'text-[#5A5550] hover:bg-[#F5F0E8]'
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1 text-left font-semibold">{item.name}</span>
                {item.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-[#F5F0E8] border border-[#D4C9B8] text-[#5A5550]'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-[#D4C9B8]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-[#D4C9B8] sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-[#F5F0E8]"
                >
                  <svg className="w-6 h-6 text-[#9A8A7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-[#1C1A17] capitalize" style={{ fontFamily: 'Playfair Display, serif' }}>{activeTab}</h2>
                  <p className="text-sm text-[#5A5550]">
                    {activeTab === 'enquiries' && 'Manage customer enquiries'}
                    {activeTab === 'mentors' && 'Manage mentor applications'}
                    {activeTab === 'applicants' && 'Manage student applicants'}
                    {activeTab === 'modules' && 'Manage learning modules and topics'}

                    {activeTab === 'users' && 'View all registered users'}

                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2 text-sm text-[#5A5550]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

         {/* Main Content Area */}
        <main className="p-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard-management' && <ProgramManagement />}

          {activeTab === 'tasks' && (
            <TaskVerification />
          )}

          {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl border border-[#D4C9B8] overflow-hidden p-6">
                  <h2 className="text-2xl font-bold text-[#1C1A17] mb-6">Pending Review Requests</h2>
                  {pendingReviews.length === 0 ? (
                      <div className="text-center py-12 text-[#5A5550]">
                          <p>No pending review requests.</p>
                      </div>
                  ) : (
                      <div className="overflow-x-auto">
                          <table className="w-full">
                              <thead className="bg-[#FAF7F2] text-[#5A5550]">
                                  <tr>
                                      <th className="px-6 py-3 text-left">Student</th>
                                      <th className="px-6 py-3 text-left">Module</th>
                                      <th className="px-6 py-3 text-left">Status</th>
                                      <th className="px-6 py-3 text-left">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E8E0D4]">
                                  {pendingReviews.map((review, idx) => (
                                      <tr key={idx} className="hover:bg-[#FAF7F2]">
                                          <td className="px-6 py-4 text-[#1C1A17] font-medium">{review.user.name}</td>
                                          <td className="px-6 py-4 text-[#5A5550]">
                                            {(() => {
                                              const module = programModules.find(m => m._id === review.moduleId);
                                              return module ? `Module ${module.moduleNumber}: ${module.title}` : 'Unknown Module';
                                            })()}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs border border-yellow-200">
                                                  {review.reviewRequestStatus}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReview(review);
                                                        setIsMeetModalOpen(true);
                                                    }}
                                                    className="bg-[#9B7D43] hover:bg-[#7A6235] text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                                                >
                                                    Schedule Review
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        if (window.confirm(`Are you sure you want to delete the review request for ${review.user.name}?`)) {
                                                            try {
                                                                await progressAPI.deleteReviewRequest(review.user._id, review.moduleId);
                                                                alert('Review request deleted successfully');
                                                                if (typeof fetchPendingReviews === 'function') {
                                                                    fetchPendingReviews();
                                                                } else {
                                                                    fetchReviews();
                                                                }
                                                            } catch (err) {
                                                                console.error('Failed to delete review:', err);
                                                                const debugInfo = err.data?.debug ? `\nDebug: ${JSON.stringify(err.data.debug)}` : '';
                                                                alert(`Failed to delete review request: ${err.message}${debugInfo}`);
                                                            }
                                                        }
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}

                  {/* Schedule Modal */}
                  {isMeetModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                      <div className="bg-white rounded-xl p-6 w-full max-w-md border border-[#D4C9B8] shadow-2xl">
                        <h3 className="text-xl font-bold text-[#1C1A17] mb-4">Schedule Review for {selectedReview?.user.name}</h3>
                        <form onSubmit={handleScheduleReview} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[#5A5550] mb-1">Google Meet Link</label>
                            <input
                              type="url"
                              required
                              value={meetLink}
                              onChange={(e) => setMeetLink(e.target.value)}
                              className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                              placeholder="https://meet.google.com/..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#5A5550] mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={meetDate}
                                    onChange={(e) => setMeetDate(e.target.value)}
                                    className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#5A5550] mb-1">Time</label>
                                <input
                                    type="time"
                                    required
                                    value={meetTime}
                                    onChange={(e) => setMeetTime(e.target.value)}
                                    className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                                />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 mt-6">
                            <button
                              type="button"
                              onClick={() => {
                                  setIsMeetModalOpen(false);
                                  setMeetLink('');
                              }}
                              className="px-4 py-2 text-[#5A5550] hover:text-[#1C1A17] rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg"
                            >
                              Send Link
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
              </div>
          )}

          {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl border border-[#D4C9B8] overflow-hidden p-6 mt-8">
                  <h2 className="text-2xl font-bold text-[#1C1A17] mb-6 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#9B7D43]"></span>
                      Scheduled Reviews
                  </h2>
                  {scheduledReviews.length === 0 ? (
                      <div className="text-center py-12 text-[#5A5550]">
                          <p>No scheduled reviews.</p>
                      </div>
                  ) : (
                      <div className="overflow-x-auto">
                          <table className="w-full">
                              <thead className="bg-[#FAF7F2] text-[#5A5550]">
                                  <tr>
                                      <th className="px-6 py-3 text-left">Student</th>
                                      <th className="px-6 py-3 text-left">Module</th>
                                      <th className="px-6 py-3 text-left">Meet Link</th>
                                      <th className="px-6 py-3 text-left">Actions</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E8E0D4]">
                                  {scheduledReviews.map((review, idx) => (
                                      <tr key={idx} className="hover:bg-[#FAF7F2]">
                                          <td className="px-6 py-4 text-[#1C1A17] font-medium">{review.user.name}</td>
                                          <td className="px-6 py-4 text-[#5A5550]">
                                            {(() => {
                                              const module = programModules.find(m => m._id === review.moduleId);
                                              return module ? `Module ${module.moduleNumber}: ${module.title}` : 'Unknown Module';
                                            })()}
                                          </td>
                                          <td className="px-6 py-4 text-[#5A5550] max-w-xs truncate">
                                              <a href={review.meetLink?.match(/^https?:\/\//i) ? review.meetLink : `https://${review.meetLink}`} target="_blank" rel="noopener noreferrer" className="text-[#9B7D43] hover:text-[#7A6235] flex items-center gap-1">
                                                  Link <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                              </a>
                                          </td>
                                           <td className="px-6 py-4">
                                               <div className="flex gap-2">
                                                <button 
                                                    onClick={() => {
                                                         setSelectedUser(review.user);
                                                         setReviewFormData({
                                                             moduleId: review.moduleId,
                                                             status: review.status || 'excellent',
                                                             feedback: Array.isArray(review.feedback) ? review.feedback.join('\n') : '',
                                                             recordingLink: review.recordingLink || '' 
                                                         });
                                                         setIsReviewModalOpen(true);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Complete Review
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        if (window.confirm(`Are you sure you want to delete the review for ${review.user.name}?`)) {
                                                            try {
                                                                await progressAPI.deleteReviewRequest(review.user._id, review.moduleId);
                                                                fetchScheduledReviews();
                                                            } catch (err) {
                                                                console.error('Failed to delete review:', err);
                                                                alert('Failed to delete review');
                                                            }
                                                        }
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
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
          )}

          {activeTab === 'users' && usersView === 'social-media' && <StudentsSocialMedia />}

          {!['dashboard-management', 'management'].includes(activeTab) && (
        <div className="bg-white rounded-xl border border-[#D4C9B8] p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">

            {activeTab === 'forms' && (
              <div className="flex bg-[#F5F0E8] border border-[#D4C9B8] rounded-xl p-1 w-fit flex-wrap gap-1">
                <button
                  onClick={() => { setFormsView('enquiries'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    formsView === 'enquiries'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Enquiries
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    formsView === 'enquiries'
                      ? 'bg-[#7A6235] text-white'
                      : 'bg-white border border-[#D4C9B8] text-[#5A5550]'
                  }`}>
                    {enquiryStats.total}
                  </span>
                </button>
                <button
                  onClick={() => { setFormsView('feedbacks'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    formsView === 'feedbacks'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Feedbacks
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    formsView === 'feedbacks'
                      ? 'bg-[#7A6235] text-white'
                      : 'bg-white border border-[#D4C9B8] text-[#5A5550]'
                  }`}>
                    {feedbacks.length}
                  </span>
                </button>
                <button
                  onClick={() => { setFormsView('mentors'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    formsView === 'mentors'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Mentors
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    formsView === 'mentors'
                      ? 'bg-[#7A6235] text-white'
                      : 'bg-white border border-[#D4C9B8] text-[#5A5550]'
                  }`}>
                    {mentorStats.total}
                  </span>
                </button>
                <button
                  onClick={() => { setFormsView('applicants'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    formsView === 'applicants'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Applicants
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    formsView === 'applicants'
                      ? 'bg-[#7A6235] text-white'
                      : 'bg-white border border-[#D4C9B8] text-[#5A5550]'
                  }`}>
                    {applicantStats.total}
                  </span>
                </button>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="flex bg-[#F5F0E8] border border-[#D4C9B8] rounded-xl p-1 w-fit flex-wrap gap-1">
                <button
                  onClick={() => { setUsersView('registered'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    usersView === 'registered'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Registered Users
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    usersView === 'registered'
                      ? 'bg-[#7A6235] text-white'
                      : 'bg-white border border-[#D4C9B8] text-[#5A5550]'
                  }`}>
                    {userStats.total}
                  </span>
                </button>
                <button
                  onClick={() => { setUsersView('social-media'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    usersView === 'social-media'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Students Social Media
                </button>
              </div>
            )}

            {activeTab === 'management' && (
              <div className="flex bg-[#F5F0E8] border border-[#D4C9B8] rounded-xl p-1 w-fit flex-wrap gap-1">
                <button
                  onClick={() => { setManagementView('tasks'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    managementView === 'tasks'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Task Management
                </button>
                <button
                  onClick={() => { setManagementView('reviews'); setCurrentPage(1); }}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    managementView === 'reviews'
                      ? 'bg-[#9B7D43] text-white shadow-sm'
                      : 'text-[#5A5550] hover:text-[#1C1A17]'
                  }`}
                >
                  Review Management
                </button>
              </div>
            )}
          </div>
        </div>
        )}
        
        {activeTab === 'modules' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Modules & Topics Management</h2>
              <button
                onClick={() => setIsModuleModalOpen(true)}
                className="px-4 py-2 bg-[#9B7D43] text-white rounded-lg hover:bg-[#7A6235] transition-colors font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Module
              </button>
            </div>
            {loading && modules.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#D4C9B8] p-12 text-center">
                <div className="w-16 h-16 border-4 border-[#9B7D43] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#5A5550]">Loading modules...</p>
              </div>
            ) : modules.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#D4C9B8] p-12 text-center">
                <svg className="w-16 h-16 text-[#9A8A7A] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-[#5A5550] text-lg font-semibold">No modules found</p>
                <p className="text-[#5A5550] text-sm mt-2">Click "Add Module" to create your first module</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleModuleDragEnd}
              >
                <SortableContext
                  items={modules.map(m => m._id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module) => (
                      <SortableModuleCard
                        key={module._id}
                        module={module}
                        onEdit={handleEditModule}
                        onDelete={handleDeleteModule}
                        onAddTopic={() => {
                           setSelectedModule(module);
                           setNewTopicName('');
                           setIsTopicModalOpen(true);
                        }}
                        onEditTopic={handleEditTopic}
                        onDeleteTopic={handleDeleteTopic}
                        currentTopicDragHandlers={{
                          onDragStart: handleTopicDragStart,
                          onDragOver: handleTopicDragOver,
                          onDrop: handleTopicDrop,
                          onDragEnd: handleTopicDragEnd,
                          draggedTopic,
                          draggedOverTopic
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        ) : ['dashboard-management', 'my-social-media', 'students-social-media', 'reviews', 'tasks', 'clients', 'activities'].includes(activeTab) ? null : error ? (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={() => {
                if (activeTab === 'forms') {
                  if (formsView === 'enquiries') fetchEnquiries();
                  else if (formsView === 'feedbacks') fetchFeedbacks();
                  else if (formsView === 'mentors') fetchMentors();
                  else if (formsView === 'applicants') fetchApplicants();
                }
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : currentData.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D4C9B8] p-12 text-center">
            <svg className="w-16 h-16 text-[#9A8A7A] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeTab === 'forms' ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" : "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"} />
            </svg>
            <p className="text-[#5A5550] text-lg font-semibold">
              No {activeTab === 'forms' ? formsView : activeTab} found
            </p>
            <p className="text-[#5A5550] text-sm mt-2">
              {statusFilter !== 'all' ? 'Try adjusting your filters' : `No ${activeTab === 'forms' ? formsView : activeTab} have been submitted yet`}
            </p>
          </div>
        ) : (
             <div className="bg-white rounded-xl border border-[#D4C9B8] overflow-hidden">

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FAF7F2]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#5A5550] uppercase tracking-wider">
                          {(activeTab === 'forms' && formsView === 'feedbacks') ? 'User' : 'Name'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#5A5550] uppercase tracking-wider">
                           {(activeTab === 'users') ? 'Total Points' : (activeTab === 'forms' && formsView === 'feedbacks') ? 'Email' : 'Contact'}
                        </th>
                        {(activeTab === 'forms' && (formsView === 'mentors' || formsView === 'applicants')) && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#5A5550] uppercase tracking-wider">
                             Applied Date
                          </th>
                        )}
                        {(activeTab === 'forms' && (formsView === 'enquiries' || formsView === 'feedbacks')) && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#5A5550] uppercase tracking-wider">Message</th>
                        )}
                        {activeTab === 'users' ? (
                          <>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#5A5550] uppercase tracking-wider">Ranking</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#5A5550] uppercase tracking-wider">Topics</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#5A5550] uppercase tracking-wider">Streak</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-[#5A5550] uppercase tracking-wider">Dashboard Access</th>
                          </>
                        ) : null}
                        {activeTab !== 'users' && !(activeTab === 'forms' && (formsView === 'mentors' || formsView === 'applicants')) && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#5A5550] uppercase tracking-wider">Date</th>
                        )}
                        <th className="px-6 py-4 text-center text-xs font-semibold text-[#5A5550] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E0D4]">
                      {activeTab === 'forms' && formsView === 'enquiries' ? (
                        enquiries.map((enquiry) => (
                          <tr key={enquiry._id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-[#1C1A17]">{enquiry.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#1C1A17]">{enquiry.email}</div>
                              <div className="text-sm text-[#5A5550]">{enquiry.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#5A5550] max-w-xs truncate" title={enquiry.message}>
                                {enquiry.message || 'No message'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5A5550]">
                              {formatDate(enquiry.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <select
                                  value={enquiry.status}
                                  onChange={(e) => handleStatusUpdate(enquiry._id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-[#D4C9B8] rounded-lg focus:outline-none focus:border-[#9B7D43] text-[#1C1A17] bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="contacted">Contacted</option>
                                </select>
                                <button
                                  onClick={() => handleDelete(enquiry._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : activeTab === 'forms' && formsView === 'feedbacks' ? (
                        feedbacks.map((feedback) => (
                          <tr key={feedback._id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#9B7D43]/10 border border-[#D4C9B8] flex items-center justify-center text-xs font-bold text-[#9B7D43]">
                                  {feedback.user?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div className="font-semibold text-[#1C1A17]">{feedback.user?.name || 'Unknown User'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#5A5550]">{feedback.user?.email || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#5A5550] max-w-xs truncate" title={feedback.message}>
                                {feedback.message}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5A5550]">
                               {formatDate(feedback.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleDelete(feedback._id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : activeTab === 'forms' && formsView === 'mentors' ? (
                        mentors.map((mentor) => (
                          <tr key={mentor._id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-[#1C1A17]">{mentor.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#1C1A17]">{mentor.email}</div>
                              <div className="text-sm text-[#5A5550]">{mentor.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5A5550]">
                              {formatDate(mentor.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewMentor(mentor)}
                                  className="text-[#9B7D43] hover:text-[#7A6235] p-1.5 border border-[#D4C9B8] rounded-lg hover:bg-[#FAF7F2] transition-colors"
                                  title="View Details"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <select
                                  value={mentor.status}
                                  onChange={(e) => handleStatusUpdate(mentor._id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-[#D4C9B8] rounded-lg focus:outline-none focus:border-[#9B7D43] text-[#1C1A17] bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                                <button
                                  onClick={() => handleDelete(mentor._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : activeTab === 'forms' && formsView === 'applicants' ? (
                         applicants.map((applicant) => (
                          <tr key={applicant._id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-[#1C1A17]">{applicant.fullName}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#1C1A17]">{applicant.email}</div>
                              <div className="text-sm text-[#5A5550]">{applicant.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5A5550]">
                              {formatDate(applicant.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewApplicant(applicant)}
                                  className="text-[#9B7D43] hover:text-[#7A6235] p-1.5 border border-[#D4C9B8] rounded-lg hover:bg-[#FAF7F2] transition-colors"
                                  title="View Details"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <select
                                  value={applicant.status}
                                  onChange={(e) => handleStatusUpdate(applicant._id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-[#D4C9B8] rounded-lg focus:outline-none focus:border-[#9B7D43] text-[#1C1A17] bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="accepted">Accepted</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                                <button
                                  onClick={() => handleDelete(applicant._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : activeTab === 'users' ? (
                        users.map((user) => (
                          <tr key={user._id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-[#1C1A17]">{user.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-[#9B7D43]">{user.points || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <span className="px-3 py-1 rounded-lg text-sm font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  #{user.ranking || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <span className="px-3 py-1 rounded-lg text-sm font-bold bg-[#9B7D43]/10 text-[#9B7D43] border border-[#9B7D43]/30">
                                  {user.completedTopicsCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                {user.activityStreak > 0 ? (
                                  <>
                                    <span className="text-lg">🔥</span>
                                    <span className="px-3 py-1 rounded-lg text-sm font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                      {user.activityStreak} {user.activityStreak === 1 ? 'day' : 'days'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs text-[#9A8A7A]">No streak</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleDashboardApproval(user._id, !user.isDashboardApproved)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                  user.isDashboardApproved
                                    ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                                }`}
                              >
                                {user.isDashboardApproved ? 'Approved' : 'Not Approved'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenReviewModal(user)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Add Review"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                      setSelectedUserForUnlock(user);
                                      setIsUnlockModalOpen(true);
                                  }}
                                  className="text-yellow-600 hover:text-yellow-800 p-1"
                                  title="Unlock Modules"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleUserEditOpen(user)}
                                  className="text-[#9B7D43] hover:text-[#7A6235] p-1"
                                  title="Edit Profile"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : null}
                    </tbody>
                  </table>
                </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 mb-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white text-[#1C1A17] rounded-lg hover:bg-[#FAF7F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#D4C9B8]"
                >
                  Previous
                </button>
                <div className="text-[#5A5550] font-medium">
                  Page <span className="text-[#1C1A17]">{currentPage}</span> of <span className="text-[#1C1A17]">{totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white text-[#1C1A17] rounded-lg hover:bg-[#FAF7F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#D4C9B8]"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        )}


      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-[#D4C9B8] shadow-2xl">
            <h3 className="text-xl font-bold text-[#1C1A17] mb-4">
              {selectedActivity ? 'Edit Activity' : 'Add New Activity'}
            </h3>
            <form onSubmit={selectedActivity ? handleUpdateActivity : handleCreateActivity} className="space-y-4">
              {activityFormData.category === 'To-do' ? (
                <div>
                  <label className="block text-sm font-medium text-[#5A5550] mb-1">Expiry Date and Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={activityFormData.expiryTime}
                    onChange={(e) => setActivityFormData({ ...activityFormData, expiryTime: e.target.value })}
                    className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5550] mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={activityFormData.startTime}
                      onChange={(e) => setActivityFormData({ ...activityFormData, startTime: e.target.value })}
                      className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5A5550] mb-1">End Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={activityFormData.endTime}
                      onChange={(e) => setActivityFormData({ ...activityFormData, endTime: e.target.value })}
                      className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                    />
                  </div>

                  {activityFormData.startTime && activityFormData.endTime && (
                    <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#D4C9B8]">
                      <p className="text-xs text-[#5A5550] uppercase tracking-wider font-bold mb-1">Calculated Duration</p>
                      <p className="text-lg font-bold text-[#9B7D43]">
                        {(calculateDurationMinutes(activityFormData.startTime, activityFormData.endTime) / 60).toFixed(2)} hrs
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-1">Category</label>
                <select
                  required
                  value={activityFormData.category}
                  onChange={(e) => setActivityFormData({ ...activityFormData, category: e.target.value })}
                  className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                >
                  <option value="" disabled>Select a category</option>
                  {!categories.find(c => c.name === 'To-do') && (
                    <option value="To-do">To-do</option>
                  )}
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-1">Remarks (Optional)</label>
                <textarea
                  rows="3"
                  value={activityFormData.remarks}
                  onChange={(e) => setActivityFormData({ ...activityFormData, remarks: e.target.value })}
                  className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-4 py-2 focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                  placeholder="Add any notes about this activity..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsActivityModalOpen(false);
                    setSelectedActivity(null);
                  }}
                  className="px-4 py-2 text-[#5A5550] hover:text-[#1C1A17] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-all font-medium"
                >
                  {selectedActivity ? 'Update Activity' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-[#D4C9B8] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1C1A17]">Add & Manage Categories</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-[#9A8A7A] hover:text-[#1C1A17]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {categories.length === 0 ? (
                  <p className="text-[#9A8A7A] text-center py-4">No categories created yet.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat._id} className="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-lg border border-[#D4C9B8]">
                      <span className={`px-2 py-1 rounded text-xs ${cat.color || 'bg-[#9B7D43]/10 text-[#9B7D43]'}`}>{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New */}
              <div className="border-t border-[#D4C9B8] pt-4">
                <h4 className="text-sm font-semibold text-[#5A5550] mb-3">Add New Category</h4>
                <form onSubmit={handleCreateCategory} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Category Name"
                      required
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="w-full bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-3 py-2 text-sm focus:ring-[#9B7D43] focus:border-[#9B7D43] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                     <select
                       value={newCategory.color}
                       onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                       className="flex-1 bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] px-3 py-2 text-sm focus:outline-none"
                     >
                       <option value="bg-[#9B7D43]/10 text-[#9B7D43] border-[#9B7D43]/30">Default (Gold)</option>
                       <option value="bg-blue-50 text-blue-700 border-blue-200">Blue</option>
                       <option value="bg-purple-50 text-purple-700 border-purple-200">Purple</option>
                       <option value="bg-green-50 text-green-700 border-green-200">Green</option>
                       <option value="bg-yellow-50 text-yellow-700 border-yellow-200">Yellow</option>
                       <option value="bg-orange-50 text-orange-700 border-orange-200">Orange</option>
                       <option value="bg-teal-50 text-teal-700 border-teal-200">Teal</option>
                       <option value="bg-red-50 text-red-700 border-red-200">Red</option>
                     </select>
                     <button
                       type="submit"
                       className="px-4 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg text-sm font-medium transition-colors"
                     >
                       Add
                     </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentor View Modal */}
      {isMentorViewModalOpen && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Mentor Details</h2>
              <button
                onClick={closeMentorViewModal}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Full Name</label>
                  <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedMentor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Email</label>
                  <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedMentor.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Phone</label>
                  <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedMentor.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Status</label>
                  <div className="bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">
                    {getStatusBadge(selectedMentor.status, 'mentor')}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Expertise</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedMentor.skills || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Experience</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedMentor.experience || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Previous Experience</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg whitespace-pre-wrap">{selectedMentor.previousMentoring || 'No previous experience provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">LinkedIn Profile</label>
                <a
                  href={selectedMentor.linkedin?.match(/^https?:\/\//i) ? selectedMentor.linkedin : `https://${selectedMentor.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9B7D43] hover:text-[#7A6235] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg block underline"
                >
                  {selectedMentor.linkedin}
                </a>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Submitted Date</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{formatDate(selectedMentor.createdAt)}</p>
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
              <button
                onClick={closeMentorViewModal}
                className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicant View Modal */}
      {isViewModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Applicant Details</h2>
              <button
                onClick={closeViewModal}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Full Name</label>
                  <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedApplicant.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Email</label>
                  <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedApplicant.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Phone</label>
                  <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedApplicant.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Place</label>
                  <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedApplicant.place}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">Status</label>
                  <div className="bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">
                    {getStatusBadge(selectedApplicant.status, 'applicant')}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Education</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedApplicant.educationalQualifications || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Skills</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{selectedApplicant.programmingLanguages || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Difficulties Faced</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg whitespace-pre-wrap">{selectedApplicant.difficulties || 'None mentioned'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Feedback</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg whitespace-pre-wrap">{selectedApplicant.feedback || 'No feedback provided'}</p>
              </div>
              {selectedApplicant.githubLink && (
                <div>
                  <label className="block text-sm font-semibold text-[#5A5550] mb-1">GitHub Profile</label>
                  <a
                     href={selectedApplicant.githubLink?.match(/^https?:\/\//i) ? selectedApplicant.githubLink : `https://${selectedApplicant.githubLink}`}
                     target="_blank"
                     rel="noopener noreferrer"
                    className="text-[#9B7D43] hover:text-[#7A6235] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg block underline"
                  >
                    {selectedApplicant.githubLink}
                  </a>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#5A5550] mb-1">Applied Date</label>
                <p className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-4 py-2 rounded-lg">{formatDate(selectedApplicant.createdAt)}</p>
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
              <button
                onClick={closeViewModal}
                className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Add Topics</h2>
              <button
                onClick={() => {
                  setIsTopicModalOpen(false);
                  setSelectedModule(null);
                  setNewTopicName('');
                }}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-lg border border-[#D4C9B8]">
                  <input
                    type="checkbox"
                    id="isPracticalProblem"
                    checked={topicFormData.isPracticalProblem}
                    onChange={(e) => setTopicFormData({ ...topicFormData, isPracticalProblem: e.target.checked })}
                    className="w-5 h-5 rounded border-[#D4C9B8] text-[#9B7D43] focus:ring-[#9B7D43]"
                  />
                  <label htmlFor="isPracticalProblem" className="text-sm font-medium text-[#5A5550] cursor-pointer select-none">
                    Topic is a LeetCode problem
                  </label>
                </div>

                {!topicFormData.isPracticalProblem ? (
                  <div>
                    <label className="block text-sm font-medium text-[#5A5550] mb-2">
                      Task Descriptions *
                      <span className="text-xs text-[#9A8A7A] ml-2">(one per line for multiple tasks)</span>
                    </label>
                    <textarea
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17] min-h-[120px] resize-y"
                      placeholder="HTML Basic Tags & Structure&#10;HTML Semantic Tags&#10;HTML Forms&#10;..."
                      autoFocus
                    />
                    <p className="text-xs text-[#9A8A7A] mt-2">
                      Enter one topic per line to add multiple topics at once
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-[#5A5550] mb-2">Problem Title *</label>
                      <input
                        type="text"
                        value={topicFormData.name}
                        onChange={(e) => setTopicFormData({ ...topicFormData, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                        placeholder="e.g., Two Sum"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A5550] mb-2">LeetCode Problem URL *</label>
                      <input
                        type="url"
                        value={topicFormData.problemUrl}
                        onChange={(e) => setTopicFormData({ ...topicFormData, problemUrl: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                        placeholder="https://leetcode.com/problems/..."
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-[#D4C9B8] pt-4 mt-2">
                <TopicQuizForm
                   quizzes={topicFormData.quizzes || []}
                   onChange={(newQuizzes) => setTopicFormData({ ...topicFormData, quizzes: newQuizzes })}
                 />
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsTopicModalOpen(false);
                  setSelectedModule(null);
                  setNewTopicName('');
                }}
                className="px-6 py-2 border border-[#D4C9B8] rounded-lg text-[#5A5550] hover:bg-[#F5F0E8] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTopic}
                disabled={topicFormData.isPracticalProblem ? (!topicFormData.name.trim() || !topicFormData.problemUrl.trim()) : !newTopicName.trim()}
                className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {topicFormData.isPracticalProblem ? 'Add Problem' : 'Add Topics'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Add New Module</h2>
              <button
                onClick={() => {
                  setIsModuleModalOpen(false);
                  setModuleFormData({ title: '', topics: [] });
                }}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">Module Title *</label>
                <input
                  type="text"
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                  placeholder="e.g., Module 1: HTML & CSS Fundamentals"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">Topics</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTopicToForm();
                      }
                    }}
                    className="flex-1 px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                    placeholder="Enter task description"
                  />
                  <button
                    onClick={addTopicToForm}
                    disabled={!newTopicName.trim()}
                    className="px-4 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {moduleFormData.topics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-lg border border-[#D4C9B8]">
                      <span className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-xs text-[#5A5550] border border-[#D4C9B8]">
                        {index + 1}
                      </span>
                      {editingTopicIndex === index ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingTopicName}
                            onChange={(e) => setEditingTopicName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm bg-white border border-[#D4C9B8] rounded focus:outline-none focus:border-[#9B7D43] text-[#1C1A17]"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditedTopic(index)}
                            className="text-green-500 hover:text-green-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelEditingTopic}
                            className="text-red-500 hover:text-red-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-[#1C1A17]">{topic}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingTopic(index, topic)}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeTopicFromForm(index)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {moduleFormData.topics.length === 0 && (
                    <div className="text-center py-4 text-[#9A8A7A] text-sm italic">
                      No topics added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModuleModalOpen(false);
                  setModuleFormData({ title: '', topics: [] });
                }}
                className="px-6 py-2 border border-[#D4C9B8] rounded-lg text-[#5A5550] hover:bg-[#F5F0E8] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateModule}
                disabled={!moduleFormData.title.trim() || moduleFormData.topics.length === 0}
                className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {isEditModuleModalOpen && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Edit Module</h2>
              <button
                onClick={() => {
                  setIsEditModuleModalOpen(false);
                  setSelectedModule(null);
                  setModuleFormData({ title: '', topics: [] });
                }}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">Module Title *</label>
                <input
                  type="text"
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                  placeholder="e.g., Module 1: HTML & CSS Fundamentals"
                  autoFocus
                />
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModuleModalOpen(false);
                  setSelectedModule(null);
                  setModuleFormData({ title: '', topics: [] });
                }}
                className="px-6 py-2 border border-[#D4C9B8] rounded-lg text-[#5A5550] hover:bg-[#F5F0E8] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateModule}
                disabled={!moduleFormData.title.trim()}
                className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {isEditTopicModalOpen && selectedModule && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Edit Topic</h2>
              <button
                onClick={() => {
                  setIsEditTopicModalOpen(false);
                  setSelectedModule(null);
                  setSelectedTopic(null);
                  setTopicFormData({ name: '', isPracticalProblem: false, quizzes: [] });
                }}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">Task Description *</label>
                <input
                  type="text"
                  value={topicFormData.name}
                  onChange={(e) => setTopicFormData({ ...topicFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                  placeholder="e.g., Learn basic HTML tags and document structure"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isEditPracticalProblem"
                    checked={topicFormData.isPracticalProblem}
                    onChange={(e) => setTopicFormData({ ...topicFormData, isPracticalProblem: e.target.checked })}
                    className="w-5 h-5 rounded border-[#D4C9B8] text-[#9B7D43] focus:ring-[#9B7D43]"
                  />
                  <label htmlFor="isEditPracticalProblem" className="text-sm font-medium text-[#5A5550] cursor-pointer">
                    Topic is a LeetCode problem
                  </label>
                </div>
                {topicFormData.isPracticalProblem && (
                  <div>
                    <label className="block text-sm font-medium text-[#5A5550] mb-2">LeetCode Problem URL</label>
                    <input
                      type="url"
                      value={topicFormData.problemUrl}
                      onChange={(e) => setTopicFormData({ ...topicFormData, problemUrl: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                      placeholder="https://leetcode.com/problems/..."
                    />
                  </div>
                )}
              </div>
              <div className="border-t border-[#D4C9B8] pt-4 mt-2">
                <TopicQuizForm
                   quizzes={topicFormData.quizzes || []}
                   onChange={(newQuizzes) => setTopicFormData({ ...topicFormData, quizzes: newQuizzes })}
                 />
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditTopicModalOpen(false);
                  setSelectedModule(null);
                  setSelectedTopic(null);
                  setTopicFormData({ name: '', isPracticalProblem: false, quizzes: [] });
                }}
                className="px-6 py-2 border border-[#D4C9B8] rounded-lg text-[#5A5550] hover:bg-[#F5F0E8] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTopic}
                disabled={!topicFormData.name.trim()}
                className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Topic
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Review Modal */}
      {isReviewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1C1A17]">Add Review for {selectedUser.name}</h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">


              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">Status *</label>
                <select
                  value={reviewFormData.status}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                >
                  <option value="excellent">Excellent Performance (Green)</option>
                  <option value="good">Good Progress (Blue)</option>
                  <option value="needs_improvement">Needs Attention (Yellow)</option>
                  <option value="critical">Critical Feedback (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">Recording Link</label>
                <input
                  type="url"
                  value={reviewFormData.recordingLink || ''}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, recordingLink: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">
                  Feedback Points *
                  <span className="text-xs text-[#9A8A7A] ml-2">(One point per line)</span>
                </label>
                <textarea
                  value={reviewFormData.feedback}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, feedback: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-[#9B7D43] bg-white text-[#1C1A17] min-h-[120px] resize-y"
                  placeholder="Consistently high quality code&#10;Tasks completed on time"
                />
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-2 border border-[#D4C9B8] rounded-lg text-[#5A5550] hover:bg-[#F5F0E8] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors font-semibold"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Unlock Modules Modal */}
      {isUnlockModalOpen && selectedUserForUnlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1C1A17]">Unlock Modules for {selectedUserForUnlock.name}</h2>
               <button
                 onClick={() => setIsUnlockModalOpen(false)}
                 className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#5A5550] text-sm">
                Select the module up to which you want to unlock for this user.
              </p>
              <div>
                <label className="block text-sm font-medium text-[#5A5550] mb-2">Unlock Up To Module</label>
                <select
                  value={unlockTargetModule}
                  onChange={(e) => setUnlockTargetModule(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#D4C9B8] rounded-lg focus:ring-0 focus:outline-none focus:border-yellow-500 bg-white text-[#1C1A17]"
                >
                  <option value="">Select a module...</option>
                   {programModules.map((module) => (
                    <option key={module._id} value={module._id}>
                      {module.moduleNumber}. {module.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-[#FAF7F2] px-6 py-4 border-t border-[#D4C9B8] flex justify-end gap-3">
               <button
                onClick={() => setIsUnlockModalOpen(false)}
                className="px-6 py-2 border border-[#D4C9B8] rounded-lg text-[#5A5550] hover:bg-[#F5F0E8] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlockModules}
                 disabled={!unlockTargetModule}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* Client Management Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col ${selectedClient ? 'max-w-4xl' : 'max-w-lg'}`}>
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#D4C9B8] flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-[#1C1A17]">
                {selectedClient ? `Manage Client: ${clientFormData.companyName}` : 'Add New Client'}
              </h2>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="text-[#9A8A7A] hover:text-[#1C1A17] transition-colors"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 bg-white">
             {selectedClient && (
                <div className="px-6 pt-4 border-b border-[#D4C9B8] flex gap-4 bg-white sticky top-0 z-10">
                    <button
                        onClick={() => setSelectedClientDetailTab('invoices')}
                        className={`pb-2 text-sm font-medium transition-colors border-b-2 ${selectedClientDetailTab === 'invoices' ? 'border-[#9B7D43] text-[#9B7D43]' : 'border-transparent text-[#5A5550] hover:text-[#1C1A17]'}`}
                    >
                        Invoices
                    </button>
                    <button
                        onClick={() => setSelectedClientDetailTab('payments')}
                         className={`pb-2 text-sm font-medium transition-colors border-b-2 ${selectedClientDetailTab === 'payments' ? 'border-[#9B7D43] text-[#9B7D43]' : 'border-transparent text-[#5A5550] hover:text-[#1C1A17]'}`}
                    >
                        Payments
                    </button>
                    <button
                        onClick={() => setSelectedClientDetailTab('profile')}
                        className={`pb-2 text-sm font-medium transition-colors border-b-2 ${selectedClientDetailTab === 'profile' ? 'border-[#9B7D43] text-[#9B7D43]' : 'border-transparent text-[#5A5550] hover:text-[#1C1A17]'}`}
                    >
                        Edit Profile
                    </button>
                </div>
             )}

             <div className="p-6">
                {(!selectedClient || selectedClientDetailTab === 'profile') && (
                    <form onSubmit={selectedClient ? handleUpdateClient : handleCreateClient} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={clientFormData.companyName}
                          onChange={(e) => setClientFormData({ ...clientFormData, companyName: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] focus:outline-none focus:ring-2 focus:ring-[#9B7D43]"
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={clientFormData.email}
                          onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] focus:outline-none focus:ring-2 focus:ring-[#9B7D43]"
                          placeholder="client@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Project Status</label>
                        <select
                          value={clientFormData.status}
                          onChange={(e) => setClientFormData({ ...clientFormData, status: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-[#D4C9B8] rounded-lg text-[#1C1A17] focus:outline-none focus:ring-2 focus:ring-[#9B7D43]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsClientModalOpen(false)}
                          className="px-4 py-2 text-[#5A5550] hover:text-[#1C1A17] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-all font-medium"
                        >
                          {selectedClient ? 'Update Profile' : 'Create Client'}
                        </button>
                      </div>
                    </form>
                )}

                {selectedClient && selectedClientDetailTab === 'invoices' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-[#1C1A17]">Project Invoices</h3>
                            <button
                                onClick={() => setIsAddInvoiceModalOpen(true)}
                                className="px-3 py-1.5 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg text-sm font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                Add Invoice
                            </button>
                        </div>
                         {(selectedClient.invoices || []).length === 0 ? (
                            <div className="text-center py-8 text-[#9A8A7A] border-2 border-dashed border-[#D4C9B8] rounded-lg">
                                No invoices found. Add an invoice to track receivables.
                            </div>
                         ) : (
                             <div className="overflow-x-auto rounded-lg border border-[#D4C9B8]">
                                 <table className="w-full text-left">
                                     <thead className="text-xs text-[#5A5550] uppercase bg-[#FAF7F2]">
                                         <tr>
                                             <th className="px-4 py-3 font-medium">Number</th>
                                             <th className="px-4 py-3 font-medium">Date</th>
                                             <th className="px-4 py-3 font-medium">Description</th>
                                             <th className="px-4 py-3 font-medium">Amount</th>
                                             <th className="px-4 py-3 font-medium">Paid</th>
                                             <th className="px-4 py-3 font-medium">Status</th>
                                             <th className="px-4 py-3 font-medium text-right">Actions</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-[#E8E0D4]">
                                         {selectedClient.invoices.map((inv, idx) => (
                                             <tr key={idx} className="hover:bg-[#FAF7F2]">
                                                 <td className="px-4 py-3 text-[#1C1A17] font-medium">{inv.number}</td>
                                                 <td className="px-4 py-3 text-[#5A5550] text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                                                 <td className="px-4 py-3 font-medium text-[#1C1A17]">₹{inv.amount.toLocaleString()}</td>
                                                 <td className="px-4 py-3 text-green-700">₹{inv.paidAmount?.toLocaleString() || 0}</td>
                                                 <td className="px-4 py-3">
                                                     <span className={`text-xs px-2 py-0.5 rounded border ${
                                                         inv.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                                         inv.status === 'Partial' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                         'bg-red-50 text-red-700 border-red-200'
                                                     }`}>
                                                         {inv.status}
                                                     </span>
                                                 </td>
                                                 <td className="px-4 py-3 text-right">
                                                     <div className="flex justify-end gap-2">
                                                         <button
                                                             onClick={() => handleEditInvoice(inv, selectedClient._id)}
                                                             className="p-1 text-blue-600 hover:text-blue-800 transition-colors" title="Edit"
                                                         >
                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                                         </button>
                                                         <button
                                                             onClick={() => handleDeleteInvoice(inv._id, selectedClient._id)}
                                                             className="p-1 text-red-500 hover:text-red-700 transition-colors" title="Delete"
                                                         >
                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                         </button>
                                                     </div>
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         )}
                         <div className="mt-4 pt-4 border-t border-[#D4C9B8] flex justify-end gap-4 text-sm">
                             <div className="text-[#5A5550]">Total Billed: <span className="text-[#1C1A17] font-medium">₹{(selectedClient.totalAmount || 0).toLocaleString()}</span></div>
                             <div className="text-[#5A5550]">Pending: <span className="text-orange-600 font-medium">₹{(selectedClient.totalAmount - selectedClient.receivedAmount || 0).toLocaleString()}</span></div>
                         </div>
                    </div>
                )}

                {selectedClient && selectedClientDetailTab === 'payments' && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-[#1C1A17]">Payments Received</h3>
                            <button
                                onClick={() => setIsAddPaymentModalOpen(true)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                Record Payment
                            </button>
                        </div>
                         {(selectedClient.payments || []).length === 0 ? (
                            <div className="text-center py-8 text-[#9A8A7A] border-2 border-dashed border-[#D4C9B8] rounded-lg">
                                No payments recorded yet.
                            </div>
                         ) : (
                             <div className="space-y-3">
                                 {selectedClient.payments.map((pmt, idx) => (
                                     <div key={idx} className="bg-[#FAF7F2] p-4 rounded-lg border border-[#D4C9B8] hover:border-[#9B7D43]/30 transition-colors">
                                         <div className="flex justify-between items-start mb-2">
                                             <div className="flex flex-col">
                                                 <span className="text-green-700 font-bold text-lg">₹{pmt.amount.toLocaleString()}</span>
                                                 <span className="text-[#5A5550] text-sm">{new Date(pmt.date).toLocaleDateString()}</span>
                                             </div>
                                             <div className="flex items-start gap-4">
                                                 {pmt.remarks && <span className="text-[#9A8A7A] text-sm italic mt-1">{pmt.remarks}</span>}
                                                 <div className="flex gap-1">
                                                     <button 
                                                         onClick={() => handleEditPayment(pmt, selectedClient)}
                                                         className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                                         title="Edit Payment"
                                                     >
                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                                     </button>
                                                     <button 
                                                         onClick={() => handleDeletePayment(pmt._id, selectedClient._id)}
                                                         className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                         title="Delete Payment"
                                                     >
                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                     </button>
                                                 </div>
                                             </div>
                                         </div>
                                         {pmt.allocations && pmt.allocations.length > 0 && (
                                            <div className="mt-2 text-xs bg-white p-2 rounded border border-[#D4C9B8]">
                                                <span className="text-[#5A5550] block mb-1">Allocated against:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {pmt.allocations.map((alloc, aidx) => {
                                                        const inv = selectedClient.invoices.find(i => i._id === alloc.invoiceId);
                                                        return (
                                                            <span key={aidx} className="text-[#1C1A17] bg-[#FAF7F2] border border-[#D4C9B8] px-1.5 py-0.5 rounded">
                                                                {inv ? `#${inv.number}` : 'Unknown Invoice'} (₹{alloc.amount.toLocaleString()})
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                         )}
                                     </div>
                                 ))}
                             </div>
                         )}
                         <div className="mt-4 pt-4 border-t border-[#D4C9B8] flex justify-end text-sm">
                             <div className="text-[#5A5550]">Total Collected: <span className="text-green-700 font-medium">₹{(selectedClient.receivedAmount || 0).toLocaleString()}</span></div>
                         </div>
                    </div>
                )}
             </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {isAddInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-[#D4C9B8]">
                <div className="p-4 border-b border-[#D4C9B8] bg-[#FAF7F2]"><h3 className="text-lg font-bold text-[#1C1A17]">{editingInvoiceId ? 'Edit Invoice' : 'Add Invoice'}</h3></div>
                <form onSubmit={handleAddInvoice} className="p-4 space-y-4">
                    {!selectedClient && (
                        <div>
                            <label className="block text-sm font-medium text-[#5A5550] mb-1">Select Client</label>
                            <select
                                required
                                disabled={Boolean(editingInvoiceId)}
                                value={invoiceFormData.clientId}
                                onChange={e => setInvoiceFormData({...invoiceFormData, clientId: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] disabled:opacity-50 focus:outline-none focus:border-[#9B7D43]"
                            >
                                <option value="">Select a client...</option>
                                {clients.map(c => (
                                    <option key={c._id} value={c._id}>{c.companyName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Invoice Number</label>
                        <input type="text" required value={invoiceFormData.number} onChange={e => setInvoiceFormData({...invoiceFormData, number: e.target.value})} className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]" placeholder="INV-001" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Date</label>
                        <input type="date" required value={invoiceFormData.date} onChange={e => setInvoiceFormData({...invoiceFormData, date: e.target.value})} className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Amount (₹)</label>
                        <input type="number" min="0" required value={invoiceFormData.amount} onChange={e => setInvoiceFormData({...invoiceFormData, amount: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Description / Comment</label>
                        <textarea
                            value={invoiceFormData.description || ''}
                            onChange={e => setInvoiceFormData({...invoiceFormData, description: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] resize-y min-h-[60px] focus:outline-none focus:border-[#9B7D43]"
                            placeholder="Optional details..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => {
                            setIsAddInvoiceModalOpen(false);
                            setEditingInvoiceId(null);
                        }} className="px-3 py-1.5 text-[#5A5550] hover:text-[#1C1A17]">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded">{editingInvoiceId ? 'Update Invoice' : 'Add Invoice'}</button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {isAddPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#D4C9B8] max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-[#D4C9B8] bg-[#FAF7F2]"><h3 className="text-lg font-bold text-[#1C1A17]">{editingPaymentId ? 'Edit Payment' : 'Record Payment'}</h3></div>
                <form onSubmit={handleAddPayment} className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {!selectedClient && (
                         <div>
                            <label className="block text-sm font-medium text-[#5A5550] mb-1">Select Client</label>
                            <select
                                required
                                disabled={Boolean(editingPaymentId)}
                                value={paymentFormData.clientId}
                                onChange={e => setPaymentFormData({...paymentFormData, clientId: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] disabled:opacity-50 focus:outline-none focus:border-[#9B7D43]"
                            >
                                <option value="">Select a client...</option>
                                {clients.map(c => (
                                    <option key={c._id} value={c._id}>{c.companyName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Payment Date</label>
                        <input type="date" required value={paymentFormData.date} onChange={e => setPaymentFormData({...paymentFormData, date: e.target.value})} className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Total Amount Received (₹)</label>
                        <input type="number" min="0" required value={paymentFormData.amount} onChange={e => setPaymentFormData({...paymentFormData, amount: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Remarks</label>
                        <input type="text" value={paymentFormData.remarks} onChange={e => setPaymentFormData({...paymentFormData, remarks: e.target.value})} className="w-full px-3 py-2 bg-white border border-[#D4C9B8] rounded text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]" placeholder="e.g. UPI, Bank Transfer" />
                    </div>

                    <div className="border-t border-[#D4C9B8] pt-4 mt-2">
                        <label className="block text-sm font-medium text-[#5A5550] mb-2">Allocate to Pending Invoices:</label>
                        {(() => {
                           // Logic to find target client for invoices
                           const targetClient = selectedClient || clients.find(c => c._id === paymentFormData.clientId);
                           if (targetClient && targetClient.invoices && targetClient.invoices.filter(i => i.status !== 'Paid').length > 0) {
                              return (
                                <div className="space-y-2">
                                    {targetClient.invoices.filter(i => i.status !== 'Paid' || (editingPaymentId && paymentFormData.allocations[i._id])).map(inv => {
                                         // For existing allocations in edit mode, add the allocated amount back to the "Due" amount for visualization
                                         const currentAllocation = paymentFormData.allocations[inv._id] || 0;
                                         // If we are editing, the "paidAmount" on inv includes the OLD allocation. We should visually revert that logic to show true "due" if we remove this payment.
                                         // But simplification: Just show Due based on current state (inv.amount - inv.paidAmount). 
                                         // Ideally: Due = inv.amount - (inv.paidAmount - old_allocation_from_this_payment)
                                         // But getting old allocation here is hard without complex lookup.
                                         // Let's settle for simple Due display.
                                         return (
                                        <div key={inv._id} className="flex gap-2 items-center text-sm bg-[#FAF7F2] p-2 rounded border border-[#D4C9B8]">
                                            <div className="flex-1">
                                                <div className="text-[#1C1A17] font-medium">{inv.number}</div>
                                                <div className="text-xs text-[#5A5550]">Due: ₹{(inv.amount - (inv.paidAmount || 0)).toLocaleString()}</div>
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={inv.amount - (inv.paidAmount || 0) + (editingPaymentId ? Number(paymentFormData.allocations[inv._id] || 0) : 0)}
                                                    placeholder="Amount"
                                                    value={paymentFormData.allocations[inv._id] || ''}
                                                    onChange={e => setPaymentFormData({
                                                        ...paymentFormData,
                                                        allocations: {
                                                            ...paymentFormData.allocations,
                                                            [inv._id]: e.target.value
                                                        }
                                                    })}
                                                    className="w-full px-2 py-1 bg-white border border-[#D4C9B8] rounded text-right text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]"
                                                />
                                            </div>
                                        </div>
                                    )})}
                                </div>
                              );
                           } else {
                               return <p className="text-xs text-[#9A8A7A] italic">No pending invoices found for selected client.</p>;
                           }
                        })()}

                        <div className="mt-2 text-right text-xs text-[#5A5550]">
                             Unallocated: <span className={
                                 (paymentFormData.amount - Object.values(paymentFormData.allocations).reduce((a, b) => a + Number(b), 0)) < 0 ? 'text-red-600' : 'text-[#1C1A17]'
                             }>
                                 ₹{(paymentFormData.amount - Object.values(paymentFormData.allocations).reduce((a, b) => a + Number(b), 0)).toLocaleString()}
                             </span>
                        </div>
                    </div>

                </form>
                <div className="p-4 border-t border-[#D4C9B8] flex justify-end gap-2 bg-[#FAF7F2]">
                    <button type="button" onClick={() => {
                        setIsAddPaymentModalOpen(false);
                        setEditingPaymentId(null);
                    }} className="px-3 py-1.5 text-[#5A5550] hover:text-[#1C1A17]">Cancel</button>
                    <button type="button" onClick={handleAddPayment} className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700">{editingPaymentId ? 'Update Payment' : 'Save Payment'}</button>
                </div>
             </div>
        </div>
      )}


      {/* Edit User Modal (Admin) */}
      {showUserEditModal && selectedUserForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[#D4C9B8]">
                <h3 className="text-xl font-bold text-[#1C1A17] mb-4">Edit User Profile</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-[#D4C9B8] rounded-lg p-2 text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]"
                            value={userEditForm.name}
                            onChange={(e) => setUserEditForm({...userEditForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#5A5550] mb-1">Registration Number</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-[#D4C9B8] rounded-lg p-2 text-[#1C1A17] focus:outline-none focus:border-[#9B7D43]"
                            value={userEditForm.registrationNumber}
                            onChange={(e) => setUserEditForm({...userEditForm, registrationNumber: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setShowUserEditModal(false)}
                        className="px-4 py-2 text-[#5A5550] hover:text-[#1C1A17]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUserEditSubmit}
                        className="px-4 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
