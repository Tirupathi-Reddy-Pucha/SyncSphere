import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WorkspaceList from './components/WorkspaceList';
import FileManager from './components/FileManager';
import AiSecurityScanner from './components/AiSecurityScanner';
import TelemetryDashboard from './components/TelemetryDashboard';
import LoginScreen from './components/LoginScreen';

export default function App() {
    const [activeTab, setActiveTab] = useState('workspaces');
    const [health, setHealth] = useState(null);

    // Persistent Device Session Token
    const [clientSessionId] = useState(() => {
        let sid = localStorage.getItem('syncsphere_session_id');
        if (!sid) {
            sid = 'session-' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('syncsphere_session_id', sid);
        }
        return sid;
    });

    // Authenticated User Email & JWT Token State
    const [userEmail, setUserEmailState] = useState(() => {
        return localStorage.getItem('syncsphere_user_email') || '';
    });
    const [authToken, setAuthToken] = useState(() => {
        return localStorage.getItem('syncsphere_auth_token') || '';
    });

    const handleLogin = (email, token) => {
        localStorage.setItem('syncsphere_user_email', email);
        if (token) localStorage.setItem('syncsphere_auth_token', token);
        setUserEmailState(email);
        if (token) setAuthToken(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('syncsphere_user_email');
        localStorage.removeItem('syncsphere_auth_token');
        setUserEmailState('');
        setAuthToken('');
    };

    useEffect(() => {
        fetch('/health')
            .then(res => res.json())
            .then(data => setHealth(data))
            .catch(err => console.error('Health check failed:', err));
    }, []);

    // Render Login Gateway if not authenticated
    if (!userEmail) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header Bar */}
            <Header health={health} activeTab={activeTab} setActiveTab={setActiveTab} userEmail={userEmail} onLogout={handleLogout} clientSessionId={clientSessionId} />

            {/* Main Workspace Canvas */}
            <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
                {activeTab === 'workspaces' && <WorkspaceList activeUser={userEmail} clientSessionId={clientSessionId} authToken={authToken} />}
                {activeTab === 'files' && <FileManager activeUser={userEmail} clientSessionId={clientSessionId} authToken={authToken} />}
                {activeTab === 'ai' && <AiSecurityScanner activeUser={userEmail} clientSessionId={clientSessionId} authToken={authToken} />}
                {activeTab === 'telemetry' && <TelemetryDashboard clientSessionId={clientSessionId} userEmail={userEmail} authToken={authToken} />}
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
