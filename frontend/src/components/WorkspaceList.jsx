import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Clock, Users, Tag, AlertCircle, Sparkles, FolderPlus } from 'lucide-react';

export default function WorkspaceList({ activeUser }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWs, setSelectedWs] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Workspace Form State
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCat, setNewCat] = useState('Cloud Engineering');

    // New Task Form State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('High');

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/workspaces');
            const json = await res.json();
            if (json.success) {
                setWorkspaces(json.data);
                if (json.data.length > 0 && !selectedWs) {
                    selectWorkspace(json.data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching workspaces:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectWorkspace = async (ws) => {
        setSelectedWs(ws);
        try {
            const res = await fetch(`/api/workspaces/tasks?workspaceId=${ws.id}`);
            const json = await res.json();
            if (json.success) {
                setTasks(json.data);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        try {
            const res = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDesc,
                    category: newCat,
                    author: activeUser || 'Tirupathi Reddy'
                })
            });
            const json = await res.json();
            if (json.success) {
                setWorkspaces([json.data, ...workspaces]);
                selectWorkspace(json.data);
                setShowModal(false);
                setNewTitle('');
                setNewDesc('');
            }
        } catch (err) {
            console.error('Error creating workspace:', err);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !selectedWs) return;

        try {
            const res = await fetch('/api/workspaces/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: selectedWs.id,
                    title: newTaskTitle,
                    priority: newTaskPriority,
                    assignee: activeUser || 'Tirupathi Reddy'
                })
            });
            const json = await res.json();
            if (json.success) {
                setTasks([...tasks, json.data]);
                setNewTaskTitle('');
            }
        } catch (err) {
            console.error('Error adding task:', err);
        }
    };

    const handleToggleTaskStatus = async (task) => {
        const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
        try {
            const res = await fetch('/api/workspaces/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task.id, status: nextStatus, updatedBy: activeUser })
            });
            const json = await res.json();
            if (json.success) {
                setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
            }
        } catch (err) {
            console.error('Error toggling task status:', err);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

            {/* Main Workspace Explorer */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Project Collaboration Workspaces</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage cloud resources, assign project tasks, and coordinate with team members</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <Plus size={18} />
                        New Workspace
                    </button>
                </div>

                {loading ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Loading Azure Cloud Workspaces...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {workspaces.map(ws => {
                            const isSelected = selectedWs?.id === ws.id;
                            return (
                                <div
                                    key={ws.id}
                                    onClick={() => selectWorkspace(ws)}
                                    className="glass-panel glass-panel-hover"
                                    style={{
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                                        background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span className="badge badge-cyan">{ws.category}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={12} /> {new Date(ws.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                                        {ws.title}
                                    </h3>
                                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                                        {ws.description || 'Cloud computing collaborative workspace.'}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '-0.3rem' }}>
                                            {ws.members.map((m, idx) => (
                                                <img
                                                    key={idx}
                                                    src={m.avatar}
                                                    alt={m.name}
                                                    style={{ width: '26px', height: '26px', borderRadius: '50%', border: '2px solid var(--bg-dark)', objectFit: 'cover' }}
                                                    title={`${m.name} (${m.role})`}
                                                />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                                            {isSelected ? 'Active Selection ✓' : 'Click to View Tasks'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Task Checklist Panel */}
            <div className="glass-panel" style={{ padding: '1.25rem', height: 'fit-content' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} color="var(--accent-cyan)" />
                    Workspace Task Checklist
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {selectedWs ? `Tasks for ${selectedWs.title}` : 'Select a workspace to view tasks'}
                </p>

                {/* Task List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}>
                    {tasks.length === 0 ? (
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0' }}>
                            No tasks assigned yet. Add one below!
                        </div>
                    ) : (
                        tasks.map(t => (
                            <div key={t.id} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: t.status === 'Completed' ? 'line-through' : 'none', color: t.status === 'Completed' ? 'var(--text-dim)' : 'var(--text-main)' }}>
                                        {t.title}
                                    </span>
                                    <span className={`badge ${t.priority === 'High' ? 'badge-amber' : 'badge-cyan'}`}>
                                        {t.priority}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                                    <span>Assignee: {t.assignee}</span>
                                    <span
                                        onClick={() => handleToggleTaskStatus(t)}
                                        style={{
                                            color: t.status === 'Completed' ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: t.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                                            border: `1px solid ${t.status === 'Completed' ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}`
                                        }}
                                        title="Click to toggle status"
                                    >
                                        {t.status === 'Completed' ? '✓ Completed' : '⏳ In Progress'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <input
                        type="text"
                        placeholder="New Task Description..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '0.825rem', padding: '0.6rem 0.85rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
                            className="input-field"
                            style={{ fontSize: '0.8rem', padding: '0.5rem', width: '100px' }}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.825rem', justifyContent: 'center' }}>
                            Add Task
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal Dialog for New Workspace */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', background: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FolderPlus size={20} color="var(--accent-cyan)" /> Create Workspace
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Workspace Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Azure Microservices Pipeline"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Category</label>
                                <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="input-field">
                                    <option value="Cloud Engineering">Cloud Engineering</option>
                                    <option value="Serverless & Security">Serverless & Security</option>
                                    <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                                    <option value="AI & Analytics">AI & Analytics</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Description</label>
                                <textarea
                                    placeholder="Project scope and cloud objectives..."
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="input-field"
                                    rows={3}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Create Workspace</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
