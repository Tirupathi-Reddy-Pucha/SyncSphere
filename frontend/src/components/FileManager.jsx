import React, { useState, useEffect } from 'react';
import { Upload, HardDrive, FileText, Trash2, ExternalLink, RefreshCw, FileCheck, CheckCircle } from 'lucide-react';

export default function FileManager() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/files');
            const json = await res.json();
            if (json.success) {
                setFiles(json.data);
            }
        } catch (err) {
            console.error('Error fetching files:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploading(true);
            setUploadStatus(null);
            const res = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });
            const json = await res.json();
            if (json.success) {
                setUploadStatus({ type: 'success', message: `File "${selectedFile.name}" uploaded to Azure Blob Container workspace-assets!` });
                fetchFiles();
            } else {
                setUploadStatus({ type: 'error', message: json.message || 'Upload failed' });
            }
        } catch (err) {
            setUploadStatus({ type: 'error', message: err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (blobName) => {
        if (!window.confirm(`Delete blob "${blobName}" from Azure Storage?`)) return;

        try {
            const res = await fetch(`/api/files/${encodeURIComponent(blobName)}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                setFiles(files.filter(f => f.name !== blobName));
            }
        } catch (err) {
            console.error('Error deleting blob:', err);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Top Banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HardDrive size={22} color="var(--accent-cyan)" /> Azure Blob Storage Manager
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Live container: <strong style={{ color: 'var(--accent-cyan)' }}>workspace-assets</strong> (Storage Account: stsyncsphere2026)
                    </p>
                </div>
                <button onClick={fetchFiles} className="btn-secondary">
                    <RefreshCw size={16} /> Refresh Assets
                </button>
            </div>

            {/* Upload Zone */}
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', borderStyle: 'dashed', borderColor: 'var(--border-glow)' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Upload size={28} color="var(--accent-cyan)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>Upload Project Asset to Azure Cloud</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Files are streamed directly into Azure Blob Container <code style={{ color: 'var(--accent-cyan)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>workspace-assets</code>
                </p>

                <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    <Upload size={16} />
                    {uploading ? 'Uploading to Azure...' : 'Select & Upload Asset'}
                    <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>

                {uploadStatus && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: uploadStatus.type === 'success' ? '#34d399' : '#f87171', border: `1px solid ${uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}` }}>
                        <FileCheck size={16} />
                        {uploadStatus.message}
                    </div>
                )}
            </div>

            {/* Blob List */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Live Container Assets ({files.length})</span>
                    <span className="badge badge-emerald">Storage Account Active</span>
                </h3>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                        Querying Azure Blob Storage SDK...
                    </div>
                ) : files.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                        <HardDrive size={36} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
                        <p>No assets uploaded to Azure Blob Container yet.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Upload a file above to verify Azure Storage SDK integration!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {files.map((file, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={20} color="var(--accent-blue)" />
                                    </div>
                                    <div>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            {file.name} <ExternalLink size={14} color="var(--accent-cyan)" />
                                        </a>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                            <span>Size: {formatBytes(file.size)}</span>
                                            <span>•</span>
                                            <span>Type: {file.contentType || 'application/octet-stream'}</span>
                                            {file.lastModified && (
                                                <>
                                                    <span>•</span>
                                                    <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}>
                                        View URL
                                    </a>
                                    <button onClick={() => handleDeleteFile(file.name)} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '0.4rem 0.65rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
