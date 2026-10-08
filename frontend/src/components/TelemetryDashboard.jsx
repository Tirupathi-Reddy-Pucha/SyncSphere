import React, { useState, useEffect } from 'react';
import { Activity, Server, HardDrive, ShieldAlert, CheckCircle2, Clock, RefreshCw, Cpu } from 'lucide-react';

export default function TelemetryDashboard() {
    const [health, setHealth] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTelemetry();
    }, []);

    const fetchTelemetry = async () => {
        try {
            setLoading(true);

            const [hRes, lRes] = await Promise.all([
                fetch('/health'),
                fetch('/api/workspaces/logs')
            ]);

            const hJson = await hRes.json();
            const lJson = await lRes.json();

            if (hJson) setHealth(hJson);
            if (lJson.success) setLogs(lJson.data);
        } catch (err) {
            console.error('Telemetry fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'Success': return <span className="badge badge-emerald">Success</span>;
            case 'Warning': return <span className="badge badge-amber">Warning</span>;
            case 'Error': return <span className="badge badge-amber" style={{ background: 'rgba(244,63,94,0.15)', color: '#f87171' }}>Error</span>;
            default: return <span className="badge badge-cyan">Info</span>;
        }
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={24} color="var(--accent-cyan)" /> Azure Infrastructure Telemetry & Audit Logs
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Real-time metric monitoring for Azure App Service, Application Insights, and Log Analytics Workspace
                    </p>
                </div>
                <button onClick={fetchTelemetry} className="btn-secondary">
                    <RefreshCw size={16} /> Refresh Telemetry
                </button>
            </div>

            {/* Health Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

                {/* Card 1: API Gateway App Service */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Server size={22} color="var(--accent-cyan)" />
                        <span className="badge badge-emerald">Operational</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Web App API Gateway</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>app-syncsphere-api-2026</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Azure Region: eastasia (App Service F1)</div>
                </div>

                {/* Card 2: Blob Container Storage */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <HardDrive size={22} color="var(--accent-blue)" />
                        <span className="badge badge-emerald">Healthy</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Azure Blob Storage</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>stsyncsphere2026</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Container: workspace-assets</div>
                </div>

                {/* Card 3: Log Analytics Workspace */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Activity size={22} color="var(--accent-purple)" />
                        <span className="badge badge-purple">Active</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Log Analytics Workspace</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>log-syncsphere</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Region: eastus2</div>
                </div>

                {/* Card 4: Application Insights */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Cpu size={22} color="var(--accent-emerald)" />
                        <span className="badge badge-cyan">Streaming</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Application Insights</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>appi-syncsphere</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Telemetry: Performance & APM</div>
                </div>

            </div>

            {/* Live System Logs Stream */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Security & System Audit Log ({logs.length})</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Live Stream</span>
                </h3>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                        Loading System Logs...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {logs.map(log => (
                            <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {getSeverityBadge(log.severity)}
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                        {log.action}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                    <span>User: <strong style={{ color: 'var(--text-muted)' }}>{log.user}</strong></span>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
