import React, { useState, useEffect } from 'react';
import API from './api';
import { 
  FolderKanban, LayoutDashboard, Briefcase, Users, 
  Clock, LogOut, Plus, Phone, MessageSquare, Mail, 
  Calendar, CheckCircle2, AlertCircle, ChevronRight, UserCheck
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  // Auth States
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password123');
  const [authError, setAuthError] = useState('');

  // Dashboard Data
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [logs, setLogs] = useState([]);

  // Admin Forms
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [staffIdToAssign, setStaffIdToAssign] = useState('');

  // Developer Log Form
  const [taskDone, setTaskDone] = useState('');
  const [hoursSpent, setHoursSpent] = useState('4');

  const handlePendingContact = (type, person) => {
    alert(`${person} ka ${type} number baad me settings se configure hoga.`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await API.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Check credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
    setLogs([]);
  };

  const loadProjects = async () => {
    try {
      const res = await API.get('/projects');
      const list = res.data.projects || [];
      setProjects(list);
      if (list.length > 0) {
        setSelectedProject(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async (projId) => {
    try {
      const res = await API.get(`/logs/project/${projId}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      loadProjects();
    }
  }, [token]);

  useEffect(() => {
    if (selectedProject?.id) {
      loadLogs(selectedProject.id);
    }
  }, [selectedProject]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', {
        title: newTitle,
        description: newDesc,
        client_id: 2,
        deadline: newDeadline,
        status: 'ongoing'
      });
      setNewTitle('');
      setNewDesc('');
      setNewDeadline('');
      alert('Project created successfully!');
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!selectedProject || !staffIdToAssign) return;
    try {
      await API.post('/projects/assign', {
        project_id: selectedProject.id,
        staff_id: Number(staffIdToAssign)
      });
      alert('Developer assigned successfully to project!');
      setStaffIdToAssign('');
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!taskDone || !selectedProject) return;
    try {
      await API.post('/logs', {
        project_id: selectedProject.id,
        task_done: taskDone,
        hours_spent: Number(hoursSpent) || 0
      });
      setTaskDone('');
      alert('Daily update submitted successfully!');
      loadLogs(selectedProject.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit log');
    }
  };

  // ================= 1. CLEAN LIGHT LOGIN SCREEN =================
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-md shadow-blue-500/20">
            PT
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">ProjectTrack</h1>
            <p className="text-xs text-slate-500">Centralized Project Tracking Platform</p>
          </div>
        </div>

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mb-6">Select role to populate test credentials</p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setEmail('admin@test.com'); setPassword('password123'); }}
              className="py-2.5 px-3 text-xs font-semibold rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer text-center transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('rahul@dev.com'); setPassword('password123'); }}
              className="py-2.5 px-3 text-xs font-semibold rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer text-center transition-colors"
            >
              Developer
            </button>
            <button
              type="button"
              onClick={() => { setEmail('client@acme.com'); setPassword('password123'); }}
              className="py-2.5 px-3 text-xs font-semibold rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 cursor-pointer text-center transition-colors"
            >
              Client
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-600">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= 2. ADMIN DASHBOARD (LIGHT THEME) =================
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">PT</div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">ProjectTrack</span>
              <span className="text-[11px] ml-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{user.name}</div>
              <div className="text-[11px] text-slate-500">Administrator</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="max-w-7xl w-full mx-auto p-8 space-y-6 flex-1">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Projects</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{projects.length}</div>
              <div className="text-xs text-blue-600 mt-2 font-medium">All active files</div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">Assigned Developer</span>
              <div className="text-2xl font-bold text-indigo-600 mt-2 truncate">Rahul Sharma</div>
              <div className="text-xs text-slate-500 mt-2 font-medium">Core Staff</div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">Client Company</span>
              <div className="text-2xl font-bold text-slate-800 mt-2 truncate">ABC Pvt. Ltd.</div>
              <div className="text-xs text-slate-500 mt-2 font-medium">Account Linked</div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">Logged Updates</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">{logs.length} Total</div>
              <div className="text-xs text-emerald-600 mt-2 font-medium">Live progress</div>
            </div>
          </div>

          {/* Allocation & Project Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Project */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Create New Project
              </h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-semibold text-slate-600">Project Title</label>
                  <input
                    type="text"
                    placeholder="E.g. Mobile App Development"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-semibold text-slate-600">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Project deliverables..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-semibold text-slate-600">Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-semibold text-white text-sm rounded-xl cursor-pointer transition-colors shadow-xs">
                  Create Project
                </button>
              </form>
            </div>

            {/* Assign Developer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> Assign Developer to Project
                </h3>
                <form onSubmit={handleAssignStaff} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-600">Select Project</label>
                    <select
                      value={selectedProject?.id || ''}
                      onChange={(e) => setSelectedProject(projects.find(p => p.id === Number(e.target.value)))}
                      className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-600">Developer ID</label>
                    <input
                      type="number"
                      placeholder="Enter Staff ID (e.g. 3 for Rahul)"
                      value={staffIdToAssign}
                      onChange={(e) => setStaffIdToAssign(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white text-sm rounded-xl cursor-pointer transition-colors shadow-xs">
                    Confirm Assignment
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 border-t border-slate-200 pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => handlePendingContact('Calling', 'Client')}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Call Client
                </button>
                <button 
                  type="button" 
                  onClick={() => handlePendingContact('WhatsApp', 'Developer')}
                  className="flex-1 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Dev
                </button>
              </div>
            </div>
          </div>

          {/* Developer Daily Updates Stream */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" /> Live Developer Daily Updates
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Monitoring all daily tasks posted by assigned developers across projects</p>
              </div>
              <span className="text-xs px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full font-semibold">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {log.staff_name ? log.staff_name[0] : 'R'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{log.task_done}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Posted by <span className="text-indigo-600 font-semibold">{log.staff_name || 'Rahul Sharma'}</span> on {new Date(log.log_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg">
                      {log.hours_spent} Hours Logged
                    </span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">No daily logs submitted for the active project yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. DEVELOPER DASHBOARD (LIGHT THEME) =================
  if (user.role === 'staff') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">PT</div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">ProjectTrack</span>
              <span className="text-[11px] ml-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">Developer Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{user.name}</div>
              <div className="text-[11px] text-indigo-600 font-medium">Developer Account</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Assigned Projects */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">My Assigned Projects</h3>
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  selectedProject?.id === p.id
                    ? 'bg-indigo-50/60 border-indigo-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-900 text-sm">{p.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold uppercase">{p.status}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
              </div>
            ))}
          </div>

          {/* Daily Work Log Form & Client Contact */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProject ? (
              <>
                {/* Submit Daily Log */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Daily Work Log for: {selectedProject.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">Post daily tasks completed and hours spent</p>
                  <form onSubmit={handleAddLog} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Task description (e.g. Design homepage layout, API integration)..."
                        value={taskDone}
                        onChange={(e) => setTaskDone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        placeholder="Hours spent"
                        value={hoursSpent}
                        onChange={(e) => setHoursSpent(e.target.value)}
                        className="w-36 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                        required
                      />
                      <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white text-sm rounded-xl cursor-pointer shadow-xs transition-colors">
                        Submit Daily Log
                      </button>
                    </div>
                  </form>
                </div>

                {/* Client Details & Contact Buttons */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Client Contact Details</h3>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">ABC Pvt. Ltd. (Client)</div>
                      <div className="text-xs text-slate-500 mt-0.5">client@acme.com</div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => handlePendingContact('Calling', 'Client')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" /> Call Client
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handlePendingContact('WhatsApp', 'Client')}
                        className="px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logs History */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">My Submitted Logs ({logs.length})</h3>
                  <div className="space-y-3">
                    {logs.map(l => (
                      <div key={l.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{l.task_done}</div>
                          <div className="text-slate-500 mt-1">{new Date(l.log_date).toLocaleDateString()}</div>
                        </div>
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">{l.hours_spent} hrs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">No project selected.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= 4. CLIENT DASHBOARD (LIGHT THEME) =================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">PT</div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight">ProjectTrack</span>
            <span className="text-[11px] ml-2 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-semibold">Client Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">{user.name}</div>
            <div className="text-[11px] text-sky-600 font-medium">Client Account</div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Project Card & Team Members */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-bold uppercase tracking-wider border border-sky-200">In Progress</span>
            <h2 className="text-xl font-bold text-slate-900 mt-3">{projects[0]?.title || 'Website Redesign Project'}</h2>
            <p className="text-xs text-slate-500 mt-2">{projects[0]?.description || 'Complete web development and tracking.'}</p>
            <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
              Deadline: <span className="text-slate-900 font-semibold">{projects[0]?.deadline ? new Date(projects[0].deadline).toLocaleDateString() : '12 Nov 2026'}</span>
            </div>
          </div>

          {/* Assigned Team */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Assigned Developer</h3>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Rahul Sharma</div>
                <div className="text-xs text-slate-500">Frontend Developer</div>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => handlePendingContact('Calling', 'Developer')}
                  className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 cursor-pointer transition-colors"
                >
                  <Phone className="w-4 h-4 text-sky-600" />
                </button>
                <button 
                  type="button" 
                  onClick={() => handlePendingContact('WhatsApp', 'Developer')}
                  className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Client Support Help */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Client Support</h3>
            <p className="text-xs text-slate-500 mb-4">Need help or scope modification? Contact agency management.</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => handlePendingContact('Calling', 'Agency')}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-sky-600" /> Call Agency
              </button>
              <button 
                type="button" 
                onClick={() => handlePendingContact('WhatsApp', 'Agency')}
                className="py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Daily Updates Timeline for Client */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Daily Progress Updates</h3>
          <p className="text-xs text-slate-500 mb-6">Transparent daily record of developer tasks</p>

          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                  {log.staff_name ? log.staff_name[0] : 'D'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-900">{log.staff_name || 'Assigned Developer'}</span>
                    <span className="text-xs text-slate-500">{new Date(log.log_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.task_done}</p>
                </div>
                <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold">
                  {log.hours_spent} hrs
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center py-12 text-slate-400 text-xs">No updates logged yet for your project.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
