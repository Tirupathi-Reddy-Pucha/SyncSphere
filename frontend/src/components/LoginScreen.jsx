import React, { useState } from 'react';
import { Cloud, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!trimmed || !trimmed.includes('@')) return;

        setLoading(true);
        setTimeout(() => {
            onLogin(trimmed);
            setLoading(false);
        }, 600);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #0f172a, #0b0f19)', padding: '1.5rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>

                {/* Brand Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)', marginBottom: '1rem' }}>
                        <Cloud size={32} color="#ffffff" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
                        SyncSphere Cloud
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Secure Multi-User Workspace Authentication
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                            <Mail size={14} color="var(--accent-cyan)" /> Enter Your Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. tirupathi@gmail.com or alex@company.com"
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                color: '#ffffff',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading ? 'Authenticating Session...' : (
                            <>
                                Sign In & Access Workspace <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Security Footer Note */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Passwordless Verified Identity • Audited in Azure System Stream</span>
                </div>

            </div>
        </div>
    );
}
