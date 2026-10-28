import React, { useState, useEffect } from 'react';
import { Activity, Server, HardDrive, ShieldAlert, CheckCircle2, Clock, RefreshCw, Cpu, Key, Lock, Shield, Database } from 'lucide-react';

export default function TelemetryDashboard({ clientSessionId, userEmail, authToken }) {
    const [health, setHealth] = useState(null);
    const [logs, setLogs] = useState([]);
    const [vaultData, setVaultData] = useState(null);
    const [syncingVault, setSyncingVault] = useState(false);
    const [loading, setLoading] = useState(true);

    const token = authToken || localStorage.getItem('syncsphere_auth_token') || '';

    useEffect(() => {
        fetchTelemetry();
    }, []);

    const fetchTelemetry = async () => {
        try {
            setLoading(true);

            const [hRes, lRes, vRes] = await Promise.all([
                fetch('/health'),
                fetch('/api/workspaces/logs', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                }),
                fetch('/api/vault/secrets', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                }).catch(() => null)
            ]);

            const hJson = await hRes.json();
            const lJson = await lRes.json();
            const vJson = vRes ? await vRes.json() : null;

            if (hJson) setHealth(hJson);
            if (lJson.success) setLogs(lJson.data);
            if (vJson?.success) setVaultData(vJson);
        } catch (err) {
            console.error('Telemetry fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncVault = async () => {
        try {
            setSyncingVault(true);
            const res = await fetch('/api/vault/sync', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            await res.json();
            await fetchTelemetry();
        } catch (err) {
            console.error('Error syncing Key Vault:', err);
        } finally {
            setSyncingVault(false);
        }
    };

    const formatLogUser = (log) => {
        if (!log || !log.user) return 'System';

        const rawUser = log.user;

        // Extract device tag if present (e.g. 💻 Desktop or 📱 Mobile)
        const deviceMatch = rawUser.match(/\((💻 Desktop|📱 Mobile)\)/);
        const deviceTag = deviceMatch ? deviceMatch[1] : '';

        // Extract email or username without device tag or brackets
        let email = rawUser.replace(/\s*\((💻 Desktop|📱 Mobile)\)\s*/g, '').trim();
        const bracketMatch = email.match(/<([^>]+)>/);
        if (bracketMatch) email = bracketMatch[1];

        // If email is generic or this action belongs to the active session, display the logged-in user email
        const isSelf = clientSessionId && log.sessionId && log.sessionId === clientSessionId;
        if ((!email || email === 'User' || email === 'You' || isSelf) && userEmail) {
            email = userEmail;
        }

        return `${email}${deviceTag ? ' (' + deviceTag + ')' : ''}`;
    };

    const handleClearLogs = async () => {
        try {
            const res = await fetch('/api/workspaces/logs', { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                setLogs([]);
            }
        } catch (err) {
            console.error('Error clearing logs:', err);
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
                        Real-time metric monitoring for Azure App Service, Key Vault HSM, Application Insights, and Log Analytics Workspace
                    </p>
                </div>
                <button onClick={fetchTelemetry} className="btn-secondary">
                    <RefreshCw size={16} /> Refresh Telemetry
                </button>
            </div>

            {/* Health Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

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

                {/* Card 2: Azure Key Vault */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Key size={22} color="var(--accent-amber)" />
                        <span className="badge badge-emerald">Encrypted HSM</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Azure Key Vault</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {health?.keyVault?.vaultName || 'kv-syncsphere-2026'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        FIPS 140-2 Level 2 • {health?.keyVault?.status === 'ACTIVE' ? 'Managed Identity' : 'Zero-Trust HSM'}
                    </div>
                </div>

                {/* Card 3: Blob Container Storage */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <HardDrive size={22} color="var(--accent-blue)" />
                        <span className="badge badge-emerald">Healthy</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Azure Blob Storage</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>stsyncsphere2026</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Container: workspace-assets</div>
                </div>

                {/* Card 4: Azure Cosmos DB (Real) */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Database size={22} color="var(--accent-purple)" />
                        <span className="badge badge-purple">{health?.cosmosDb?.status || 'CONNECTED'}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Azure Cosmos DB (NoSQL)</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>cosmos-syncsphere-db</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Database: syncspheredb • Central India</div>
                </div>

                {/* Card 5: Azure Table Storage (Real) */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Cpu size={22} color="var(--accent-emerald)" />
                        <span className="badge badge-emerald">Operational</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Azure Table Storage</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>stsyncsphere2026</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tables: Workspaces, Tasks, Logs</div>
                </div>

                {/* Card 6: Azure Application Insights (Real) */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Activity size={22} color="var(--accent-cyan)" />
                        <span className="badge badge-emerald">{health?.appInsights?.status === 'ACTIVE' ? 'Live APM' : 'Active'}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Azure Application Insights</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>appi-syncsphere-2026</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Live Metrics & Request Tracing</div>
                </div>

                {/* Card 7: Log Analytics Workspace (Real) */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Server size={22} color="var(--accent-purple)" />
                        <span className="badge badge-purple">Ingestion Ready</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Log Analytics Workspace</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>log-syncsphere-2026</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>30-Day Retention • PerGB2018</div>
                </div>

            </div>

            {/* Azure Key Vault Zero-Trust Secret Manager Widget */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={20} color="var(--accent-amber)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Azure Key Vault Secret Store
                                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>FIPS 140-2 Level 2</span>
                            </h3>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                Zero-Trust Credential Isolation • DefaultAzureCredential • RBAC Authorization
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={handleSyncVault}
                            disabled={syncingVault}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <RefreshCw size={14} className={syncingVault ? 'spin' : ''} />
                            {syncingVault ? 'Syncing...' : 'Sync Key Vault'}
                        </button>
                    </div>
                </div>

                {vaultData?.data ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                        {vaultData.data.map(sec => (
                            <div key={sec.key} style={{ padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                                        {sec.key}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                                        Value: <span style={{ color: 'var(--accent-cyan)' }}>{sec.maskedValue}</span>
                                    </div>
                                </div>
                                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                                    {sec.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Key Vault secrets managed and protected via Hardware Security Module (HSM).
                    </div>
                )}
            </div>

            {/* Live System Logs Stream */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Security & System Audit Log ({logs.length})</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={handleClearLogs}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', border: '1px solid rgba(244, 63, 94, 0.3)' }}
                        >
                            Reset Logs
                        </button>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Live Stream</span>
                    </div>
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
                                    <span>User: <strong style={{ color: 'var(--accent-cyan)' }}>{formatLogUser(log)}</strong></span>
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
