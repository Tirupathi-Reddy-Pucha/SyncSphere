import React from 'react';
import { Cloud, ShieldCheck, Activity, UserCheck, HardDrive } from 'lucide-react';

export default function Header({ health, activeTab, setActiveTab }) {
    return (
        <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(16px)', sticky: 'top', zIndex: 50 }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)' }}>
                        <Cloud size={24} color="#ffffff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            SyncSphere
                        </h1>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Azure Cloud Collaboration Workspace</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    {[
                        { id: 'workspaces', label: 'Workspaces', icon: Cloud },
                        { id: 'files', label: 'Azure Assets', icon: HardDrive },
                        { id: 'ai', label: 'AI Security Scanner', icon: ShieldCheck },
                        { id: 'telemetry', label: 'System Health', icon: Activity }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.9rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isActive ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent',
                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Azure Identity & Health Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div className="badge badge-emerald" style={{ padding: '0.4rem 0.75rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="animate-pulse-glow"></span>
                        Azure Student Active
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                        <UserCheck size={16} color="var(--accent-cyan)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500 }}>
                            cb.sc.u4cse23568
                        </span>
                    </div>
                </div>

            </div>
        </header>
    );
}
