import React, { useState, useEffect } from 'react';
import { 
  BookProject, 
  ProspectStatus, 
  FeedbackStatus, 
  ProposalStatus, 
  ContractStatus, 
  TaskStatus, 
  ProductionChapterStatus, 
  ISBNStatus, 
  CoverStatus, 
  DummyBookStatus, 
  TrophyStatus,
  ServiceOffering,
  TeamAssignment,
  TimelineTask,
  ChapterProgress,
  EndorsementQuote,
  CoverProposal
} from '../types';
import { 
  User, Mail, Phone, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Plus, Trash2, 
  ChevronRight, FileText, DollarSign, PenTool, Layout, Check, BookOpen, ShieldCheck, 
  Sparkles, HelpCircle, FileCheck, Layers, Award, Tag, Truck, CheckSquare, RefreshCw 
} from 'lucide-react';
import TrophyPreview from './TrophyPreview';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface PhaseDetailFormProps {
  project: BookProject;
  onChangeProject: (updated: BookProject) => void;
  viewingPhaseIndex: number; // 0 to 9 representing active selected tab
  userProfile?: any;
}

const DEFAULT_ROLES = [
  'Editor-in-Chief',
  'Graphic & Cover Designer',
  'Lead Typesetter',
  'Proofreader',
  'Production Supervisor'
];

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

export default function PhaseDetailForm({
  project,
  onChangeProject,
  viewingPhaseIndex,
  userProfile
}: PhaseDetailFormProps) {

  // Local helper states for dynamic additions
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  
  const [newTimelineTask, setNewTimelineTask] = useState('');
  const [newTimelineOwner, setNewTimelineOwner] = useState('');
  const [newTimelineDate, setNewTimelineDate] = useState('');

  const [newEndorseAuthor, setNewEndorseAuthor] = useState('');
  const [newEndorseTitle, setNewEndorseTitle] = useState('');
  const [newEndorseQuote, setNewEndorseQuote] = useState('');

  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCost, setNewServiceCost] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [newBriefLog, setNewBriefLog] = useState('');
  const [newFeedbackLog, setNewFeedbackLog] = useState('');

  const [availableTeam, setAvailableTeam] = useState<any[]>([]);
  const [showClearMOMConfirm, setShowClearMOMConfirm] = useState(false);
  const [confirmDeleteBriefDocIndex, setConfirmDeleteBriefDocIndex] = useState<number | null>(null);
  const [confirmDeleteConceptDocIndex, setConfirmDeleteConceptDocIndex] = useState<number | null>(null);

  // Reset confirmation state when the project or phase is changed
  useEffect(() => {
    setShowClearMOMConfirm(false);
    setConfirmDeleteBriefDocIndex(null);
    setConfirmDeleteConceptDocIndex(null);
    setNewFeedbackLog('');
  }, [project.id, viewingPhaseIndex]);

  // Synchronize available workspace teammates directly from the users collection
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      list.sort((a, b) => (a.displayName || a.username || '').localeCompare(b.displayName || b.username || ''));
      setAvailableTeam(list);
    }, (err) => {
      console.warn("Could not load users list inside PhaseDetailForm:", err);
    });
    return () => unsub();
  }, []);

  // Universal function to deep-update deep fields cleanly
  const updateProject = (updater: (draft: BookProject) => void) => {
    const cloned = JSON.parse(JSON.stringify(project)) as BookProject;
    updater(cloned);
    onChangeProject(cloned);
  };

  // File upload logic for minutes of meeting
  const handleMinutesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readMinutesFile(file);
  };

  const handleMinutesDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMinutesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readMinutesFile(file);
    }
  };

  const readMinutesFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateProject(draft => {
        draft.prospect.minutesOfMeetingFileName = file.name;
        draft.prospect.minutesOfMeetingFileData = reader.result as string;
        draft.prospect.minutesOfMeetingUploadedBy = userProfile ? (userProfile.displayName || userProfile.username) : 'Active Colleague';
        draft.prospect.minutesOfMeetingUploadedAt = new Date().toISOString();
      });
    };
    reader.readAsDataURL(file);
  };

  // File upload logic for requirement brief documents
  const handleBriefFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      readBriefFile(files[i]);
    }
  };

  const handleBriefDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBriefDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        readBriefFile(files[i]);
      }
    }
  };

  const readBriefFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateProject(draft => {
        if (!draft.requirementBrief.documents) {
          draft.requirementBrief.documents = [];
        }
        draft.requirementBrief.documents.push({
          name: file.name,
          data: reader.result as string,
          uploadedBy: userProfile ? (userProfile.displayName || userProfile.username) : 'Active Colleague',
          uploadedAt: new Date().toISOString()
        });
      });
    };
    reader.readAsDataURL(file);
  };

  // File upload logic for creative concept documents
  const handleConceptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      readConceptFile(files[i]);
    }
  };

  const handleConceptDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleConceptDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        readConceptFile(files[i]);
      }
    }
  };

  const readConceptFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateProject(draft => {
        if (!draft.creativeBrief.creativeConceptDocuments) {
          draft.creativeBrief.creativeConceptDocuments = [];
        }
        draft.creativeBrief.creativeConceptDocuments.push({
          name: file.name,
          data: reader.result as string,
          uploadedBy: userProfile ? (userProfile.displayName || userProfile.username) : 'Active Colleague',
          uploadedAt: new Date().toISOString()
        });
      });
    };
    reader.readAsDataURL(file);
  };

  // Helper values
  const proposalSum = project.proposal.offerings
    .filter(o => o.selected)
    .reduce((sum, o) => sum + o.cost, 0);

  // Reusable sub-elements or forms
  return (
    <div id="phase-detail-form-container" className="space-y-6">
      
      {/* Dynamic Header for active viewing Phase */}
      <div id="phase-detail-header" className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {/* Background visual motif */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Phase {viewingPhaseIndex + 1}
              </span>
              <span className="text-xs text-slate-300 font-medium">Workflow Step</span>
            </div>
            
            <h2 className="text-2xl font-display font-extrabold mt-1 tracking-tight">
              {viewingPhaseIndex + 1}. {
                viewingPhaseIndex === 0 ? 'New Book Project Setup' :
                viewingPhaseIndex === 1 ? 'Prospect & Initial Visit' :
                viewingPhaseIndex === 2 ? 'Requirement Briefing' :
                viewingPhaseIndex === 3 ? 'Creative Concept Proposals' :
                viewingPhaseIndex === 4 ? 'Publishing Proposal' :
                viewingPhaseIndex === 5 ? 'Closing & Contracting' :
                viewingPhaseIndex === 6 ? 'Pre-Production & Assignments' :
                viewingPhaseIndex === 7 ? 'Production & Iterations' :
                viewingPhaseIndex === 8 ? 'Printing & Press Run' :
                'Final Artwork Delivery'
              }
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {viewingPhaseIndex === 0 && "Kickstart a new literary venture. Establish core parameters and define primary stakeholder contacts."}
              {viewingPhaseIndex === 1 && "Log and coordinate client visits, edit sales statuses, and prepare agendas for production talks."}
              {viewingPhaseIndex === 2 && "Record essential requirements directly from the customer. Map out target readerships and print specifications."}
              {viewingPhaseIndex === 3 && "Propose cover aesthetics, typography guidelines, and track client feedback on concept design drafts."}
              {viewingPhaseIndex === 4 && "Review estimated publishing pricing, append service layers, and verify total estimated costs."}
              {viewingPhaseIndex === 5 && "Solidify financial arrangements, generate high-fidelity electronic contracts, and seal terms."}
              {viewingPhaseIndex === 6 && "Design outline chapters, construct team layout guides, and project schedules."}
              {viewingPhaseIndex === 7 && "Monitor granular chapter statuses for text drafts, layout editing, proofreading, ISBN issues, and dust jacket art."}
              {viewingPhaseIndex === 8 && "Coordinate with high-grade printing press houses, review proof outputs, and track boxes delivery."}
              {viewingPhaseIndex === 9 && "Deliver softcopy final versions and configure the commemorative gold-plaited plaque."}
            </p>
          </div>

          {/* Promote Phase Option if this view is not the official active phase */}
          {project.currentPhaseIndex !== viewingPhaseIndex ? (
            <button
              type="button"
              onClick={() => {
                updateProject(draft => {
                  draft.currentPhaseIndex = viewingPhaseIndex;
                });
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles size={14} />
              Set as Current Main Stage
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold">
              <CheckCircle2 size={13} className="text-emerald-400 animate-pulse" />
              Active Main Stage
            </div>
          )}
        </div>
      </div>

      {/* Main Form content segmented by viewed phase */}
      <div id="form-inner-workspace" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
        
        {/* ======================================= */}
        {/* PHASE 1: NEW BOOK PROJECT */}
        {/* ======================================= */}
        {viewingPhaseIndex === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-1.5">Project Working Title</label>
              <input
                type="text"
                value={project.projectName}
                onChange={(e) => updateProject(draft => { draft.projectName = e.target.value; })}
                className="w-full text-base font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-slate-400 transition-colors"
                placeholder="e.g. The Whispering Pines"
              />
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <User size={15} className="text-slate-400" />
                Client Stakeholder Contact
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block mb-1">CLIENT CONTACT NAME</label>
                  <input
                    type="text"
                    value={project.clientContact.name}
                    onChange={(e) => updateProject(draft => { draft.clientContact.name = e.target.value; })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-400"
                    placeholder="Arthur Green"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    value={project.clientContact.phone}
                    onChange={(e) => updateProject(draft => { draft.clientContact.phone = e.target.value; })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-400"
                    placeholder="+62 811-XXXX-XXXX"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={project.clientContact.email}
                    onChange={(e) => updateProject(draft => { draft.clientContact.email = e.target.value; })}
                    className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-400"
                    placeholder="arthur@greenwood.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                  <Calendar size={15} className="text-slate-400" />
                  Meta Information
                </h4>
                
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block mb-1">CREATION RECORD DATE</label>
                    <input
                      type="date"
                      value={project.createdAt}
                      onChange={(e) => updateProject(draft => { draft.createdAt = e.target.value; })}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block mb-1">PROJECT CREATOR</label>
                    <div className="flex items-center gap-2 w-full text-sm bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold select-none">
                      <User size={14} className="text-slate-400" />
                      <span>
                        {(() => {
                          const matchedCreator = availableTeam.find((u) => u.uid === project.ownerId || u.username === project.creatorUsername);
                          return project.creatorName || (matchedCreator ? matchedCreator.displayName : null) || (project.ownerId === 'usr_admin' ? 'System Admin' : 'Active Colleague');
                        })()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block mb-1">PROJECT REFERENCE ID</label>
                    <input
                      type="text"
                      disabled
                      value={project.id}
                      className="w-full text-sm bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-150 text-[11px] text-slate-500 mt-2">
                <strong>Hint:</strong> Entering email information correctly enables sending contract drafts and initial outlines directly through the portal workflows in subsequent phases.
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 2: PROSPECT */}
        {/* ======================================= */}
        {viewingPhaseIndex === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <Calendar size={15} className="text-slate-400" />
                Schedule Initial Meeting & Visit
              </h4>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block mb-1">VISIT DATE</label>
                    <input
                      type="date"
                      value={project.prospect.meetingDate}
                      onChange={(e) => updateProject(draft => { draft.prospect.meetingDate = e.target.value; })}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-850"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block mb-1">VISIT TIME</label>
                    <input
                      type="time"
                      value={project.prospect.meetingTime}
                      onChange={(e) => updateProject(draft => { draft.prospect.meetingTime = e.target.value; })}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-850"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block mb-1">MEETING LOCATION / SUITE</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={project.prospect.meetingLocation}
                      onChange={(e) => updateProject(draft => { draft.prospect.meetingLocation = e.target.value; })}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-850"
                      placeholder="e.g. Rene Turos Offices / Google Meet sync"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={project.prospect.noted}
                      onChange={(e) => updateProject(draft => { draft.prospect.noted = e.target.checked; })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-600 font-semibold">
                      Agendas and client details noted & verified prior to visit
                    </span>
                  </label>
                </div>

                {/* Assign Teammate(s) */}
                <div className="border-t border-slate-200/60 pt-3 space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    Assign Teammate(s) to Conduct Visit
                  </label>
                  
                  {/* Selected Teammates Tags */}
                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white border border-slate-200 rounded-lg items-center">
                    {(!project.prospect.assignedTeammates || project.prospect.assignedTeammates.length === 0) ? (
                      <span className="text-xs text-slate-400 italic px-1">No teammates assigned yet. Choose from the list below.</span>
                    ) : (
                      project.prospect.assignedTeammates.map((username) => {
                        const defaultOptions = [
                          { displayName: 'System Admin', username: 'admin', role: 'admin' },
                          { displayName: 'Editorial Staff', username: 'staff1', role: 'user' },
                          { displayName: 'Lead Designer', username: 'designer1', role: 'user' },
                          { displayName: 'Proofreader Guild', username: 'proofreader1', role: 'user' }
                        ];
                        const teamOptions = availableTeam.length > 0 ? availableTeam : defaultOptions;
                        const matchedUser = teamOptions.find(u => u.username === username);
                        const displayedName = matchedUser ? matchedUser.displayName : username;
                        return (
                          <span
                            key={username}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors"
                          >
                            <span>{displayedName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                updateProject(draft => {
                                  draft.prospect.assignedTeammates = (draft.prospect.assignedTeammates || []).filter(u => u !== username);
                                });
                              }}
                              className="text-slate-400 hover:text-red-500 font-bold ml-1 text-xs"
                              title="Remove assignment"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Select dropdown to toggle teammates */}
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        updateProject(draft => {
                          const list = draft.prospect.assignedTeammates || [];
                          if (!list.includes(val)) {
                            draft.prospect.assignedTeammates = [...list, val];
                          }
                        });
                        e.target.value = ''; // Reset select
                      }}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-750 cursor-pointer"
                    >
                      <option value="">-- Choose a teammate to assign --</option>
                      {(() => {
                        const defaultOptions = [
                          { displayName: 'System Admin', username: 'admin', role: 'admin' },
                          { displayName: 'Editorial Staff', username: 'staff1', role: 'user' },
                          { displayName: 'Lead Designer', username: 'designer1', role: 'user' },
                          { displayName: 'Proofreader Guild', username: 'proofreader1', role: 'user' }
                        ];
                        const teamOptions = availableTeam.length > 0 ? availableTeam : defaultOptions;
                        return teamOptions.map((u) => {
                          const isAssigned = (project.prospect.assignedTeammates || []).includes(u.username);
                          return (
                            <option 
                              key={u.username} 
                              value={u.username}
                              disabled={isAssigned}
                            >
                              {u.displayName} ({u.role || 'Teammate'}) {isAssigned ? '• Assigned' : ''}
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>
                </div>

                {/* Meeting completion & Minutes tracking */}
                <div className="border-t border-slate-200/60 pt-4 space-y-4">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare size={13} className="text-slate-400" />
                    Visit & Meeting Tracking
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer select-none py-1.5">
                        <input
                          type="checkbox"
                          checked={project.prospect.meetingDone || false}
                          onChange={(e) => updateProject(draft => { 
                            draft.prospect.meetingDone = e.target.checked;
                            if (e.target.checked && !draft.prospect.meetingDoneDate) {
                              draft.prospect.meetingDoneDate = new Date().toISOString().split('T')[0];
                            }
                          })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-slate-700 font-bold">
                          Meeting / Visit Completed
                        </span>
                      </label>
                    </div>

                    {project.prospect.meetingDone && (
                      <div className="animate-fade-in transition-all">
                        <label className="text-[10px] font-extrabold text-slate-400 block mb-1">COMPLETION DATE</label>
                        <input
                          type="date"
                          value={project.prospect.meetingDoneDate || ''}
                          onChange={(e) => updateProject(draft => { draft.prospect.meetingDoneDate = e.target.value; })}
                          className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* MINUTES OF MEETING FILE UPLOAD */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase">Minutes of Meeting File</label>
                    
                    {!project.prospect.minutesOfMeetingFileName ? (
                      <div
                        id="minutes-drop-area"
                        onDragOver={handleMinutesDragOver}
                        onDrop={handleMinutesDrop}
                        onClick={() => document.getElementById('minutes-file-picker')?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/10 rounded-xl p-4 text-center cursor-pointer transition-all space-y-2 group"
                      >
                        <input
                          type="file"
                          id="minutes-file-picker"
                          className="hidden"
                          onChange={handleMinutesFileChange}
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg cursor-pointer"
                        />
                        <div className="flex justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                          <FileText size={28} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-750">
                            Drag & drop or <span className="text-emerald-600 underline">choose file</span> to upload
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Accepts PDF, DOCX, TXT, or images (Max 1MB)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <FileText size={18} />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate" title={project.prospect.minutesOfMeetingFileName}>
                              {project.prospect.minutesOfMeetingFileName}
                            </p>
                            <p className="text-[9px] text-slate-400">
                              Uploaded by <span className="font-semibold text-emerald-750">{project.prospect.minutesOfMeetingUploadedBy || 'Active Colleague'}</span>
                              {project.prospect.minutesOfMeetingUploadedAt && (
                                <span className="text-[8px] text-slate-400 block sm:inline sm:ml-1.5 font-mono">
                                  on {new Date(project.prospect.minutesOfMeetingUploadedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {showClearMOMConfirm ? (
                            <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg p-1 animate-in fade-in zoom-in-95 duration-200">
                              <span className="text-[10px] font-bold text-red-700 px-1">Are you sure?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateProject(draft => {
                                    draft.prospect.minutesOfMeetingFileName = undefined;
                                    draft.prospect.minutesOfMeetingFileData = undefined;
                                    draft.prospect.minutesOfMeetingUploadedBy = undefined;
                                  });
                                  setShowClearMOMConfirm(false);
                                }}
                                className="px-2 py-0.5 text-[9px] font-black text-white bg-red-600 hover:bg-red-700 rounded transition-all shadow-xs"
                              >
                                Yes, Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowClearMOMConfirm(false)}
                                className="px-2 py-0.5 text-[9px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              {project.prospect.minutesOfMeetingFileData && (
                                <a
                                  href={project.prospect.minutesOfMeetingFileData}
                                  download={project.prospect.minutesOfMeetingFileName}
                                  className="px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
                                >
                                  Download
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => setShowClearMOMConfirm(true)}
                                className="p-1 px-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-700 border-b border-slate-200/60 pb-2">
                  Prospect Status Evaluation
                </h4>
                
                <p className="text-xs text-slate-500 my-3">
                  Check whether this prospective project meets editorial guidelines and publishing scope criteria to proceed.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => updateProject(draft => { draft.prospect.status = ProspectStatus.PENDING; })}
                    className={`py-3 px-4 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all ${
                      project.prospect.status === ProspectStatus.PENDING
                        ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-300/10'
                        : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ● Pending Review
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProject(draft => { draft.prospect.status = ProspectStatus.PROCEED; })}
                    className={`py-3 px-4 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all ${
                      project.prospect.status === ProspectStatus.PROCEED
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Proceed with Project
                  </button>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-150/80 text-[11px] text-slate-500 mt-4 leading-relaxed">
                {project.prospect.status === ProspectStatus.PROCEED ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Project is set to PROCEED. You may safely initiate requirement gathering and concept propositions.
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    Status is currently PENDING. Coordinate initial visit to unlock production briefs.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 3: REQUIREMENT BRIEF */}
        {/* ======================================= */}
        {viewingPhaseIndex === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 block mb-1">BRIEF SESSION RECORD DATE</label>
                <input
                  type="date"
                  value={project.requirementBrief.briefDate}
                  onChange={(e) => updateProject(draft => { draft.requirementBrief.briefDate = e.target.value; })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 block mb-1">BOOK GENRE CATEGORY</label>
                <select
                  value={project.requirementBrief.bookGenre}
                  onChange={(e) => updateProject(draft => { draft.requirementBrief.bookGenre = e.target.value; })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer text-slate-800 font-semibold"
                >
                  <option value="Historical Fiction">Historical Fiction</option>
                  <option value="Biography / Memoir">Biography / Memoir</option>
                  <option value="Technical / Programming">Technical / Programming</option>
                  <option value="Photography / Landscape Art">Photography / Landscape Photography</option>
                  <option value="Business / Leadership">Business / Leadership</option>
                  <option value="Poetry Anthologies">Poetry Anthologies</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 block mb-1">TARGET AUDIENCE INDEX</label>
                <input
                  type="text"
                  value={project.requirementBrief.targetAudience}
                  onChange={(e) => updateProject(draft => { draft.requirementBrief.targetAudience = e.target.value; })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="e.g. Young adult readers, Tech professionals"
                />
              </div>
            </div>

            {/* HISTORICAL CLIENT BRIEF LOGS Chronological Timeline */}
            <div className="space-y-4 pt-2 border-t border-slate-200/40">
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-slate-500" />
                  Historical Client Brief Log ({project.requirementBrief.logs?.length || 0})
                </h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Read and contribute detailed specification notes below. Every team member can participate.
                </p>
              </div>

              {/* Timeline of Logs */}
              <div className="space-y-3">
                {(!project.requirementBrief.logs || project.requirementBrief.logs.length === 0) ? (
                  <div className="p-4 bg-slate-50/60 border border-slate-200/50 rounded-xl text-center">
                    <p className="text-xs text-slate-400 italic">No custom brief entries recorded yet.</p>
                    {project.requirementBrief.briefNotes && (
                      <div className="mt-2.5 p-3 bg-white border border-slate-200/80 rounded-lg text-left max-w-lg mx-auto">
                        <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider">Initial Seeded Brief:</span>
                        <p className="text-xs text-slate-600 mt-1 font-sans font-medium whitespace-pre-wrap">{project.requirementBrief.briefNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 pl-4 ml-2.5 py-1 space-y-4">
                    {[...project.requirementBrief.logs]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log) => {
                        const initials = (log.authorName || 'Staff').charAt(0).toUpperCase();
                      return (
                        <div key={log.id} className="relative group animate-in fade-in slide-in-from-left-2 duration-200">
                          {/* Bullet node */}
                          <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
                          
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs hover:border-slate-350 transition-colors">
                            <div className="flex items-start justify-between mb-1.5 gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-slate-900 border border-slate-250 text-white text-[9px] font-black flex items-center justify-center uppercase shrink-0">
                                  {initials}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="text-[11px] font-black text-slate-755 leading-none">{log.authorName}</span>
                                  {log.authorUsername && (
                                    <span className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase font-mono tracking-wider leading-none">
                                      @{log.authorUsername}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>
                                    {new Date(log.timestamp).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {userProfile?.role === 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm("Are you sure you want to permanently delete this requirement log?")) {
                                        updateProject((draft) => {
                                          draft.requirementBrief.logs = (draft.requirementBrief.logs || []).filter(item => item.id !== log.id);
                                        });
                                      }
                                    }}
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-all cursor-pointer"
                                    title="Delete this history brief log"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-705 leading-relaxed font-sans whitespace-pre-wrap font-medium select-text text-left">
                              {log.notes}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add brief log tool */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                    Contribute Received Client Brief Notes
                  </label>
                </div>
                
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={newBriefLog}
                    onChange={(e) => setNewBriefLog(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-450 outline-none transition-colors"
                    placeholder="Write key guidelines, book requirements, page layouts or cover constraints here... Each author briefing session is tracked in this cumulative registry."
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] text-slate-400 font-sans">
                      Logging as <strong className="text-slate-600">{userProfile?.displayName || userProfile?.username || 'Active Colleague'}</strong>
                    </div>
                    
                    <button
                      type="button"
                      disabled={!newBriefLog.trim()}
                      onClick={() => {
                        if (!newBriefLog.trim()) return;
                        updateProject((draft) => {
                          if (!draft.requirementBrief.logs) {
                            draft.requirementBrief.logs = [];
                          }
                          const freshLog = {
                            id: 'brief-' + Date.now(),
                            notes: newBriefLog.trim(),
                            timestamp: new Date().toISOString(),
                            authorName: userProfile?.displayName || userProfile?.username || 'Active Colleague',
                            authorUsername: userProfile?.username || 'unknown'
                          };
                          draft.requirementBrief.logs.push(freshLog);
                          
                          // Sync consolidated briefNotes if they're empty or prepend nicely
                          if (!draft.requirementBrief.briefNotes || draft.requirementBrief.briefNotes.startsWith("Initial requirement log")) {
                            draft.requirementBrief.briefNotes = freshLog.notes;
                          } else {
                            // Prepend nicely to main summary
                            draft.requirementBrief.briefNotes = `${freshLog.notes}\n\n---\n${draft.requirementBrief.briefNotes}`;
                          }
                        });
                        setNewBriefLog('');
                      }}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer ${
                        newBriefLog.trim()
                          ? 'bg-slate-900 border border-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-200 border border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={12} />
                      Add Brief Log Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BRIEF DOCUMENTS UPLOAD */}
            <div className="space-y-2 border-t border-slate-200/60 pt-4">
              <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Requirement Brief Documents
              </label>

              {/* Upload Drop Zone */}
              <div
                id="brief-doc-drop-area"
                onDragOver={handleBriefDragOver}
                onDrop={handleBriefDrop}
                onClick={() => document.getElementById('brief-doc-picker')?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/10 rounded-xl p-4 text-center cursor-pointer transition-all space-y-2 group"
              >
                <input
                  type="file"
                  id="brief-doc-picker"
                  className="hidden"
                  onChange={handleBriefFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xls,.xlsx cursor-pointer"
                />
                <div className="flex justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <FileText size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-750">
                    Drag & drop or <span className="text-emerald-600 underline">choose file(s)</span> to upload
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Accepts PDF, DOCX, XLSX, TXT, or images (Each Max 1MB)
                  </p>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {project.requirementBrief.documents && project.requirementBrief.documents.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {project.requirementBrief.documents.map((doc, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 font-bold shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-850 truncate" title={doc.name}>
                            {doc.name}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {doc.uploadedBy ? (
                              <span>
                                By <span className="font-semibold text-emerald-700">{doc.uploadedBy}</span>
                                {doc.uploadedAt && (
                                  <span className="text-[8px] font-mono ml-1 font-normal block sm:inline">
                                    on {new Date(doc.uploadedAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </span>
                            ) : (
                              "Seeded Document"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {confirmDeleteBriefDocIndex === idx ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg p-1 animate-in fade-in zoom-in-95 duration-150">
                            <span className="text-[9px] font-bold text-red-700 px-1">Are you sure?</span>
                            <button
                              type="button"
                              onClick={() => {
                                updateProject(draft => {
                                  if (draft.requirementBrief.documents) {
                                    draft.requirementBrief.documents.splice(idx, 1);
                                  }
                                });
                                setConfirmDeleteBriefDocIndex(null);
                              }}
                              className="px-2 py-0.5 text-[8px] font-black text-white bg-red-600 hover:bg-red-700 rounded transition-all shadow-xs shrink-0 cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteBriefDocIndex(null)}
                              className="px-2 py-0.5 text-[8px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-all shrink-0 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            {doc.data && (
                              <a
                                href={doc.data}
                                download={doc.name}
                                className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
                              >
                                Download
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteBriefDocIndex(idx)}
                              className="p-1 px-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                              title="Delete requirement brief file"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="text-amber-600 mt-0.5 shrink-0" size={16} />
              <div>
                <strong>Rene Turos Creative Suggestion:</strong> For <em>{project.requirementBrief.bookGenre}</em> books targeting <em>{project.requirementBrief.targetAudience || 'mass markets'}</em>, we highly recommend focusing on detailed chapter headers and considering a 120gsm matte text stock paper rather than basic cream pulp to elevate overall typography readability.
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 4: CREATIVE BRIEF */}
        {/* ======================================= */}
        {viewingPhaseIndex === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">PROPOSED BOOK TITLE</label>
                <input
                  type="text"
                  value={project.creativeBrief.proposedBookTitle}
                  onChange={(e) => updateProject(draft => { draft.creativeBrief.proposedBookTitle = e.target.value; })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  placeholder="Provide proposed or working title..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">PROPOSED GENERAL DESIGN STYLE</label>
                <select
                  value={project.creativeBrief.proposedDesignStyle}
                  onChange={(e) => updateProject(draft => { draft.creativeBrief.proposedDesignStyle = e.target.value; })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="Traditional Editorial, Warm & Organic">Traditional Editorial (Warm & Organic)</option>
                  <option value="Technical Mono, Sharp & High-Contrast">Technical Mono (Fira Code/Monochrome)</option>
                  <option value="Minimalist Editorial Visual, Ultra Luxury">Minimalist Fine Art (High Space Margins)</option>
                  <option value="Modern Swiss, Bold Display Grid">Modern Swiss Typography (Aesthetic Sans)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">PROPOSED CREATIVE CONCEPT & MOODBOARD DETAILS</label>
              <textarea
                rows={3}
                value={project.creativeBrief.creativeConcept}
                onChange={(e) => updateProject(draft => { draft.creativeBrief.creativeConcept = e.target.value; })}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none"
                placeholder="Outline typographic systems, decorative motifs, vector art guides, back cover tone guidelines..."
              />
            </div>

            {/* CREATIVE CONCEPT DOCUMENTS UPLOAD */}
            <div className="space-y-2 border-t border-slate-200/60 pt-4">
              <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Creative Concept Document(s)
              </label>

              {/* Upload Drop Zone */}
              <div
                id="concept-doc-drop-area"
                onDragOver={handleConceptDragOver}
                onDrop={handleConceptDrop}
                onClick={() => document.getElementById('concept-doc-picker')?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/10 rounded-xl p-4 text-center cursor-pointer transition-all space-y-2 group"
              >
                <input
                  type="file"
                  id="concept-doc-picker"
                  className="hidden"
                  onChange={handleConceptFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xls,.xlsx cursor-pointer"
                />
                <div className="flex justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <FileText size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-755">
                    Drag & drop or <span className="text-emerald-600 underline">choose file(s)</span> to upload
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Accepts PDF, DOCX, XLSX, TXT, or images (Each Max 1MB)
                  </p>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {project.creativeBrief.creativeConceptDocuments && project.creativeBrief.creativeConceptDocuments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {project.creativeBrief.creativeConceptDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 font-bold shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-850 truncate" title={doc.name}>
                            {doc.name}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {doc.uploadedBy ? (
                              <span>
                                By <span className="font-semibold text-emerald-700">{doc.uploadedBy}</span>
                                {doc.uploadedAt && (
                                  <span className="text-[8px] font-mono ml-1 font-normal block sm:inline">
                                    on {new Date(doc.uploadedAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                )}
                              </span>
                            ) : (
                              "Seeded Document"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {confirmDeleteConceptDocIndex === idx ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg p-1 animate-in fade-in zoom-in-95 duration-150">
                            <span className="text-[9px] font-bold text-red-700 px-1">Are you sure?</span>
                            <button
                              type="button"
                              onClick={() => {
                                updateProject(draft => {
                                  if (draft.creativeBrief.creativeConceptDocuments) {
                                    draft.creativeBrief.creativeConceptDocuments.splice(idx, 1);
                                  }
                                });
                                setConfirmDeleteConceptDocIndex(null);
                              }}
                              className="px-2 py-0.5 text-[8px] font-black text-white bg-red-600 hover:bg-red-700 rounded transition-all shadow-xs shrink-0 cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteConceptDocIndex(null)}
                              className="px-2 py-0.5 text-[8px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-all shrink-0 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            {doc.data && (
                              <a
                                href={doc.data}
                                download={doc.name}
                                className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
                              >
                                Download
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteConceptDocIndex(idx)}
                              className="p-1 px-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                              title="Delete creative concept file"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Feedback Board */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Client Feedback Loop</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-400">Feedback Status:</span>
                  <select
                    value={project.creativeBrief.feedbackStatus}
                    onChange={(e) => updateProject(draft => { 
                      draft.creativeBrief.feedbackStatus = e.target.value as FeedbackStatus;
                      draft.creativeBrief.feedbackDate = new Date().toISOString().split('T')[0];
                    })}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                      project.creativeBrief.feedbackStatus === FeedbackStatus.APPROVED 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : project.creativeBrief.feedbackStatus === FeedbackStatus.REJECTED
                        ? 'bg-red-100 text-red-850 border-red-350'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value={FeedbackStatus.PENDING}>● Pending Feedback</option>
                    <option value={FeedbackStatus.APPROVED}>✓ Approved by Client</option>
                    <option value={FeedbackStatus.REJECTED}>✗ Modification Requested</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Last Loop Event Time</span>
                  <span className="text-xs font-bold text-slate-600 block mt-0.5">
                    {formatDate(project.creativeBrief.feedbackDate) || 'No feedback log yet'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic">Automatically recorded upon status modifications</p>
              </div>

              {/* Collaborative Client Feedback Timeline Logs */}
              <div className="space-y-4 pt-3 border-t border-slate-200/50">
                <div>
                  <h5 className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers size={13} className="text-indigo-500" />
                    Collaborative Client Feedback History ({project.creativeBrief.feedbackLogs?.length || 0})
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                    Read and contribute team-synchronous feedback details below. Every team member can participate.
                  </p>
                </div>

                {/* Timeline rendering */}
                <div className="space-y-3">
                  {(!project.creativeBrief.feedbackLogs || project.creativeBrief.feedbackLogs.length === 0) ? (
                    <div className="p-4 bg-white/60 border border-slate-150 rounded-xl text-center">
                      <p className="text-xs text-slate-400 italic">No feedback entries recorded yet.</p>
                      {project.creativeBrief.clientFeedbackNotes && (
                        <div className="mt-2.5 p-3 bg-white border border-slate-200 rounded-lg text-left max-w-lg mx-auto">
                          <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Initial Seeded Feedback Summary:</span>
                          <p className="text-xs text-slate-600 mt-1 font-sans font-medium whitespace-pre-wrap">{project.creativeBrief.clientFeedbackNotes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-250 pl-4 ml-2.5 py-1 space-y-4">
                      {[...project.creativeBrief.feedbackLogs]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((log) => {
                          const initials = (log.authorName || 'Staff').charAt(0).toUpperCase();
                        return (
                          <div key={log.id} className="relative group animate-in fade-in slide-in-from-left-2 duration-200">
                            {/* Blue bullet node */}
                            <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-100" />
                            
                            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
                              <div className="flex items-start justify-between mb-1.5 gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded bg-slate-900 border border-slate-250 text-white text-[9px] font-black flex items-center justify-center uppercase shrink-0">
                                    {initials}
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[11px] font-black text-slate-755 leading-none">{log.authorName}</span>
                                    {log.authorUsername && (
                                      <span className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase font-mono tracking-wider leading-none">
                                        @{log.authorUsername}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-400">
                                  <div className="flex items-center gap-1">
                                    <Clock size={10} />
                                    <span>
                                      {new Date(log.timestamp).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  {userProfile?.role === 'admin' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm("Are you sure you want to permanently delete this client feedback log?")) {
                                          updateProject((draft) => {
                                            draft.creativeBrief.feedbackLogs = (draft.creativeBrief.feedbackLogs || []).filter(item => item.id !== log.id);
                                          });
                                        }
                                      }}
                                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-all cursor-pointer"
                                      title="Delete this history feedback log"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-705 leading-relaxed font-sans whitespace-pre-wrap font-medium select-text text-left">
                                {log.notes}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Input form for feedback loop */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-sans">
                      Add Client Feedback / Review Notes
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <textarea
                      rows={2.5}
                      value={newFeedbackLog}
                      onChange={(e) => setNewFeedbackLog(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors"
                      placeholder="e.g. Discussed with client. Recommended a few modifications under chapter outlines. Will proceed to pricing bundle step..."
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] text-slate-400 font-sans">
                        Logging as <strong className="text-slate-650">{userProfile?.displayName || userProfile?.username || 'Active Colleague'}</strong>
                      </div>
                      
                      <button
                        type="button"
                        disabled={!newFeedbackLog.trim()}
                        onClick={() => {
                          if (!newFeedbackLog.trim()) return;
                          updateProject((draft) => {
                            if (!draft.creativeBrief.feedbackLogs) {
                              draft.creativeBrief.feedbackLogs = [];
                            }
                            const freshLog = {
                              id: 'feedback-' + Date.now(),
                              notes: newFeedbackLog.trim(),
                              timestamp: new Date().toISOString(),
                              authorName: userProfile?.displayName || userProfile?.username || 'Active Colleague',
                              authorUsername: userProfile?.username || 'unknown'
                            };
                            draft.creativeBrief.feedbackLogs.push(freshLog);
                            
                            // Prepend nicely to main summary text if appropriate
                            if (!draft.creativeBrief.clientFeedbackNotes || draft.creativeBrief.clientFeedbackNotes === '') {
                              draft.creativeBrief.clientFeedbackNotes = freshLog.notes;
                            } else {
                              draft.creativeBrief.clientFeedbackNotes = `${freshLog.notes}\n\n---\n${draft.creativeBrief.clientFeedbackNotes}`;
                            }
                          });
                          setNewFeedbackLog('');
                        }}
                        className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer ${
                          newFeedbackLog.trim()
                            ? 'bg-indigo-600 border border-indigo-600 text-white hover:bg-indigo-550'
                            : 'bg-slate-200 border border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus size={12} />
                        Add Feedback Entry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 5: PROPOSAL */}
        {/* ======================================= */}
        {viewingPhaseIndex === 4 && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-700">Rene Turos Publishing Service Bundle Costing</h4>
                <p className="text-xs text-slate-400 mt-0.5">Check service layers to compute the official project proposal value.</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 mr-2">Sent Date:</span>
                <input
                  type="date"
                  value={project.proposal.dateSent}
                  onChange={(e) => updateProject(draft => { draft.proposal.dateSent = e.target.value; })}
                  className="text-xs border rounded-md px-2 py-1 text-slate-700 bg-slate-50"
                />
              </div>
            </div>

            {/* Services Checklist Grid */}
            <div className="space-y-2">
              {project.proposal.offerings.map((offering, idx) => (
                <div 
                  key={offering.id}
                  onClick={() => {
                    updateProject(draft => {
                      draft.proposal.offerings[idx].selected = !draft.proposal.offerings[idx].selected;
                    });
                  }}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    offering.selected 
                      ? 'border-slate-800 bg-slate-50/50' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                    offering.selected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-350 bg-white'
                  }`}>
                    {offering.selected && <Check size={11} strokeWidth={3} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-extrabold ${offering.selected ? 'text-slate-900' : 'text-slate-700'}`}>
                        {offering.serviceName}
                      </span>
                      
                      {/* Price tag editable in-line */}
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <span className="text-xs text-slate-400">Rp</span>
                        <input
                          type="number"
                          value={offering.cost}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateProject(draft => {
                              draft.proposal.offerings[idx].cost = val;
                            });
                          }}
                          className="w-28 text-right bg-white border border-slate-200 rounded-sm py-0.5 px-1 text-xs font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">{offering.description}</p>
                  </div>

                  {/* Option to delete service */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateProject(draft => {
                        draft.proposal.offerings = draft.proposal.offerings.filter(o => o.id !== offering.id);
                      });
                    }}
                    className="p-1 text-slate-350 hover:text-red-500 hover:bg-slate-100 rounded shrink-0 transition-colors"
                    title="Remove Service"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Insert Service offering form */}
            <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 space-y-3">
              <span className="text-[10px] font-extrabold text-slate-500 tracking-wider block uppercase">＋ Append Custom Service Charge</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Service Name e.g. Special Leather Bound"
                  value={newServiceTitle}
                  onChange={e => setNewServiceTitle(e.target.value)}
                  className="text-xs bg-white border rounded px-2 py-1.5"
                />
                <input
                  type="text"
                  placeholder="Service Description details..."
                  value={newServiceDesc}
                  onChange={e => setNewServiceDesc(e.target.value)}
                  className="text-xs bg-white border rounded px-2 py-1.5"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Cost (Rp)"
                    value={newServiceCost}
                    onChange={e => setNewServiceCost(e.target.value)}
                    className="text-xs bg-white border rounded px-2 py-1.5 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newServiceTitle.trim()) return alert('Please enter offering title');
                      const amt = parseFloat(newServiceCost) || 0;
                      updateProject(draft => {
                        draft.proposal.offerings.push({
                          id: 'srv-custom-' + Date.now(),
                          serviceName: newServiceTitle,
                          description: newServiceDesc || 'Custom added publisher specification.',
                          cost: amt,
                          selected: true
                        });
                      });
                      setNewServiceTitle('');
                      setNewServiceDesc('');
                      setNewServiceCost('');
                    }}
                    className="bg-slate-900 text-white font-bold text-xs px-3 rounded hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Budget totals and draft Status picker */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-widest block uppercase">ESTIMATED PROPOSAL ACCUMULATION</span>
                <span className="text-3xl font-display font-black text-white flex items-center">
                  <span className="text-xl font-extrabold text-emerald-400 mr-2.5 select-none font-sans leading-none pb-0.5">Rp</span>
                  {proposalSum.toLocaleString('id-ID')}
                  <span className="text-xs text-slate-400 font-normal ml-2">IDR Total Value</span>
                </span>
                <p className="text-[10px] text-slate-400 italic">Adjust selections in list above to recalculate live invoice total.</p>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase">PROPOSAL STATUS:</span>
                <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700/80">
                  {([ProposalStatus.DRAFT, ProposalStatus.SENT, ProposalStatus.APPROVED, ProposalStatus.DECLINED] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateProject(draft => { 
                        draft.proposal.status = p; 
                        // Synchronize closing sum automatically if approved
                        if (p === ProposalStatus.APPROVED) {
                          draft.closing.finalAmount = proposalSum;
                        }
                      })}
                      className={`px-3 py-1 rounded text-[11px] font-bold ${
                        project.proposal.status === p
                          ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 6: CLOSING */}
        {/* ======================================= */}
        {viewingPhaseIndex === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Info and Interactive sign status */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Finalized Project Budget Negotiated</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    value={project.closing.finalAmount}
                    onChange={(e) => updateProject(draft => { draft.closing.finalAmount = parseFloat(e.target.value) || 0; })}
                    className="w-full text-base font-bold bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-1.5 text-slate-800"
                    placeholder="Final contractual amount"
                  />
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-extrabold text-slate-400 block mb-1">CONTRACT DRAFT & SIGNATURE SPECIFICATIONS</label>
                  <textarea
                    rows={4}
                    value={project.closing.contractDraftText}
                    onChange={(e) => updateProject(draft => { draft.closing.contractDraftText = e.target.value; })}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 resize-none"
                    placeholder="Incorporate main boilerplate text, payment terms, delivery targets..."
                  />
                </div>
              </div>

              {/* Contracting block */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase">Authorized Representative Sign-off</span>
                
                {project.closing.contractStatus === ContractStatus.SIGNED ? (
                  <div className="flex items-center gap-3 bg-emerald-100 border border-emerald-300 rounded-xl p-3.5 text-emerald-800">
                    <ShieldCheck size={28} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold block">CONTRACT SIGNED & LOCKED</span>
                      <span className="text-[10px] block mt-0.5 font-mono text-emerald-700">
                        Witnessed by {project.closing.signingRepresentative || 'Arthur Green'} on {formatDate(project.closing.signedDate || '2026-05-22')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="text-xs w-full bg-white border rounded px-3 py-2"
                      placeholder="Type Representative Name (e.g. Arthur Green)"
                      value={newTimelineOwner}
                      onChange={e => setNewTimelineOwner(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newTimelineOwner.trim()) return alert('Please enter signing representative name first');
                        updateProject(draft => {
                          draft.closing.contractStatus = ContractStatus.SIGNED;
                          draft.closing.signingRepresentative = newTimelineOwner;
                          draft.closing.signedDate = new Date().toISOString().split('T')[0];
                          // Proactively suggest chapters outline if empty
                          if (draft.preProduction.outlineChapters.length === 0) {
                            draft.preProduction.outlineChapters = [
                              'Chapter 1: Introduction and Scope',
                              'Chapter 2: Essential Context',
                              'Chapter 3: Core Methodology',
                              'Chapter 4: Crucial Observations',
                              'Chapter 5: Closing Summaries'
                            ];
                          }
                        });
                        setNewTimelineOwner('');
                      }}
                      className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2 px-4 rounded w-full flex items-center justify-center gap-1 transition-colors"
                    >
                      <PenTool size={13} />
                      Execute Electro-Signature
                    </button>
                  </div>
                )}

                <div className="flex bg-white p-1 rounded border border-slate-250 justify-between items-center text-[10px] text-slate-500">
                  <span className="font-semibold px-2">Contract Status Flow:</span>
                  <div className="flex gap-1.5">
                    {([ContractStatus.DRAFT, ContractStatus.SENT, ContractStatus.SIGNED] as const).map(c => (
                      <span 
                        key={c}
                        onClick={() => updateProject(draft => { draft.closing.contractStatus = c; })}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          project.closing.contractStatus === c 
                            ? 'bg-slate-900 text-white font-bold' 
                            : 'text-slate-400'
                        }`}
                      >
                        {c.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Print Contract Layout mockup paper */}
            <div id="contract-paper-draft" className="bg-amber-50/20 border-2 border-dashed border-amber-800/10 rounded-2xl p-6 relative shadow-inner overflow-hidden min-h-[350px] flex flex-col justify-between">
              {/* Gold seal */}
              {project.closing.contractStatus === ContractStatus.SIGNED && (
                <div className="absolute right-4 top-4 w-12 h-12 rounded-full border-4 border-double border-amber-600 flex items-center justify-center bg-amber-500 text-amber-950 font-black text-[9px] rotate-[15deg] select-none shadow-md">
                  SEALED
                </div>
              )}

              <div className="space-y-3">
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">OFFICIAL RECIPIENT PRINT COPY</span>
                <span className="text-base font-display font-extrabold text-slate-800 block border-b border-slate-200 pb-1.5">
                  Publishing Agreement Draft
                </span>

                <div className="text-[11px] text-slate-600 space-y-2 font-serif leading-relaxed max-h-[220px] overflow-y-auto pr-1">
                  <p>
                    <strong>PARTIES:</strong> This binding contract is entered into on this day between <strong>Rene Turos Editorial Group</strong> and the client representative <strong>{project.clientContact.name || '(N/A)'}</strong>.
                  </p>
                  <p>
                    <strong>CONSIDERATION:</strong> Publisher shall furnish full structural formatting, bespoke dust jacket designs, ISBN records, and premium printed books.
                  </p>
                  <p>
                    <strong>FEE STRUCTURE:</strong> Client agrees to pay the final locked net amount of <strong>Rp {(project.closing.finalAmount || 0).toLocaleString('id-ID')} IDR</strong>, according to agreed installment targets.
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    The electronic signature certifies absolute confirmation of timelines outlined under Pre-Production guidelines.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 mt-4 text-[10px] text-slate-500 flex justify-between">
                <div>
                  <span className="block font-bold">Rene Turos Director</span>
                  <span className="block text-[9px] italic text-slate-400">Evelyn Mercer</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold">Client Cosignee</span>
                  <span className="block text-[9px] italic text-slate-400">
                    {project.closing.contractStatus === ContractStatus.SIGNED 
                      ? project.closing.signingRepresentative 
                      : 'Pending Signature'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 7: PRE-PRODUCTION */}
        {/* ======================================= */}
        {viewingPhaseIndex === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 7.1: Outline Chapters List */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3 col-span-1">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-250 pb-1.5 flex items-center justify-between">
                <span>Book Outline Details</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                  {project.preProduction.outlineChapters.length} Chapters
                </span>
              </h4>

              {/* Chapters list */}
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {project.preProduction.outlineChapters.map((ch, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-1 bg-white p-2 border rounded-lg text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {ch}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateProject(draft => {
                        draft.preProduction.outlineChapters = draft.preProduction.outlineChapters.filter((_, i) => i !== idx);
                      })}
                      className="text-slate-300 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {project.preProduction.outlineChapters.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic text-center py-4">No chapters added. Formulate outline below!</p>
                )}
              </div>

              {/* Add Chapter Form */}
              <div className="flex gap-1.5 pt-1.5">
                <input
                  type="text"
                  placeholder="Chapter Title"
                  value={newChapterTitle}
                  onChange={e => setNewChapterTitle(e.target.value)}
                  className="bg-white border rounded text-xs px-2.5 py-1.5 flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newChapterTitle.trim()) return;
                    updateProject(draft => {
                      draft.preProduction.outlineChapters.push(newChapterTitle.trim());
                      // Initialize chapter progress inside Production automatically so metrics sync beautifully
                      const nextChNum = draft.production.chapters.length + 1;
                      draft.production.chapters.push({
                        chapterNumber: nextChNum,
                        chapterTitle: newChapterTitle.trim(),
                        writingStatus: ProductionChapterStatus.TODO,
                        layoutStatus: ProductionChapterStatus.TODO,
                        wordCount: 0
                      });
                    });
                    setNewChapterTitle('');
                  }}
                  className="bg-slate-900 text-white font-bold text-xs px-2.5 rounded hover:bg-slate-850 shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Step 7.2: Custom team assignment */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3 col-span-1">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-250 pb-1.5">
                Team Role Assignment
              </h4>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {project.preProduction.teamAssignments.map((assignment, idx) => (
                  <div key={idx} className="bg-white p-2 border rounded-lg flex flex-col gap-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase leading-none">{assignment.role}</span>
                    <input
                      type="text"
                      value={assignment.employeeName}
                      onChange={(e) => updateProject(draft => {
                        draft.preProduction.teamAssignments[idx].employeeName = e.target.value;
                      })}
                      className="text-xs font-semibold text-slate-700 bg-transparent py-0.5"
                      placeholder="Assign Staff Name"
                    />
                  </div>
                ))}
              </div>

              {/* Add Custom assignment form */}
              <div className="space-y-1.5 pt-1.5">
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="Custom Role"
                    value={newTeamRole}
                    onChange={e => setNewTeamRole(e.target.value)}
                    className="text-xs bg-white border rounded px-2 py-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Staff Member"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    className="text-xs bg-white border rounded px-2 py-1.5"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newTeamRole.trim() || !newTeamName.trim()) return alert('Fill in both role and staff name');
                    updateProject(draft => {
                      draft.preProduction.teamAssignments.push({
                        role: newTeamRole.trim(),
                        employeeName: newTeamName.trim()
                      });
                    });
                    setNewTeamRole('');
                    setNewTeamName('');
                  }}
                  className="bg-slate-900 text-white font-bold text-xs py-1.5 w-full rounded hover:bg-slate-850"
                >
                  ＋ Append Team Role
                </button>
              </div>
            </div>

            {/* Step 7.3: Chronological timeline */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3 col-span-1">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-250 pb-1.5">
                Milestones & Timeline Checklist
              </h4>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {project.preProduction.timeline.map((task, idx) => (
                  <div key={task.id} className="bg-white p-2.5 border rounded-lg space-y-1 shadow-2xs">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-xs font-semibold text-slate-700 leading-tight">
                        {task.taskName}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateProject(draft => {
                          draft.preProduction.timeline = draft.preProduction.timeline.filter(t => t.id !== task.id);
                        })}
                        className="text-slate-350 hover:text-red-500 scale-92"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>PIC: {task.personInCharge}</span>
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>

                    <div className="flex bg-slate-50 p-1 rounded justify-between items-center text-[10px] pt-1">
                      <span className="font-semibold text-slate-400">Status:</span>
                      <div className="flex gap-1.5">
                        {([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED] as const).map(state => (
                          <span
                            key={state}
                            onClick={() => updateProject(draft => {
                              draft.preProduction.timeline[idx].status = state;
                            })}
                            className={`px-1 py-0.2 rounded hover:bg-slate-200 cursor-pointer ${
                              task.status === state 
                                ? 'bg-amber-100 font-extrabold text-amber-800' 
                                : 'text-slate-400'
                            }`}
                          >
                            {state === 'in-progress' ? 'ING' : state.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add task form */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50 mt-1.5">
                <input
                  type="text"
                  placeholder="Task description e.g. Finalize Proofing"
                  value={newTimelineTask}
                  onChange={e => setNewTimelineTask(e.target.value)}
                  className="text-xs w-full bg-white border rounded px-2.5 py-1.5"
                />
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="PIC e.g. Sites"
                    value={newTimelineOwner}
                    onChange={e => setNewTimelineOwner(e.target.value)}
                    className="text-xs bg-white border rounded px-2 py-1.5"
                  />
                  <input
                    type="date"
                    value={newTimelineDate}
                    onChange={e => setNewTimelineDate(e.target.value)}
                    className="text-xs bg-white border rounded px-2 py-1.5 text-slate-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newTimelineTask.trim()) return alert('Please input task details');
                    updateProject(draft => {
                      draft.preProduction.timeline.push({
                        id: 'task-' + Date.now(),
                        taskName: newTimelineTask.trim(),
                        personInCharge: newTimelineOwner || 'Carlos Ruiz',
                        dueDate: newTimelineDate || '2026-05-30',
                        status: TaskStatus.TODO
                      });
                    });
                    setNewTimelineTask('');
                    setNewTimelineOwner('');
                    setNewTimelineDate('');
                  }}
                  className="bg-slate-900 text-white font-bold text-xs py-1.5 w-full rounded hover:bg-slate-850"
                >
                  ＋ Schedule Milestone
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 8: PRODUCTION */}
        {/* ======================================= */}
        {viewingPhaseIndex === 7 && (
          <div className="space-y-6">
            
            {/* Quick stats and word counts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              
              {/* Dynamic Writing & Layout status grids per chapter */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-700 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Granular Chapter Iterations Tracker</span>
                  <span className="text-xs font-semibold text-slate-400">Manage drafts separately</span>
                </h4>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {project.production.chapters.map((ch, idx) => (
                    <div key={idx} className="p-3 bg-white border rounded-xl gap-2 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between">
                      <div className="flex-1 min-w-[140px]">
                        <span className="text-[10px] font-extrabold text-slate-400 block tracking-wider uppercase font-mono">CHAPTER {ch.chapterNumber}</span>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">{ch.chapterTitle || `Unnamed Chapter`}</span>
                        
                        {/* Word Count Editor in-line */}
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                          <span>Word Count:</span>
                          <input
                            type="number"
                            value={ch.wordCount || 0}
                            onChange={(e) => {
                              const cnt = parseInt(e.target.value) || 0;
                              updateProject(draft => {
                                draft.production.chapters[idx].wordCount = cnt;
                              });
                            }}
                            className="bg-slate-50 border border-slate-200 rounded px-1 py-0.2 w-14 font-mono font-bold text-slate-650"
                          />
                        </div>
                      </div>

                      {/* Status select sliders */}
                      <div className="flex gap-2 items-stretch pt-2 sm:pt-0">
                        {/* Writing Status Dropdown */}
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] font-bold text-slate-400">WRITING DRAFT</label>
                          <select
                            value={ch.writingStatus}
                            onChange={(e) => updateProject(draft => {
                              draft.production.chapters[idx].writingStatus = e.target.value as ProductionChapterStatus;
                            })}
                            className="text-[10px] font-bold bg-slate-50 border rounded p-1"
                          >
                            <option value={ProductionChapterStatus.TODO}>Todo</option>
                            <option value={ProductionChapterStatus.IN_PROGRESS}>Writing</option>
                            <option value={ProductionChapterStatus.COMPLETED}>Completed</option>
                          </select>
                        </div>

                        {/* Layout status dropdown */}
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] font-bold text-slate-400 font-sans">TYPESETTING</label>
                          <select
                            value={ch.layoutStatus}
                            onChange={(e) => updateProject(draft => {
                              draft.production.chapters[idx].layoutStatus = e.target.value as ProductionChapterStatus;
                            })}
                            className="text-[10px] font-bold bg-slate-50 border rounded p-1"
                          >
                            <option value={ProductionChapterStatus.TODO}>Todo</option>
                            <option value={ProductionChapterStatus.IN_PROGRESS}>Editing</option>
                            <option value={ProductionChapterStatus.COMPLETED}>Completed</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  ))}

                  {project.production.chapters.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-400 italic">No chapters defined in outline.</p>
                      <button
                        type="button"
                        onClick={() => {
                          updateProject(draft => {
                            draft.preProduction.outlineChapters = ['Chapter 1: The New Horizon', 'Chapter 2: Crossing Roads'];
                            draft.production.chapters = [
                              { chapterNumber: 1, chapterTitle: 'The New Horizon', writingStatus: ProductionChapterStatus.TODO, layoutStatus: ProductionChapterStatus.TODO, wordCount: 0 },
                              { chapterNumber: 2, chapterTitle: 'Crossing Roads', writingStatus: ProductionChapterStatus.TODO, layoutStatus: ProductionChapterStatus.TODO, wordCount: 0 }
                            ];
                          });
                        }}
                        className="text-xs font-bold text-slate-800 underline block mt-2"
                      >
                        Auto-Initialize Outline Chapters Sample
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Endorsement quotes, general proofreading, ISBN */}
              <div className="space-y-4">
                
                {/* Proofreading general status */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2.5">
                  <span className="text-[10px] font-extrabold text-slate-550 block uppercase tracking-wider">Overall Proofreading Stage</span>
                  <div className="grid grid-cols-3 gap-2">
                    {([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED] as const).map((ps) => (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => updateProject(draft => { draft.production.proofreadingStatus = ps; })}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          project.production.proofreadingStatus === ps 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ps === 'in-progress' ? 'Proofing' : ps}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ISBN registration */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2.5">
                  <span className="text-[10px] font-extrabold text-slate-550 block uppercase tracking-wider">ISBN National Library Registration</span>
                  
                  <div className="flex gap-2">
                    <select
                      value={project.production.isbnStatus}
                      onChange={(e) => updateProject(draft => { 
                        draft.production.isbnStatus = e.target.value as ISBNStatus;
                        // Pre-add a generic format if it is issued
                        if (e.target.value === ISBNStatus.ISSUED && !draft.production.isbnNumber) {
                          draft.production.isbnNumber = '978-602-1234-56-7';
                        }
                      })}
                      className="text-xs font-bold bg-white border rounded-lg p-2 max-w-xs cursor-pointer"
                    >
                      <option value={ISBNStatus.NOT_REQUESTED}>Not Requested</option>
                      <option value={ISBNStatus.PENDING}>Pending Govt Registry</option>
                      <option value={ISBNStatus.ISSUED}>Issued / Official</option>
                    </select>

                    <input
                      type="text"
                      className="text-xs font-mono font-bold bg-white border rounded-lg px-3 py-2 flex-1"
                      placeholder="ISBN Number e.g. 978-X-XXXX"
                      value={project.production.isbnNumber || ''}
                      onChange={(e) => updateProject(draft => { draft.production.isbnNumber = e.target.value; })}
                      disabled={project.production.isbnStatus === ISBNStatus.NOT_REQUESTED}
                    />
                  </div>
                </div>

                {/* Print Dummy Book tracker */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-550 block uppercase tracking-wider">Print Dummy Book Testing</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block">DENSITY SENT DATE</label>
                      <input
                        type="date"
                        value={project.production.dummyBookSentDate}
                        onChange={(e) => updateProject(draft => { draft.production.dummyBookSentDate = e.target.value; })}
                        className="text-xs w-full bg-white border rounded p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block font-sans">CLIENT REVIEW RESPONSE</label>
                      <select
                        value={project.production.dummyBookStatus}
                        onChange={(e) => updateProject(draft => { draft.production.dummyBookStatus = e.target.value as DummyBookStatus; })}
                        className="text-xs w-full bg-white border rounded p-1.5 cursor-pointer font-bold"
                      >
                        <option value={DummyBookStatus.NONE}>Pending Send</option>
                        <option value={DummyBookStatus.PENDING}>Under Client Review</option>
                        <option value={DummyBookStatus.APPROVED}>Dummy Approved</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-400 block font-sans">REVISION REMARK LOG</label>
                    <input
                      type="text"
                      className="text-xs w-full bg-white border rounded p-1.5"
                      placeholder="e.g. Leather texture perfect. Font sizes aligned."
                      value={project.production.dummyBookFeedback || ''}
                      onChange={(e) => updateProject(draft => { draft.production.dummyBookFeedback = e.target.value; })}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Endorsement list & Dust jacket Cover Artwork */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Cover options artwork block */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1"><Layout size={15} /> Dust Jacket Cover Design</h4>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded capitalize ${
                    project.production.coverStatus === CoverStatus.APPROVED 
                      ? 'bg-emerald-150 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {project.production.coverStatus === CoverStatus.APPROVED ? 'Approved' : 'Concepts Proposed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {project.production.covers.map((cov, idx) => (
                    <div 
                      key={cov.id} 
                      onClick={() => updateProject(draft => {
                        // Deselect other covers
                        draft.production.covers.forEach((c, i) => c.selected = (i === idx));
                        draft.production.coverStatus = CoverStatus.APPROVED;
                      })}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        cov.selected ? 'border-amber-500 ring-2 ring-amber-400/25' : 'border-slate-200'
                      }`}
                    >
                      <img src={cov.imageUrl} referrerPolicy="no-referrer" className="w-full h-32 object-cover" alt={cov.conceptName} />
                      
                      <div className="p-2.5 bg-black/75 absolute bottom-0 left-0 right-0 text-white text-[10px]">
                        <span className="font-extrabold block truncate leading-tight">{cov.conceptName}</span>
                        <span className="text-[8px] opacity-80 block truncate leading-tight mt-0.5">{cov.description}</span>
                      </div>

                      {cov.selected && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-900 rounded-full p-1 shadow-sm">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Seed cover proposal if empty */}
                  {project.production.covers.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        updateProject(draft => {
                          draft.production.covers = [
                            { id: 'cov-seed-1', conceptName: 'Pine Crest Silhouette', description: 'Starlight copper foil illustration on forest green wood weave.', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', selected: true },
                            { id: 'cov-seed-2', conceptName: 'Minimal Grid Alignment', description: 'Clean geometry Swiss alignment, dark charcoal blocks.', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400', selected: false }
                          ];
                        });
                      }}
                      className="col-span-2 text-center py-6 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-slate-400"
                    >
                      Generate Initial Dust Jacket Concept Proposals
                    </button>
                  )}
                </div>
              </div>

              {/* Endorsements column */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-700 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span>Dust Jacket Endorsement Quotes</span>
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                    {project.production.endorsements.length} Logged
                  </span>
                </h4>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {project.production.endorsements.map((end, eIdx) => (
                    <div key={end.id} className="bg-white p-3 border rounded-lg text-xs leading-normal">
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-700 block">
                          {end.author} <span className="font-medium text-slate-400">({end.title})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => updateProject(draft => {
                            draft.production.endorsements = draft.production.endorsements.filter(e => e.id !== end.id);
                          })}
                          className="text-slate-350 hover:text-red-500 font-mono text-sm leading-none"
                        >
                          ×
                        </button>
                      </div>
                      <p className="italic text-slate-500 mt-1 leading-relaxed">
                        "{end.quote}"
                      </p>
                    </div>
                  ))}

                  {project.production.endorsements.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic text-center py-4">No quotes recorded yet. Add notable literary figures below.</p>
                  )}
                </div>

                {/* Add endorsement form */}
                <div className="bg-white p-3.5 border rounded-xl space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">＋ Log Notable Person Quote</span>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      className="text-xs bg-slate-50 border rounded p-1.5"
                      placeholder="Author Name"
                      value={newEndorseAuthor}
                      onChange={e => setNewEndorseAuthor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="text-xs bg-slate-50 border rounded p-1.5"
                      placeholder="Title e.g. Historian, Novelist"
                      value={newEndorseTitle}
                      onChange={e => setNewEndorseTitle(e.target.value)}
                    />
                  </div>

                  <input
                    type="text"
                    className="text-xs bg-slate-50 border rounded p-1.5 w-full"
                    placeholder="Engrave Quote: 'A sensory voyage...'"
                    value={newEndorseQuote}
                    onChange={e => setNewEndorseQuote(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (!newEndorseAuthor.trim() || !newEndorseQuote.trim()) return alert('Fill in author and quote details');
                      updateProject(draft => {
                        draft.production.endorsements.push({
                          id: 'end-' + Date.now(),
                          author: newEndorseAuthor.trim(),
                          title: newEndorseTitle.trim() || 'Reviewer',
                          quote: newEndorseQuote.trim(),
                          approved: true
                        });
                      });
                      setNewEndorseAuthor('');
                      setNewEndorseTitle('');
                      setNewEndorseQuote('');
                    }}
                    className="bg-slate-900 text-white font-bold text-xs py-1.5 w-full rounded hover:bg-slate-850 transition-colors"
                  >
                    Add Endorsement
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 9: PRINTING */}
        {/* ======================================= */}
        {viewingPhaseIndex === 8 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Steps & Revision lists */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700 border-b pb-2">Printing Shop Logistics Pipeline</h4>

              {/* Step 1: Send to print shop */}
              <div className="p-3.5 rounded-xl border flex items-center justify-between bg-slate-50/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">1. Send Final Proof Artwork</span>
                  <p className="text-[10px] text-slate-400">Deliver zero-compressed layout master files to print-shop.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={project.printing.proofSent}
                    onChange={(e) => updateProject(draft => { 
                      draft.printing.proofSent = e.target.checked;
                      if (e.target.checked && !draft.printing.proofSentDate) {
                        draft.printing.proofSentDate = new Date().toISOString().split('T')[0];
                      }
                    })}
                    className="w-4.5 h-4.5 rounded text-emerald-600"
                  />
                  {project.printing.proofSent && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Sent on {formatDate(project.printing.proofSentDate || '2026-05-20')}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 2: Receive Proof Print mock */}
              <div className="p-3.5 rounded-xl border flex items-center justify-between bg-slate-50/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">2. Receive Proof Copy</span>
                  <p className="text-[10px] text-slate-400 font-sans">Inspect first-run physical composite from machinery.</p>
                </div>

                <input
                  type="checkbox"
                  checked={project.printing.proofReceived}
                  onChange={(e) => updateProject(draft => { draft.printing.proofReceived = e.target.checked; })}
                  className="w-4.5 h-4.5 rounded text-emerald-600"
                />
              </div>

              {/* Revision note textbox */}
              <div className="bg-slate-50 p-4 border rounded-xl space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase">Proof Revision Notes (if any)</label>
                <textarea
                  rows={2}
                  className="text-xs w-full bg-white border rounded px-3 py-2 text-slate-700 font-sans leading-relaxed"
                  value={project.printing.revisionNotes || ''}
                  onChange={(e) => updateProject(draft => { draft.printing.revisionNotes = e.target.value; })}
                  placeholder="Record layout adjustments e.g. Spine centering, cover bleed corrections, crop line offsets..."
                />
              </div>
            </div>

            {/* Printing Approval block */}
            <div className="space-y-4 flex flex-col justify-between">
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-700 border-b pb-2">3. Printing Sign-off & Run Production</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The production lead must formally sign off to approve mechanical press printing of the final batch count.
                </p>

                {project.printing.printingApproved ? (
                  <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl p-3.5 flex items-start gap-2.5">
                    <CheckCircle2 size={24} className="text-emerald-600 truncate shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold block">MASS PRESS RELEASE APPROVED</span>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">
                        Authorized by {project.printing.approvedBy || 'Budi Santoso'} on {formatDate(project.printing.approvedDate || '2026-05-21')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="text-xs bg-white border rounded p-2 w-full font-semibold"
                      placeholder="Inspector Staff Name"
                      id="txt-checker"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const checkerName = (document.getElementById('txt-checker') as HTMLInputElement)?.value;
                        if (!checkerName) return alert('Enter inspector name to click sign-off');
                        updateProject(draft => {
                          draft.printing.printingApproved = true;
                          draft.printing.approvedBy = checkerName;
                          draft.printing.approvedDate = new Date().toISOString().split('T')[0];
                          draft.printing.booksReceivedQty = 500; // default target
                        });
                      }}
                      className="w-full text-xs font-bold bg-slate-900 border hover:bg-slate-800 text-white py-2 rounded"
                    >
                      ✓ Approve Printing Run
                    </button>
                  </div>
                )}
              </div>

              {/* Final output printed book shipment receipt */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-750 flex items-center justify-between border-b pb-1.5">
                  <span>4. Warehouse Delivery Checklist</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Final Step</span>
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={project.printing.booksReceived}
                        onChange={(e) => updateProject(draft => { 
                          draft.printing.booksReceived = e.target.checked;
                          if (e.target.checked && !draft.printing.booksReceivedDate) {
                            draft.printing.booksReceivedDate = new Date().toISOString().split('T')[0];
                          }
                        })}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      Printed Books Safely Received in Warehouse
                    </label>
                  </div>
                </div>

                {project.printing.booksReceived && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-slate-200">
                    <div>
                      <label className="text-[9px] text-slate-400 block font-mono">DELIVERED QUANTITY</label>
                      <input
                        type="number"
                        className="text-xs bg-white border rounded px-2 py-1 font-bold"
                        value={project.printing.booksReceivedQty}
                        onChange={(e) => updateProject(draft => { draft.printing.booksReceivedQty = parseInt(e.target.value) || 0; })}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block font-mono">DELIVERY DATE</label>
                      <input
                        type="date"
                        className="text-xs bg-white border rounded px-2 py-1"
                        value={project.printing.booksReceivedDate}
                        onChange={(e) => updateProject(draft => { draft.printing.booksReceivedDate = e.target.value; })}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* PHASE 10: FINAL ARTWORK & TROPHY */}
        {/* ======================================= */}
        {viewingPhaseIndex === 9 && (
          <div className="space-y-6">
            
            {/* Step 1: Send softcopy and download link */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Digital Archive Delivery</h4>
                  <p className="text-[11px] text-slate-400">Transmit final high-resolution digital copy assets directly back to client.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={project.finalArtwork.softcopySent}
                    onChange={(e) => updateProject(draft => { 
                      draft.finalArtwork.softcopySent = e.target.checked;
                      if (e.target.checked && !draft.finalArtwork.softcopySentDate) {
                        draft.finalArtwork.softcopySentDate = new Date().toISOString().split('T')[0];
                      }
                    })}
                    className="w-4.5 h-4.5 rounded text-emerald-600"
                  />
                  <span className="text-xs font-bold text-slate-600">Softcopy Transmitted to Client</span>
                </div>
              </div>

              {project.finalArtwork.softcopySent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-slate-450 block font-mono uppercase tracking-wider mb-1">SECURED SOFTCOPY ARCHIVE LOCKER LINK</label>
                    <input
                      type="text"
                      className="text-xs bg-white border rounded-lg px-3 py-2 w-full font-semibold font-mono"
                      value={project.finalArtwork.softcopyLink || ''}
                      onChange={(e) => updateProject(draft => { draft.finalArtwork.softcopyLink = e.target.value; })}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-450 block font-mono uppercase tracking-wider mb-1">TRANSMISSION DATE LOG</label>
                    <input
                      type="date"
                      className="text-xs bg-white border rounded-lg px-3 py-1.5 text-slate-700"
                      value={project.finalArtwork.softcopySentDate}
                      onChange={(e) => updateProject(draft => { draft.finalArtwork.softcopySentDate = e.target.value; })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Custom Gold Acrylic Commemoration Frame render (Importing TrophyPreview) */}
            <TrophyPreview
              projectName={project.creativeBrief.proposedBookTitle || project.projectName}
              recipientName={project.finalArtwork.trophyRecipientName || project.clientContact.name}
              designation={project.finalArtwork.trophyDesignation || `Recipient Author`}
              plaqueText={project.finalArtwork.trophyPlaqueText || `Honoring the excellent production of "${project.projectName}". Published in exquisitely crafted fine print under the Rene Turos seal.`}
              onChangeRecipient={(v) => updateProject(draft => { draft.finalArtwork.trophyRecipientName = v; })}
              onChangeDesignation={(v) => updateProject(draft => { draft.finalArtwork.trophyDesignation = v; })}
              onChangePlaqueText={(v) => updateProject(draft => { draft.finalArtwork.trophyPlaqueText = v; })}
              onTrophyStatusUpdate={(status) => updateProject(draft => { draft.finalArtwork.trophyStatus = status; })}
              currentStatus={project.finalArtwork.trophyStatus}
            />

          </div>
        )}

      </div>

    </div>
  );
}
