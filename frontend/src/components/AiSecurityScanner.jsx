import React, { useState } from 'react';
import { ShieldCheck, Code, AlertTriangle, CheckCircle, Cpu, Zap, History } from 'lucide-react';

const SAMPLE_TEMPLATES = [
    {
        label: 'Azure Blob SDK Upload (Secure)',
        code: `const { BlobServiceClient } = require('@azure/storage-blob');
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient('workspace-assets');
await containerClient.createIfNotExists({ access: 'blob' });`
    },
    {
        label: 'Insecure Connection & Permissive CORS (Vulnerable)',
        code: `const connectionString = "DefaultEndpointsProtocol=http;AccountName=myaccount;AccountKey=SuperSecret123==";
app.use(cors({ origin: '*' }));`
    }
];

export default function AiSecurityScanner() {
    const [code, setCode] = useState(SAMPLE_TEMPLATES[0].code);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        try {
            setScanning(true);
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codeSnippet: code })
            });
            const json = await res.json();
            if (json.success) {
                setResult(json.data);
            }
        } catch (err) {
            console.error('Scan error:', err);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Code Editor & Scanner input */}
            <div>
                <div style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={24} color="var(--accent-cyan)" /> Azure AI Security Code Scanner
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Real-time heuristic & architectural security analyzer for cloud code snippets and Azure SDK patterns
                    </p>
                </div>

                {/* Template Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Load Template:</span>
                    {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setCode(tmpl.code); setResult(null); }}
                            className="btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                            {tmpl.label}
                        </button>
                    ))}
                </div>

                {/* Code Editor Area */}
                <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Code size={14} color="var(--accent-cyan)" /> JavaScript / Azure Node.js SDK
                        </span>
                        <span className="badge badge-purple">AI Heuristic Engine</span>
                    </div>

                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        rows={10}
                        className="input-field"
                        style={{
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '0.85rem',
                            lineHeight: '1.5',
                            background: 'rgba(10, 15, 26, 0.95)',
                            resize: 'vertical'
                        }}
                        placeholder="Paste code snippet or Azure connection config to analyze..."
                    ></textarea>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button onClick={handleScan} className="btn-primary" disabled={scanning}>
                            <Zap size={16} />
                            {scanning ? 'Analyzing Azure Security...' : 'Run Security Scan'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Analysis Result Side Panel */}
            <div>
                <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Cpu size={18} color="var(--accent-cyan)" /> Audit Audit Report
                    </h3>

                    {!result ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                            <ShieldCheck size={40} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
                            <p>Click "Run Security Scan" to audit your code for Azure security standards!</p>
                        </div>
                    ) : (
                        <div>
                            {/* Score Meter */}
                            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Compliance Score</span>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.securityScore >= 80 ? '#34d399' : result.securityScore >= 50 ? '#fbbf24' : '#f87171', margin: '0.25rem 0' }}>
                                    {result.securityScore} / 100
                                </div>
                                <span className={`badge ${result.securityScore >= 80 ? 'badge-emerald' : 'badge-amber'}`}>
                                    {result.securityScore >= 80 ? 'Production Ready' : 'Security Improvements Required'}
                                </span>
                            </div>

                            {/* Feedback Breakdown */}
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.65rem' }}>Diagnostic Output:</h4>
                            <div style={{ background: 'rgba(10, 15, 26, 0.8)', padding: '1rem', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-wrap', fontFamily: 'monospace', border: '1px solid var(--border-subtle)' }}>
                                {result.feedback}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
