import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WorkspaceList from './components/WorkspaceList';
import FileManager from './components/FileManager';
import AiSecurityScanner from './components/AiSecurityScanner';
import TelemetryDashboard from './components/TelemetryDashboard';

export default function App() {
    const [activeTab, setActiveTab] = useState('workspaces');
    const [health, setHealth] = useState(null);
    const [activeUser, setActiveUser] = useState('Tirupathi Reddy (Project Lead)');
    const [userEmail, setUserEmail] = useState('tirupathi@gmail.com');

    useEffect(() => {
        fetch('/health')
            .then(res => res.json())
            .then(data => setHealth(data))
            .catch(err => console.error('Health check failed:', err));
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header Bar */}
            <Header health={health} activeTab={activeTab} setActiveTab={setActiveTab} activeUser={activeUser} setActiveUser={setActiveUser} userEmail={userEmail} setUserEmail={setUserEmail} />

            {/* Main Workspace Canvas */}
            <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
                {activeTab === 'workspaces' && <WorkspaceList activeUser={userEmail ? `${activeUser} <${userEmail}>` : activeUser} />}
                {activeTab === 'files' && <FileManager activeUser={userEmail ? `${activeUser} <${userEmail}>` : activeUser} />}
                {activeTab === 'ai' && <AiSecurityScanner activeUser={userEmail ? `${activeUser} <${userEmail}>` : activeUser} />}
                {activeTab === 'telemetry' && <TelemetryDashboard userEmail={userEmail} />}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.9)', padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <strong>SyncSphere</strong> • Cloud Computing Course Project • Azure for Students Subscription
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-dim)' }}>
                        <span>Azure App Service: <strong style={{ color: 'var(--accent-cyan)' }}>Active (F1)</strong></span>
                        <span>•</span>
                        <span>Blob Container: <strong style={{ color: 'var(--accent-cyan)' }}>workspace-assets</strong></span>
                    </div>
                </div>
            </footer>

        </div>
    );
}
