import React, { useState, useEffect } from 'react';
import { 
  Plus, Undo2, BookOpen, Clock, CheckCircle2, ChevronRight, DollarSign, User, 
  HelpCircle, Trash2, Search, Filter, ShieldCheck, Mail, Phone, Calendar, Sparkles, AlertCircle, LogOut,
  Edit, Edit2, Settings, X, Key, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './components/Logo';
import { BookProject, ProspectStatus, FeedbackStatus, ProposalStatus, ContractStatus, TaskStatus, ProductionChapterStatus, ISBNStatus, CoverStatus, DummyBookStatus, TrophyStatus } from './types';
import { INITIAL_PROJECTS, PHASE_NAMES, PHASE_COLORS } from './initialData';
import PhaseStepper from './components/PhaseStepper';
import PhaseDetailForm from './components/PhaseDetailForm';

// Firebase Integrations
import { 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType, 
  loginWithUsername, 
  registerNewUserByAdmin 
} from './firebase';
import firebaseConfig from '../firebase-applet-config.json';

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  if (dateStr.toLowerCase().includes('no ')) return dateStr;
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefinedValues);
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanUndefinedValues(obj[key]);
        }
      }
    }
    return cleaned;
  }
  return obj;
}

export default function App() {
  const isSandbox = false;
  const [authNotAllowedError, setAuthNotAllowedError] = useState<boolean>(false);
  const [firestoreOffline, setFirestoreOffline] = useState<boolean>(false);

  const [projects, setProjects] = useState<BookProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [viewingPhaseIndex, setViewingPhaseIndex] = useState<number>(0);

  // Authentication & session state tracker
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Username custom login states
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Admin User Registry states
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newRegUsername, setNewRegUsername] = useState<string>('');
  const [newRegPassword, setNewRegPassword] = useState<string>('');
  const [newRegDisplayName, setNewRegDisplayName] = useState<string>('');
  const [newRegRole, setNewRegRole] = useState<string>('user');
  const [regStatus, setRegStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Admin selected tab inside the console
  const [adminTab, setAdminTab] = useState<'users' | 'projects'>('users');

  // Member editing state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserDisplayName, setEditUserDisplayName] = useState<string>('');
  const [editUserPassword, setEditUserPassword] = useState<string>('');
  const [editUserRole, setEditUserRole] = useState<string>('user');
  const [editUserPhotoURL, setEditUserPhotoURL] = useState<string>('');

  // Book project editing state
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [editProjectName, setEditProjectName] = useState<string>('');
  const [editProjectClientName, setEditProjectClientName] = useState<string>('');
  const [editProjectClientEmail, setEditProjectClientEmail] = useState<string>('');
  const [editProjectClientPhone, setEditProjectClientPhone] = useState<string>('');
  const [editProjectPhaseIndex, setEditProjectPhaseIndex] = useState<number>(0);

  // User Dropdown and Profile Modal settings
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [newProfileDisplayName, setNewProfileDisplayName] = useState<string>('');
  const [newProfilePassword, setNewProfilePassword] = useState<string>('');
  const [newProfilePhotoURL, setNewProfilePhotoURL] = useState<string>('');

  // Custom confirmation modal target
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'user' | 'project';
    id: string;
    displayName: string;
  } | null>(null);

  // Quick search and filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');

  // New Project Form Overlay States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newProjectGenre, setNewProjectGenre] = useState('Historical Fiction');

  // Handle switching in/out of sandbox (No-op in production database mode)
  const toggleSandboxMode = (enable: boolean) => {
    // No-op
  };

  // 1. Restore persisted profile session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('ReneTuros_ActiveUserSession');
    if (savedSession) {
      try {
        const prof = JSON.parse(savedSession);
        setUserProfile(prof);
        setUser({ uid: prof.uid, email: `${prof.username}@editorial.local`, displayName: prof.displayName } as any);
      } catch (e) {
        console.error("Error reading saved user session:", e);
      }
    }
    setAuthLoading(false);
  }, []);

  // 2. Align live Firestore snapshot monitors with the custom logged-in profile
  useEffect(() => {
    if (!userProfile) {
      setProjects([]);
      setUsersList([]);
      setSelectedProjectId('');
      return;
    }

    let unsubProjects: (() => void) | null = null;
    let unsubProfile: (() => void) | null = null;
    let unsubUsersList: (() => void) | null = null;

    // 1. Sync live active profile changes directly from Firestore
    const profileRef = doc(db, 'users', userProfile.username);
    unsubProfile = onSnapshot(profileRef, (profileSnap) => {
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        setUserProfile(profileData);
        setUser({ uid: profileData.uid, email: `${profileData.username}@editorial.local`, displayName: profileData.displayName } as any);
        localStorage.setItem('ReneTuros_ActiveUserSession', JSON.stringify(profileData));
      }
    }, (err) => {
      console.warn("Could not load user profile from Firestore, checking offline flag:", err);
      setFirestoreOffline(true);
    });

    // 2. Admin retrieves other colleagues
    if (userProfile.role === 'admin') {
      const usersRef = collection(db, 'users');
      unsubUsersList = onSnapshot(usersRef, (usersSnap) => {
        const list: any[] = [];
        usersSnap.forEach((d) => {
          list.push(d.data());
        });
        list.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        setUsersList(list);
        localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(list));
      }, (err) => {
        console.warn("Could not load teammate directory list from Firestore:", err);
        const savedUsers = localStorage.getItem('ReneTuros_LocalUsers');
        if (savedUsers) {
          try {
            setUsersList(JSON.parse(savedUsers));
          } catch (e) {
            console.error(e);
          }
        }
      });
    }

    // 3. Sync live project records across all teammates
    const q = query(
      collection(db, 'projects')
    );

    unsubProjects = onSnapshot(q, async (snapshot) => {
      const loaded: BookProject[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as BookProject);
      });

      loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      if (loaded.length === 0 && snapshot.metadata.fromCache === false) {
        await seedInitialProjects(userProfile.uid);
      } else {
        setProjects(loaded);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(loaded));
        setSelectedProjectId((prev) => {
          if (prev && loaded.some(p => p.id === prev)) return prev;
          return loaded.length > 0 ? loaded[0].id : '';
        });
      }
    }, (err) => {
      console.warn("Could not load project tracks from Firestore, setting offline flag:", err);
      setFirestoreOffline(true);
      
      const savedProjects = localStorage.getItem('ReneTuros_Offline_Projects');
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          setProjects(parsed);
          setSelectedProjectId((prev) => {
            if (prev && parsed.some((p: any) => p.id === prev)) return prev;
            return parsed.length > 0 ? parsed[0].id : '';
          });
        } catch (e) {
          console.error("Error reading offline projects:", e);
        }
      } else {
        const defaultProj = INITIAL_PROJECTS.map(p => ({
          ...p,
          id: `proj-${p.id.split('-')[1]}-offline`,
          ownerId: userProfile?.uid || 'usr_offline'
        }));
        setProjects(defaultProj);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(defaultProj));
        setSelectedProjectId(defaultProj.length > 0 ? defaultProj[0].id : '');
      }
    });

    return () => {
      if (unsubProfile) unsubProfile();
      if (unsubUsersList) unsubUsersList();
      if (unsubProjects) unsubProjects();
    };
  }, [userProfile?.uid]);

  // Sync profile details to profile settings modal fields
  useEffect(() => {
    if (userProfile) {
      setNewProfileDisplayName(userProfile.displayName || '');
      setNewProfilePhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  // Hydrate empty profile with beautiful demo project records
  const seedInitialProjects = async (uid: string) => {
    if (isSandbox) {
      const defaultProj = INITIAL_PROJECTS.map(p => ({
        ...p,
        id: `proj-${p.id.split('-')[1]}-sbox`,
        ownerId: uid
      }));
      setProjects(defaultProj);
      localStorage.setItem('ReneTuros_Sandbox_Projects', JSON.stringify(defaultProj));
      return;
    }
    try {
      for (const p of INITIAL_PROJECTS) {
        const customId = `proj-${p.id.split('-')[1]}-${uid.substring(0, 4)}`;
        const seededProject: BookProject = {
          ...p,
          id: customId,
          ownerId: uid
        };
        await setDoc(doc(db, 'projects', customId), seededProject);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'projects/seed');
    }
  };

  // Sign in using custom username-password mapping with direct Firestore database
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Please provide both username and password.");
      return;
    }
    setIsSigningIn(true);
    setLoginError('');
    setAuthNotAllowedError(false);

    try {
      const activeProf = await loginWithUsername(loginUsername, loginPassword);
      // Save active session locally for offline survival/reload persistence
      localStorage.setItem('ReneTuros_ActiveUserSession', JSON.stringify(activeProf));
      setUserProfile(activeProf);
      setUser({
        uid: activeProf.uid,
        email: `${activeProf.username}@editorial.local`,
        displayName: activeProf.displayName
      } as any);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err: any) {
      console.error("Login verification error:", err);
      setLoginError(err.message || "An error occurred during authentication.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Admin registers another user directly in Firestore
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus(null);
    if (!newRegUsername.trim() || !newRegPassword.trim() || !newRegDisplayName.trim()) {
      setRegStatus({ type: 'error', message: 'All registration parameters are required.' });
      return;
    }
    if (newRegPassword.trim().length < 6) {
      setRegStatus({ type: 'error', message: 'Password must be at least 6 characters total.' });
      return;
    }

    try {
      await registerNewUserByAdmin(
        newRegUsername.toLowerCase().trim(),
        newRegPassword.trim(),
        newRegDisplayName.trim(),
        newRegRole
      );
      setRegStatus({ type: 'success', message: `Registered colleague "${newRegUsername}" inside Firestore directory successfully!` });
      // Reset registration values
      setNewRegUsername('');
      setNewRegPassword('');
      setNewRegDisplayName('');
      setNewRegRole('user');
    } catch (err: any) {
      console.error("Error creating user profile in Firestore:", err);
      setRegStatus({ type: 'error', message: err.message || 'Error occurred registering that colleague.' });
    }
  };

  // Admin updates another teammate's profile
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setRegStatus(null);

    const targetUsername = editingUser.username;
    if (!editUserDisplayName.trim()) {
      setRegStatus({ type: 'error', message: 'Display Name is required.' });
      return;
    }
    if (editUserPassword.trim() && editUserPassword.trim().length < 6) {
      setRegStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      const userDocRef = doc(db, 'users', targetUsername);
      const updatedData: any = {
        displayName: editUserDisplayName.trim(),
        role: editUserRole,
      };
      if (editUserPassword.trim()) {
        updatedData.password = editUserPassword.trim();
      }
      if (editUserPhotoURL !== undefined) {
        updatedData.photoURL = editUserPhotoURL;
      }

      await setDoc(userDocRef, updatedData, { merge: true });

      setRegStatus({ type: 'success', message: `Teammate colleague "${targetUsername}" profile was updated successfully!` });
      
      // Update local storage
      const savedUsers = localStorage.getItem('ReneTuros_LocalUsers');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        const updated = parsed.map((u: any) => u.username === targetUsername ? { ...u, ...updatedData } : u);
        localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(updated));
      }

      // If updating oneself
      if (userProfile && userProfile.username === targetUsername) {
        const nextProfile = { ...userProfile, ...updatedData };
        setUserProfile(nextProfile);
        localStorage.setItem('ReneTuros_ActiveUserSession', JSON.stringify(nextProfile));
      }

      setEditingUser(null);
      setEditUserDisplayName('');
      setEditUserPassword('');
      setEditUserRole('user');
      setEditUserPhotoURL('');
    } catch (err: any) {
      console.error("Error updating user profile:", err);
      setRegStatus({ type: 'error', message: err.message || 'Error occurred updating colleague profile.' });
    }
  };

  // Admin deletes a teammate's profile
  const handleDeleteUser = (targetUsername: string) => {
    if (userProfile && userProfile.username === targetUsername) {
      alert("You cannot delete your own active administrator account!");
      return;
    }
    setDeleteTarget({
      type: 'user',
      id: targetUsername,
      displayName: targetUsername,
    });
  };

  const executeDeleteUser = async (targetUsername: string) => {
    setRegStatus(null);
    try {
      const userDocRef = doc(db, 'users', targetUsername);
      await deleteDoc(userDocRef);

      setRegStatus({ type: 'success', message: `Colleague "${targetUsername}" has been removed from system registry.` });

      // Update local storage
      const savedUsers = localStorage.getItem('ReneTuros_LocalUsers');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        const filtered = parsed.filter((u: any) => u.username !== targetUsername);
        localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(filtered));
      }
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setRegStatus({ type: 'error', message: err.message || 'Error occurred deleting colleague.' });
    } finally {
      setDeleteTarget(null);
    }
  };

  // User profile editor handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      const userDocRef = doc(db, 'users', userProfile.username);
      const updatedData: any = {
        displayName: newProfileDisplayName.trim() || userProfile.displayName,
      };
      if (newProfilePassword.trim()) {
        if (newProfilePassword.trim().length < 6) {
          alert("Password must be at least 6 characters.");
          return;
        }
        updatedData.password = newProfilePassword.trim();
      }
      if (newProfilePhotoURL !== undefined) {
        updatedData.photoURL = newProfilePhotoURL;
      }

      await setDoc(userDocRef, updatedData, { merge: true });

      const updatedProfile = { ...userProfile, ...updatedData };
      setUserProfile(updatedProfile);
      localStorage.setItem('ReneTuros_ActiveUserSession', JSON.stringify(updatedProfile));

      // Also sync userList back
      setUsersList(prev => prev.map(u => u.username === userProfile.username ? { ...u, ...updatedData } : u));

      setNewProfilePassword('');
      setShowProfileModal(false);
      alert("Your corporate profile status has been updated successfully!");
    } catch (err: any) {
      console.error("Error updating personal profile:", err);
      alert("Failed to update profile: " + err.message);
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB Limit
      alert("Profile image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewProfilePhotoURL(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAdminProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB Limit
      alert("Profile image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditUserPhotoURL(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Admin updates a Book Project
  const handleUpdateProjectAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setRegStatus(null);

    if (!editProjectName.trim() || !editProjectClientName.trim()) {
      setRegStatus({ type: 'error', message: 'Project Name and Client Name are required.' });
      return;
    }

    try {
      const projRef = doc(db, 'projects', editingProject.id);
      const updatedData = {
        projectName: editProjectName.trim(),
        currentPhaseIndex: editProjectPhaseIndex,
        clientContact: {
          name: editProjectClientName.trim(),
          email: editProjectClientEmail.trim() || 'info@client.com',
          phone: editProjectClientPhone.trim() || '+62 811-1111-2222',
        }
      };

      await setDoc(projRef, updatedData, { merge: true });

      // Update local state list
      const nextProjects = projects.map(p => p.id === editingProject.id ? {
        ...p,
        ...updatedData
      } : p);
      setProjects(nextProjects);
      localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(nextProjects));

      setRegStatus({ type: 'success', message: `Updated book project "${editProjectName}" successfully in Firestore.` });
      setEditingProject(null);
      setEditProjectName('');
      setEditProjectClientName('');
      setEditProjectClientEmail('');
      setEditProjectClientPhone('');
      setEditProjectPhaseIndex(0);
    } catch (err: any) {
      console.error("Error updating project in admin panel:", err);
      setRegStatus({ type: 'error', message: err.message || 'Error occurred updating book project.' });
    }
  };

  // Sign out from corporate sessions
  const handleLogout = async () => {
    localStorage.removeItem('ReneTuros_ActiveUserSession');
    setUser(null);
    setUserProfile(null);
  };

  // Reset current items and re-hydrate with default templates
  const handleResetData = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to reset all records back to René Turos presets? All existing project records will be replaced.")) {
      if (isSandbox || firestoreOffline) {
        const defaultProj = INITIAL_PROJECTS.map(p => ({
          ...p,
          id: `proj-${p.id.split('-')[1]}-offline`,
          ownerId: user.uid
        }));
        setProjects(defaultProj);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(defaultProj));
        setSelectedProjectId(defaultProj.length > 0 ? defaultProj[0].id : '');
        setViewingPhaseIndex(0);
        return;
      }
      try {
        // Clear active projects first
        for (const p of projects) {
          await deleteDoc(doc(db, 'projects', p.id));
        }
        await seedInitialProjects(user.uid);
      } catch (err) {
        console.warn("Could not reset online data, falling back to local reset:", err);
        setFirestoreOffline(true);
        const defaultProj = INITIAL_PROJECTS.map(p => ({
          ...p,
          id: `proj-${p.id.split('-')[1]}-offline`,
          ownerId: user.uid
        }));
        setProjects(defaultProj);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(defaultProj));
        setSelectedProjectId(defaultProj.length > 0 ? defaultProj[0].id : '');
        setViewingPhaseIndex(0);
      }
    }
  };

  // Get active selected project
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Adjust viewing phase when selected project changes
  useEffect(() => {
    if (activeProject) {
      setViewingPhaseIndex(activeProject.currentPhaseIndex);
    }
  }, [selectedProjectId]);

  // Save changes back of the single active document straight to Firestore
  const handleUpdateActiveProject = async (updated: BookProject) => {
    if (firestoreOffline) {
      setProjects(prev => {
        const next = prev.map(p => p.id === updated.id ? updated : p);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      const cleaned = cleanUndefinedValues(updated);
      await setDoc(doc(db, 'projects', cleaned.id), cleaned);
      localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(projects.map(p => p.id === updated.id ? updated : p)));
    } catch (err) {
      console.warn("Firestore update failed, falling back to local offline storage update:", err);
      setFirestoreOffline(true);
      setProjects(prev => {
        const next = prev.map(p => p.id === updated.id ? updated : p);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(next));
        return next;
      });
    }
  };

  // Create new project action handler
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newClientName.trim()) {
      alert("Please provide at least a project title and client name.");
      return;
    }
    if (!user) return;

    const pid = 'proj-' + Date.now();
    const newProject: BookProject = {
      id: pid,
      ownerId: user.uid,
      creatorName: userProfile ? userProfile.displayName : (user.displayName || 'Unknown Colleague'),
      creatorUsername: userProfile ? userProfile.username : 'unknown',
      projectName: newProjectName.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      currentPhaseIndex: 0, // Starts at phase 1 (index 0)
      clientContact: {
        name: newClientName.trim(),
        phone: newClientPhone.trim() || '+62 811-1111-2222',
        email: newClientEmail.trim() || 'info@client.com'
      },
      prospect: {
        meetingDate: '',
        meetingTime: '',
        meetingLocation: 'Rene Turos Offices',
        noted: false,
        status: ProspectStatus.PENDING
      },
      requirementBrief: {
        briefNotes: `Initial requirement log for "${newProjectName.trim()}". Details pending client feedback.`,
        briefDate: new Date().toISOString().split('T')[0],
        targetAudience: 'General audience index',
        bookGenre: newProjectGenre
      },
      creativeBrief: {
        proposedBookTitle: newProjectName.trim(),
        creativeConcept: 'Classic layout systems, traditional margins.',
        proposedDesignStyle: 'Traditional Editorial, Warm & Organic',
        clientFeedbackNotes: '',
        feedbackLogs: [],
        feedbackStatus: FeedbackStatus.PENDING,
        feedbackDate: ''
      },
      proposal: {
        offerings: [
          { id: 'srv-std-1', serviceName: 'Typographic Layout & Formatting', description: 'Meticulous micro-typography and chapter layout alignments.', cost: 30000000, selected: true },
          { id: 'srv-std-2', serviceName: 'Hardcover Fine Printing (500 copies)', description: 'Hardcover bounded acid-free book physical printing run.', cost: 82500000, selected: true }
        ],
        additionalTerms: 'Standard 50/50 payment split.',
        dateSent: '',
        status: ProposalStatus.DRAFT
      },
      closing: {
        finalAmount: 112500000,
        contractStatus: ContractStatus.DRAFT,
        contractDraftText: `Agreement draft for public services bundle on "${newProjectName.trim()}" between Rene Turos Group and stakeholders. Content details locked upon Phase 5 approved status.`,
        signedDate: '',
        signingRepresentative: ''
      },
      preProduction: {
        outlineChapters: [
          'Chapter 1: The New Beginning',
          'Chapter 2: Essential Narrative Focus'
        ],
        teamAssignments: [
          { role: 'Editor-in-Chief', employeeName: 'Evelyn Mercer' },
          { role: 'Graphic & Cover Designer', employeeName: 'Carlos Ruiz' }
        ],
        timeline: [
          { id: 't-1', taskName: 'Manuscript Audit Review', personInCharge: 'Evelyn Mercer', dueDate: '2026-06-15', status: TaskStatus.TODO }
        ]
      },
      production: {
        chapters: [
          { chapterNumber: 1, chapterTitle: 'The New Beginning', writingStatus: ProductionChapterStatus.TODO, layoutStatus: ProductionChapterStatus.TODO, wordCount: 0 },
          { chapterNumber: 2, chapterTitle: 'Essential Narrative Focus', writingStatus: ProductionChapterStatus.TODO, layoutStatus: ProductionChapterStatus.TODO, wordCount: 0 }
        ],
        proofreadingStatus: TaskStatus.TODO,
        endorsements: [],
        isbnStatus: ISBNStatus.NOT_REQUESTED,
        isbnNumber: '',
        coverStatus: CoverStatus.NOT_STARTED,
        covers: [],
        dummyBookStatus: DummyBookStatus.NONE,
        dummyBookSentDate: '',
        dummyBookFeedback: ''
      },
      printing: {
        proofSent: false,
        proofSentDate: '',
        proofReceived: false,
        revisionNotes: '',
        printingApproved: false,
        approvedBy: '',
        approvedDate: '',
        booksReceived: false,
        booksReceivedQty: 0,
        booksReceivedDate: ''
      },
      finalArtwork: {
        softcopySent: false,
        softcopySentDate: '',
        softcopyLink: '',
        trophyStatus: TrophyStatus.NONE,
        trophyRecipientName: newClientName.trim(),
        trophyDesignation: `Author of "${newProjectName.trim()}"`,
        trophyPlaqueText: `Commemorating "${newProjectName.trim()}" in partnership with the René Turos Editorial Guild.`
      }
    };

    if (firestoreOffline) {
      setProjects(prev => {
        const next = [newProject, ...prev];
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(next));
        return next;
      });
      setSelectedProjectId(pid);
      setViewingPhaseIndex(0);

      // Reset Form Input Toggles
      setNewProjectName('');
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setShowCreateForm(false);
      return;
    }

    try {
      const cleaned = cleanUndefinedValues(newProject);
      await setDoc(doc(db, 'projects', pid), cleaned);
      setSelectedProjectId(pid);
      setViewingPhaseIndex(0);

      // Reset Form Input Toggles
      setNewProjectName('');
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setShowCreateForm(false);
    } catch (err) {
      console.warn("Could not create project online, writing to local storage:", err);
      setFirestoreOffline(true);
      setProjects(prev => {
        const next = [newProject, ...prev];
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(next));
        return next;
      });
      setSelectedProjectId(pid);
      setViewingPhaseIndex(0);

      // Reset Form Input Toggles
      setNewProjectName('');
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setShowCreateForm(false);
    }
  };

  // Remove a project
  const handleDeleteProject = (pId: string) => {
    const proj = projects.find(p => p.id === pId);
    setDeleteTarget({
      type: 'project',
      id: pId,
      displayName: proj ? proj.projectName : 'Selected Project',
    });
  };

  const executeDeleteProject = async (pId: string) => {
    if (firestoreOffline) {
      setProjects(prev => {
        const next = prev.filter(p => p.id !== pId);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(next));
        return next;
      });
      setSelectedProjectId((prevId) => {
        if (prevId === pId) {
          const remaining = projects.filter(p => p.id !== pId);
          return remaining.length > 0 ? remaining[0].id : '';
        }
        return prevId;
      });
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteDoc(doc(db, 'projects', pId));
    } catch (err) {
      console.warn("Could not delete project online, updating local storage:", err);
      setFirestoreOffline(true);
      setProjects(prev => {
        const next = prev.filter(p => p.id !== pId);
        localStorage.setItem('ReneTuros_Offline_Projects', JSON.stringify(next));
        return next;
      });
      setSelectedProjectId((prevId) => {
        if (prevId === pId) {
          const remaining = projects.filter(p => p.id !== pId);
          return remaining.length > 0 ? remaining[0].id : '';
        }
        return prevId;
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Compute stats metrics dynamically
  const statsTotalActive = projects.length;
  const statsCompleted = projects.filter(p => p.currentPhaseIndex === 9 && p.printing.booksReceived).length;
  const statsTotalValue = projects.reduce((total, p) => total + (p.closing.finalAmount || 0), 0);
  const statsActiveLeadsCount = projects.filter(p => p.currentPhaseIndex <= 2).length;

  // Filter & Search projects for left sidebar
  const filteredProjects = projects.filter(p => {
    const matchSearch = p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.clientContact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = filterGenre === 'All' || p.requirementBrief.bookGenre === filterGenre;
    return matchSearch && matchGenre;
  });  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Logo size="md" className="animate-pulse" />
          <div className="h-1.5 w-32 bg-slate-150 rounded-full overflow-hidden mt-2 relative">
            <div className="h-full bg-slate-900 rounded-full animate-bounce w-1/2 mx-auto" />
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">Verifying editorial sandbox...</span>
        </div>
      </div>
    );
  }  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans p-6 selection:bg-slate-900 selection:text-white" style={{
        backgroundImage: 'radial-gradient(circle at top right, rgba(12, 107, 84, 0.08), transparent 45%), radial-gradient(circle at bottom left, rgba(242, 148, 30, 0.08), transparent 45%)'
      }}>
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="max-w-md w-full bg-white border border-slate-200/85 rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col items-center space-y-6">
            
            <Logo size="lg" />
            
            <div className="h-[2px] w-12 bg-[#0c6b54]" />

            <div className="space-y-1.5 text-center">
              <h2 className="text-xl font-display font-black text-slate-800 tracking-tight">Publishing Production Console</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                Coordinate book production phase, track printing runs, and manage authors securely under single-point coordination.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              {loginError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs font-semibold leading-normal">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="login-username" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="your username"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  disabled={isSigningIn}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="login-password" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all"
                  disabled={isSigningIn}
                />
              </div>

              <button
                id="login-submit-button"
                disabled={isSigningIn}
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white py-3.5 px-5 rounded-xl text-xs font-bold flex items-center justify-center shadow-md hover:shadow-slate-900/10 transition-all cursor-pointer border border-transparent disabled:opacity-50"
              >
                {isSigningIn ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  "Sign In to Live Console"
                )}
              </button>
            </form>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-extrabold uppercase tracking-widest pt-1 select-none">
              <ShieldCheck size={12} className="shrink-0 text-emerald-600" />
              Enterprise Credential Gate
            </div>
          </div>
        </div>

        <footer className="w-full max-w-md mx-auto flex items-center justify-between border-t border-slate-200/60 pt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
          <span>&copy; {new Date().getFullYear()} Rene Turos Group</span>
          <span>v1.4.15</span>
        </footer>
      </div>
    );
  }

  return (
    <div id="app-workspace-root" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* 1. MAIN GLOBAL NAVBAR */}
      <header id="app-global-header" className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo Brand component */}
          <Logo size="md" />

          {/* Quick Metrics & System stats widget */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">ACTIVE PORTFOLIO</span>
              <span className="text-sm font-extrabold text-slate-800 mt-0.5">{statsTotalActive} Book Projects</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">COMPLETED FINALLY</span>
              <span className="text-sm font-extrabold text-slate-800 mt-0.5">{statsCompleted} Printed</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">TOTAL SECURED VALUE</span>
              <span className="text-sm font-black text-emerald-700 mt-0.5">Rp {statsTotalValue.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Global Reset and additions triggers */}
          <div className="flex items-center gap-2">
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => setShowCreateForm(prev => !prev)}
                type="button"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={14} />
                New Book Project
              </button>
            )}

            {/* User Profile Card and Log Out button */}
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              {userProfile?.role === 'admin' && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  type="button"
                  className="px-2.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer mr-1"
                  title="Open Administrator Console"
                >
                  <ShieldCheck size={13} />
                  <span>Admin Panel</span>
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(prev => !prev)}
                  type="button"
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 hover:border-slate-350 rounded-xl p-1 pr-3 cursor-pointer select-none transition-all"
                >
                  <div className="w-6.5 h-6.5 text-[10px] bg-slate-950 border border-slate-200/50 text-white flex items-center justify-center font-extrabold rounded-lg uppercase shadow-sm overflow-hidden">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      (userProfile?.displayName || userProfile?.username || 'U').charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col text-left max-w-[90px] xl:max-w-[125px]">
                    <span className="text-[10px] font-black text-slate-700 leading-none truncate">{userProfile?.displayName || userProfile?.username || 'Author'}</span>
                    <span className="text-[8px] font-semibold text-emerald-700 mt-0.5 leading-none truncate uppercase tracking-wider">{userProfile?.role || 'Staff'}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white border-2 border-slate-950 rounded-xl shadow-xl z-25 p-2 font-sans overflow-hidden"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <p className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">Signed as</p>
                          <p className="text-xs font-black text-slate-800 truncate">{userProfile?.displayName || 'Teammate'}</p>
                          <p className="text-[9px] font-mono text-slate-450 mt-0.5">@{userProfile?.username}</p>
                        </div>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowProfileModal(true);
                          }}
                          type="button"
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer border-0"
                        >
                          <User size={13} />
                          <span>My Profile Settings</span>
                        </button>

                        {userProfile?.role === 'admin' && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowAdminPanel(true);
                            }}
                            type="button"
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer border-0"
                          >
                            <ShieldCheck size={13} />
                            <span>Colleague Console</span>
                          </button>
                        )}

                        <div className="h-px bg-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          type="button"
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer border-0"
                        >
                          <LogOut size={13} />
                          <span>Sign Out Session</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>


            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ======================================================== */}
        {/* NEW PROJECT ENTRY DRAWER SHOWN IN-LINE IF OPENED */}
        {/* ======================================================== */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              id="new-project-slide-drawer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <BookOpen size={16} />
                  </div>
                  <h3 className="text-lg font-display font-extrabold text-slate-800">
                    Register New Book Production Draft
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">BOOK PROJECT WORKING TITLE</label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="e.g. Chronicles of the Sea"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">CLIENT STAKEHOLDER NAME</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">GENRE CATEGORY</label>
                  <select
                    value={newProjectGenre}
                    onChange={e => setNewProjectGenre(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Biography / Memoir">Biography / Memoir</option>
                    <option value="Technical / Programming">Technical / Programming</option>
                    <option value="Photography / Landscape Art">Photography / Landscape Art</option>
                    <option value="Business / Leadership">Business / Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">CLIENT PHONE NUMBER</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    placeholder="+62 811..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">CLIENT EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    placeholder="client@mail.com"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div className="flex items-end justify-end">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-all"
                  >
                    ✓ Create Book Project draft
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* 3. VISUAL PIPELINE TIMELINE - KANBAN SUMMARY FOR BOARD OVERVIEW */}
        {/* ======================================================== */}
        <div id="global-kanban-board-overview" className="bg-slate-900 text-white border border-slate-850 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">Enterprise Status Map</span>
              <h3 className="text-base font-display font-extrabold mt-0.5">Rene Turos Production Board</h3>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Drag-like overview of client distributions
            </span>
          </div>

          {/* Stepped Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2.5 select-none overflow-x-auto pb-1">
            {PHASE_NAMES.map((name, index) => {
              // Elements currently on this step
              const booksOnThisStep = projects.filter(p => p.currentPhaseIndex === index);

              return (
                <div 
                  key={index} 
                  className="bg-slate-950/60 p-2.5.5 border border-slate-800 rounded-xl flex flex-col justify-between min-h-[90px]"
                >
                  <div className="mb-2 p-1.5">
                    <div className="flex items-center justify-between gap-1 leading-none">
                      <span className="text-[10px] font-mono text-slate-500 font-extrabold">STEP {index + 1}</span>
                      <span className="text-[11px] font-black text-amber-500 font-mono bg-amber-500/10 px-1 rounded">
                        {booksOnThisStep.length}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold block text-slate-300 mt-1 truncate max-w-full" title={name}>
                      {name}
                    </span>
                  </div>

                  {/* Books Stack inside this step */}
                  <div className="space-y-1 mt-auto">
                    {booksOnThisStep.map(bk => (
                      <button
                        type="button"
                        key={bk.id}
                        onClick={() => setSelectedProjectId(bk.id)}
                        className={`w-full text-left p-1.5 rounded text-[10px] truncate block font-bold transition-all ${
                          bk.id === selectedProjectId
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-white/10'
                            : 'bg-slate-800/80 text-white hover:bg-slate-750'
                        }`}
                        title={bk.projectName}
                      >
                        {bk.projectName}
                      </button>
                    ))}

                    {booksOnThisStep.length === 0 && (
                      <span className="text-[9px] text-slate-700 block italic text-center py-2">•</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. MAIN PROJECT MANAGEMENT SPLIT GRID DISPLAY */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* A. LEFT PORTFOLIO SELECTOR COLUMN (Col Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Filter and selector list */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
              
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                  LITERARY CATALOG
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-extrabold">
                  {filteredProjects.length} / {projects.length}
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search book or client..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              {/* Genre filter list */}
              <div className="flex items-center gap-1.5">
                <Filter size={10} className="text-slate-450 mt-0.5 shrink-0" />
                <select
                  value={filterGenre}
                  onChange={e => setFilterGenre(e.target.value)}
                  className="text-[11px] bg-transparent font-bold border-none text-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Genres</option>
                  <option value="Historical Fiction">Historical Fiction</option>
                  <option value="Biography / Memoir">Biography / Memoir</option>
                  <option value="Technical / Programming">Technical</option>
                  <option value="Photography / Landscape Art">Photography</option>
                </select>
              </div>

              {/* Main select list */}
              <div className="space-y-1.5 max-h-[385px] overflow-y-auto pr-1">
                {filteredProjects.map(p => {
                  const isActive = p.id === selectedProjectId;
                  const stepText = PHASE_NAMES[p.currentPhaseIndex];

                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`group p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 relative ${
                        isActive
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-slate-50/50 hover:bg-slate-50 border-slate-205'
                      }`}
                    >
                      {/* Genre indicator pill absolute */}
                      <span className={`absolute top-2.5 right-2 text-[8px] font-extrabold tracking-wider uppercase px-1 rounded ${
                        isActive ? 'text-slate-400' : 'text-slate-500 bg-slate-200/50'
                      }`}>
                        {p.requirementBrief.bookGenre.split(' ')[0]}
                      </span>

                      <span className={`text-xs font-bold block leading-snug pr-12 truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {p.projectName}
                      </span>
                      <span className={`text-[10px] block mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        Client: {p.clientContact.name}
                      </span>

                      {/* Small progression tag indicator */}
                      <div className="flex items-center justify-between transition-all mt-2 pt-2 border-t border-dashed border-slate-200/20">
                        <span className={`text-[9px] font-semibold flex items-center gap-1 ${
                          isActive ? 'text-amber-400' : 'text-slate-600'
                        }`}>
                          <Clock size={9} />
                          Step {p.currentPhaseIndex + 1}/10
                        </span>
                        
                        <span className={`text-[9px] font-extrabold uppercase shrink-0 truncate max-w-[100px] ${
                          isActive ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {stepText}
                        </span>
                      </div>

                      {/* Small actions icons (Admins only) - Always visible for high usability */}
                      {userProfile?.role === 'admin' && (
                        <div className="absolute right-2 top-8 flex gap-1.5 items-center z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(p);
                              setEditProjectName(p.projectName);
                              setEditProjectClientName(p.clientContact?.name || '');
                              setEditProjectClientEmail(p.clientContact?.email || '');
                              setEditProjectClientPhone(p.clientContact?.phone || '');
                              setEditProjectPhaseIndex(p.currentPhaseIndex);
                              setRegStatus(null);
                              setAdminTab('projects');
                              setShowAdminPanel(true);
                            }}
                            className={`p-1.5 rounded-lg shrink-0 scale-95 transition-all duration-200 outline-none cursor-pointer ${
                              isActive 
                                ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                                : 'text-slate-450 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title="Update Book Metadata"
                          >
                            <Edit size={11} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(p.id);
                            }}
                            className={`p-1.5 rounded-lg shrink-0 scale-95 transition-all duration-200 outline-none cursor-pointer ${
                              isActive 
                                ? 'text-slate-300 hover:text-red-400 hover:bg-white/10' 
                                : 'text-slate-400 hover:text-red-650 hover:bg-red-50'
                            }`}
                            title="Delete Project draft"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <div className="text-center py-8 bg-slate-50/50 border border-slate-200/60 rounded-xl p-4">
                    <p className="text-xs text-slate-500 italic">No book projects match the filters.</p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setFilterGenre('All'); }}
                      className="text-xs text-slate-900 font-bold underline block mx-auto mt-2"
                    >
                      Clear search filters
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Quick Informational help card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs leading-relaxed text-[11px] text-slate-500">
              <span className="font-extrabold text-slate-700 block mb-1 uppercase tracking-wider">RENE TUROS SYSTEMS</span>
              The Rene Turos Book Production Manager acts as an enterprise single point of coordinates. Record prospect visits, finalize estimates, compile chapter status, track mock print dummies, and configure commemorative trophies.
            </div>

          </div>

          {/* B. MIDDLE/RIGHT WORKSPACE CONTENT COLUMN (Col Span 9) */}
          <div className="lg:col-span-9 space-y-6">
            
            {activeProject ? (
              <div className="space-y-6">
                
                {/* Active selection banner */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 text-white font-black text-lg flex items-center justify-center rounded-xl font-display shadow-sm">
                      {activeProject.projectName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-display font-black text-slate-800 leading-tight">
                          {activeProject.projectName}
                        </h2>
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase">
                          {activeProject.requirementBrief.bookGenre}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        Client contact stakeholder: <strong>{activeProject.clientContact.name}</strong> • Phone: <span className="font-semibold">{activeProject.clientContact.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions for contact stakeholder */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${activeProject.clientContact.email}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                      title={`Email ${activeProject.clientContact.email}`}
                    >
                      <Mail size={15} />
                    </a>
                    <a
                      href={`tel:${activeProject.clientContact.phone}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                      title={`Call ${activeProject.clientContact.phone}`}
                    >
                      <Phone size={15} />
                    </a>
                  </div>
                </div>

                {/* 2. Interactive phase horizontal timeline stepper widget */}
                <PhaseStepper
                  currentPhaseIndex={activeProject.currentPhaseIndex}
                  viewingPhaseIndex={viewingPhaseIndex}
                  onSelectViewingPhase={(idx) => setViewingPhaseIndex(idx)}
                  onUpdateOfficialPhase={(idx) => {
                    handleUpdateActiveProject({
                      ...activeProject,
                      currentPhaseIndex: idx
                    });
                  }}
                />

                {/* 3. Detailed configurations and logs nested form */}
                <PhaseDetailForm
                  project={activeProject}
                  onChangeProject={handleUpdateActiveProject}
                  viewingPhaseIndex={viewingPhaseIndex}
                  userProfile={userProfile}
                />

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                <AlertCircle size={44} className="text-slate-300 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-display font-extrabold text-slate-800">
                  No Active Book Project Selected
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Click on an existing project in the catalog on the left to start editing, or create a brand new draft using the "New Book Project" button above.
                </p>
                
                {userProfile?.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl mt-6 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    Initiate New Book Setup
                  </button>
                ) : (
                  <p className="text-xs text-slate-400 mt-6 italic">
                    Only system administrators can initiate new book projects. Select an existing project from the left catalog to start participating!
                  </p>
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Rene Turos Group. All editorial rights reserved. Managed & monitored securely in the cloud workspace coordinate system.
          </p>
          <p className="text-[10px] text-slate-350 font-mono">
            System build v1.4.15
          </p>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* ADMIN PANEL - TWO-TAB SYSTEM CONSOLE MODAL (USERS + PROJECTS CRUD) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showAdminPanel && (
          <div key="admin-panel-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans selection:bg-slate-900 selection:text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-2 border-slate-950 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">System Corporate Console</h3>
                    <p className="text-[10px] text-slate-450 font-medium">Coordinate, edit, and oversee staff access registry and active book catalog records.</p>
                  </div>
                </div>
                
                {/* Tabs selection triggers! */}
                <div className="flex items-center bg-slate-200 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => { setAdminTab('users'); setRegStatus(null); }}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      adminTab === 'users' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users size={12} />
                      <span>Colleagues & Roles ({usersList.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setAdminTab('projects'); setRegStatus(null); }}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      adminTab === 'projects' 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} />
                      <span>Projects Directory ({projects.length})</span>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => { 
                    setShowAdminPanel(false); 
                    setRegStatus(null); 
                    setEditingUser(null);
                    setEditingProject(null);
                  }}
                  type="button"
                  className="p-1 px-3 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer self-end sm:self-auto transition-colors"
                >
                  Close Console
                </button>
              </div>

              {/* Status Banner */}
              {regStatus && (
                <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-bold shrink-0 ${
                  regStatus.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-150 text-emerald-800' 
                    : 'bg-red-50 border border-red-150 text-red-00'
                }`}>
                  {regStatus.message}
                </div>
              )}

              {/* Body Content */}
              <div className="p-6 overflow-y-auto flex-1 min-h-0">
                {adminTab === 'users' ? (
                  /* ======================================================== */
                  /* TAB 1: COLLEAGUE ROLES AND USER REGISTRY CRUD */
                  /* ======================================================== */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start h-full">
                    {/* Left Form: Add or Edit user */}
                    <div className="bg-slate-50/45 border border-slate-200 p-4.5 rounded-xl space-y-4">
                      {editingUser ? (
                        <div className="space-y-4">
                          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-black text-indigo-700 tracking-wider uppercase">Edit Colleague Access</h4>
                              <p className="text-[10px] text-slate-500 font-medium">Modify administrative roles and secure credentials.</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setEditUserDisplayName('');
                                setEditUserPassword('');
                                setEditUserRole('user');
                                setEditUserPhotoURL('');
                                setRegStatus(null);
                              }}
                              type="button"
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              ✕ Cancel Edit
                            </button>
                          </div>

                          <form onSubmit={handleUpdateUser} className="space-y-3.5">
                            {/* Photo sector */}
                            <div className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg">
                              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-200 text-white font-extrabold text-xs uppercase flex items-center justify-center overflow-hidden shrink-0">
                                {editUserPhotoURL ? (
                                  <img src={editUserPhotoURL} alt="Teammate preview" className="w-full h-full object-cover" />
                                ) : (
                                  (editUserDisplayName || editingUser.username || 'U').charAt(0)
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Teammate Image</span>
                                <div className="flex items-center gap-1.5">
                                  <label htmlFor="admin-pic-file-input" className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-[9px] font-bold cursor-pointer">
                                    Upload Pic
                                  </label>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAdminProfilePicUpload} 
                                    className="hidden" 
                                    id="admin-pic-file-input" 
                                  />
                                  {editUserPhotoURL && (
                                    <button
                                      type="button"
                                      onClick={() => setEditUserPhotoURL('')}
                                      className="text-[9px] font-bold text-red-500 p-1"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Username Handle</label>
                              <input
                                type="text"
                                value={editingUser.username}
                                disabled
                                className="w-full bg-slate-100 border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 cursor-not-allowed outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Full Display Name</label>
                              <input
                                type="text"
                                value={editUserDisplayName}
                                onChange={(e) => setEditUserDisplayName(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Change Password (Leave blank to keep existing)</label>
                              <input
                                type="password"
                                value={editUserPassword}
                                onChange={(e) => setEditUserPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white border border-slate-255 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                                minLength={6}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Role Permission Level</label>
                              <select
                                value={editUserRole}
                                onChange={(e) => setEditUserRole(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-850 cursor-pointer outline-none"
                              >
                                <option value="user">Editor / Staff Member</option>
                                <option value="admin">System Administrator</option>
                              </select>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-indigo-650 hover:bg-indigo-600 font-bold active:scale-[0.98] text-white py-2.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all mt-4"
                            >
                              <CheckCircle2 size={13} />
                              <span>Update Colleague Profile</span>
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">Add New Team Member</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Create a local authenticated account with customized roles.</p>
                          </div>

                          <form onSubmit={handleRegisterUser} className="space-y-3.5">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Full Display Name</label>
                              <input
                                type="text"
                                value={newRegDisplayName}
                                onChange={(e) => setNewRegDisplayName(e.target.value)}
                                placeholder="e.g. Sandra Wulandari"
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-455 uppercase tracking-wider">Username Handle</label>
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={newRegUsername}
                                  onChange={(e) => setNewRegUsername(e.target.value)}
                                  placeholder="e.g. sandra"
                                  className="flex-1 bg-white border border-slate-250 rounded-l-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                                  required
                                />
                                <span className="bg-slate-100 border border-l-0 border-slate-250 px-3 py-2 rounded-r-lg text-[10px] font-mono text-slate-500 select-none shrink-0">
                                  @editorial.local
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Secure Access Password (min 6 chars)</label>
                              <input
                                type="password"
                                value={newRegPassword}
                                onChange={(e) => setNewRegPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white border border-slate-255 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                                required
                                minLength={6}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Role Permission Level</label>
                              <select
                                value={newRegRole}
                                onChange={(e) => setNewRegRole(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-855 cursor-pointer outline-none"
                              >
                                <option value="user">Editor / Staff Member</option>
                                <option value="admin">System Administrator</option>
                              </select>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all mt-4"
                            >
                              <Plus size={14} />
                              <span>Register Teammate</span>
                            </button>
                          </form>
                        </div>
                      )}
                    </div>

                    {/* Right Directory: Colleague List */}
                    <div className="space-y-4 flex flex-col h-full max-h-[50vh] md:max-h-[380px] overflow-hidden">
                      <div className="border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">Console Members ({usersList.length})</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Active credential records stored inside Firestore catalog.</p>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                        {usersList.length === 0 ? (
                          <p className="text-[10px] font-semibold text-slate-400 text-center py-12">Retrieving system accounts registry...</p>
                        ) : (
                          usersList.map((usr, index) => (
                            <div key={usr.uid || index} className="p-3 border border-slate-205 rounded-xl bg-white flex flex-col gap-2.5 shadow-3xs hover:border-slate-350 transition-all">
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 max-w-[65%]">
                                  <div className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-200 text-white font-extrabold text-[11px] uppercase flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                    {usr.photoURL ? (
                                      <img src={usr.photoURL} alt={usr.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                      (usr.displayName || usr.username || 'U').charAt(0)
                                    )}
                                  </div>
                                  <div className="flex flex-col truncate">
                                    <span className="font-extrabold text-slate-700 truncate leading-tight">{usr.displayName || 'Authorized Member'}</span>
                                    <span className="text-[10px] font-mono font-medium text-slate-450 leading-none mt-1 truncate">{usr.username}@editorial.local</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                    usr.role === 'admin' 
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' 
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                  }`}>
                                    {usr.role || 'Staff'}
                                  </span>
                                  
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingUser(usr);
                                        setEditUserDisplayName(usr.displayName || '');
                                        setEditUserRole(usr.role || 'user');
                                        setEditUserPassword(usr.password || '');
                                        setEditUserPhotoURL(usr.photoURL || '');
                                        setRegStatus(null);
                                      }}
                                      type="button"
                                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                      title="Edit colleague credentials"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(usr.username)}
                                      type="button"
                                      className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                      title="Delete colleague access"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {usr.createdAt && (
                                <div className="text-[8.5px] text-slate-400 font-semibold flex items-center justify-between border-t border-slate-50 pt-1.5 font-sans">
                                  <span>Registered {formatDate(usr.createdAt)}</span>
                                  <span className="font-mono text-slate-350">{usr.password ? `PW: ${'•'.repeat(usr.password.length)}` : 'No PW'}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* TAB 2: BOOK PROJECTS DIRECTORY CRUD (ADMINS ONLY) */
                  /* ======================================================== */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start h-full">
                    {/* Left Form: Add or Edit active projects */}
                    <div className="bg-slate-50/45 border border-slate-200 p-4.5 rounded-xl space-y-4">
                      {editingProject ? (
                        <div className="space-y-4">
                          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-black text-indigo-700 tracking-wider uppercase">Edit Book Project Metadata</h4>
                              <p className="text-[10px] text-slate-500 font-medium">Re-orient client details, titles, or overrides directly.</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingProject(null);
                                setEditProjectName('');
                                setEditProjectClientName('');
                                setEditProjectClientEmail('');
                                setEditProjectClientPhone('');
                                setEditProjectPhaseIndex(0);
                                setRegStatus(null);
                              }}
                              type="button"
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              ✕ Cancel Edit
                            </button>
                          </div>

                          <form onSubmit={handleUpdateProjectAdmin} className="space-y-3.5">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Book Name / project Title</label>
                              <input
                                type="text"
                                value={editProjectName}
                                onChange={(e) => setEditProjectName(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Client Representative Name</label>
                              <input
                                type="text"
                                value={editProjectClientName}
                                onChange={(e) => setEditProjectClientName(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Client Email Address</label>
                              <input
                                type="email"
                                value={editProjectClientEmail}
                                onChange={(e) => setEditProjectClientEmail(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Client Phone Number</label>
                              <input
                                type="text"
                                value={editProjectClientPhone}
                                onChange={(e) => setEditProjectClientPhone(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Project Phase Override</label>
                              <select
                                value={editProjectPhaseIndex}
                                onChange={(e) => setEditProjectPhaseIndex(Number(e.target.value))}
                                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-850 cursor-pointer outline-none"
                              >
                                {PHASE_NAMES.map((name, idx) => (
                                  <option key={idx} value={idx}>Phase {idx + 1}: {name}</option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-slate-900 hover:bg-slate-800 font-bold active:scale-[0.98] text-white py-2.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all mt-4"
                            >
                              <CheckCircle2 size={13} />
                              <span>Update Book Metadata</span>
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">Add New Book Project Draft</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Instantiate a complete corporate project track record inside database.</p>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[10.5px] text-slate-550 leading-relaxed font-sans">
                              Admins can click on <span className="font-extrabold text-[#0c6b54]">"New Book Project"</span> directly in the top navbar header. It will launch our dynamic Phase-1 wizard with full template blueprints preloaded automatically.
                            </p>
                            <button
                              onClick={() => {
                                setShowAdminPanel(false);
                                setShowCreateForm(true);
                              }}
                              type="button"
                              className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs rounded-lg flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Plus size={13} />
                              <span>Open Project Wizard Drawer</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Directory: Catalog List */}
                    <div className="space-y-4 flex flex-col h-full max-h-[50vh] md:max-h-[380px] overflow-hidden">
                      <div className="border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">Active Catalog Directory ({projects.length})</h4>
                        <p className="text-[10px] text-slate-500 font-medium font-sans">Active project records synced with physical and digital formats.</p>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                        {projects.length === 0 ? (
                          <p className="text-[10px] font-semibold text-slate-400 text-center py-12">Retrieving system catalog...</p>
                        ) : (
                          projects.map((p) => (
                            <div key={p.id} className="p-3.5 border border-slate-205 rounded-xl bg-white flex flex-col gap-2.5 shadow-3xs hover:border-slate-350 transition-all">
                              <div className="flex items-center justify-between gap-2.5 text-xs">
                                <div className="flex items-center gap-2 max-w-[65%]">
                                  <div className="w-8.5 h-8.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                                    <BookOpen size={14} />
                                  </div>
                                  <div className="flex flex-col truncate">
                                    <span className="font-extrabold text-slate-800 truncate leading-tight">{p.projectName}</span>
                                    <span className="text-[9px] font-mono font-medium text-slate-450 mt-1">ID: {p.id}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-slate-100 text-slate-705 border border-slate-200`}>
                                    P{p.currentPhaseIndex + 1}
                                  </span>
                                  
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingProject(p);
                                        setEditProjectName(p.projectName);
                                        setEditProjectClientName(p.clientContact?.name || '');
                                        setEditProjectClientEmail(p.clientContact?.email || '');
                                        setEditProjectClientPhone(p.clientContact?.phone || '');
                                        setEditProjectPhaseIndex(p.currentPhaseIndex);
                                        setRegStatus(null);
                                      }}
                                      type="button"
                                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                      title="Edit book metadata override"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProject(p.id)}
                                      type="button"
                                      className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-650 transition-colors cursor-pointer"
                                      title="Delete project track"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 border-t border-slate-50 text-[10px] font-medium text-slate-550">
                                <div>Client: <span className="font-bold text-slate-700">{p.clientContact?.name || 'N/A'}</span></div>
                                <div>Created: <span className="font-semibold text-slate-700">{p.createdAt}</span></div>
                                <div className="col-span-2 truncate">Email: <span className="font-mono text-slate-700">{p.clientContact?.email || 'N/A'}</span></div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* USER PERSONAL PROFILE SETTINGS MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showProfileModal && (
          <div key="profile-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 font-sans selection:bg-slate-900 selection:text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-2 border-slate-950 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 text-white p-2 rounded-xl">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">My Profile Settings</h3>
                    <p className="text-[10px] text-slate-450 font-medium">Configure credentials and upload avatar picture.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  type="button"
                  className="p-1 px-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                {/* Profile Pic Sector */}
                <div className="flex items-center gap-3.5 p-3 border border-slate-150 rounded-xl bg-slate-50/50">
                  <div className="relative w-12 h-12 bg-slate-900 border border-slate-200 rounded-xl text-white flex items-center justify-center font-extrabold text-base uppercase overflow-hidden shrink-0 shadow-sm">
                    {newProfilePhotoURL ? (
                      <img src={newProfilePhotoURL} alt="Profile photo" className="w-full h-full object-cover" />
                    ) : (
                      (newProfileDisplayName || userProfile?.username || 'U').charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Colleague Photo</label>
                    <div className="flex items-center gap-2">
                      <label htmlFor="modal-pic-file-input" className="px-2 py-1 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-lg text-[9px] font-bold shadow-xs cursor-pointer select-none transition-all">
                        Browse Image
                      </label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProfilePicUpload} 
                        className="hidden" 
                        id="modal-pic-file-input" 
                      />
                      {newProfilePhotoURL && (
                        <button
                          type="button"
                          onClick={() => setNewProfilePhotoURL('')}
                          className="text-[9px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={newProfileDisplayName}
                    onChange={(e) => setNewProfileDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">New Password (Leave blank to keep existing)</label>
                  <input
                    type="password"
                    value={newProfilePassword}
                    onChange={(e) => setNewProfilePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-255 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-slate-850 focus:bg-white"
                    minLength={6}
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2 justify-end">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    type="button"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] transition-all text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* GLOBAL INTERACTIVE DELETION CONFIRMATION OVERLAY MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {deleteTarget && (
          <div key="delete-confirmation-modal" className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-59 p-4 font-sans selection:bg-slate-900 selection:text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-2 border-[#ff3b30] rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-xl">
                  <AlertCircle size={20} className="animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">Confirm Deletion</h3>
                  <p className="text-[10px] text-slate-400 font-medium">This operation is permanent and irreversible.</p>
                </div>
                <button
                  onClick={() => setDeleteTarget(null)}
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl space-y-2 text-xs text-slate-700">
                <p className="leading-relaxed">
                  Are you absolutely sure you want to permanently delete this {deleteTarget.type === 'user' ? 'colleague registration account' : 'corporate book project draft'}?
                </p>
                <div className="p-2.5 bg-white border border-red-150 rounded-lg flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${deleteTarget.type === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
                  <span className="font-mono font-black text-slate-800 break-all">{deleteTarget.displayName}</span>
                </div>
                {deleteTarget.type === 'user' ? (
                  <p className="text-[9.5px] text-red-600 font-bold leading-normal">
                    ⚠️ The colleague will immediately lose system registry credentials and cannot sign back in.
                  </p>
                ) : (
                  <p className="text-[9.5px] text-red-600 font-bold leading-normal">
                    ⚠️ All dynamic phases, brief notes, and printing configurations for this book will be permanently shredded.
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  type="button"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (deleteTarget.type === 'user') {
                      await executeDeleteUser(deleteTarget.id);
                    } else {
                      await executeDeleteProject(deleteTarget.id);
                    }
                  }}
                  type="button"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-red-200/40 flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
