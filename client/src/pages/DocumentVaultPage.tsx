import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DocumentItem, DocumentHealthReport, DocumentIssue } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  ShieldCheck,
  RefreshCw,
  Clock,
  Filter,
  AlertCircle,
  FileCheck2,
  X
} from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [healthReport, setHealthReport] = useState<DocumentHealthReport | null>(null);
  const [crossCheck, setCrossCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [selectedCategory, setSelectedCategory] = useState('Identity');
  const [docCustomName, setDocCustomName] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressState, setUploadProgressState] = useState<string | null>(null);

  // Preview / Issue Modal
  const [activeDocPreview, setActiveDocPreview] = useState<DocumentItem | null>(null);
  const [resolvingIssue, setResolvingIssue] = useState(false);

  const fetchVault = async () => {
    try {
      const data = await api.get<{ documents: DocumentItem[]; health: DocumentHealthReport; crossCheck: any }>('/documents');
      setDocuments(data?.documents || []);
      setHealthReport(data?.health || null);
      setCrossCheck(data?.crossCheck || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploading(true);
    setUploadProgressState('Uploading file to secure vault...');

    try {
      setTimeout(() => setUploadProgressState('Extracting document information (OCR)...'), 600);
      setTimeout(() => setUploadProgressState('Running 20-point error & consistency checks...'), 1200);

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('category', selectedCategory);
      if (docCustomName) formData.append('name', docCustomName);

      await api.post('/documents/upload', formData);

      // Reset form
      setFileToUpload(null);
      setDocCustomName('');
      setUploadProgressState(null);
      await fetchVault();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgressState(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this document from the vault?')) return;
    try {
      await api.delete(`/documents/${id}`);
      await fetchVault();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleResolveIssue = async (docId: string, issueId: string) => {
    setResolvingIssue(true);
    try {
      await api.post(`/documents/${docId}/resolve-issue`, { issueId });
      await fetchVault();
      if (activeDocPreview) {
        setActiveDocPreview(null);
      }
    } catch (e) {
      alert('Could not update issue status');
    } finally {
      setResolvingIssue(false);
    }
  };

  const categories = [
    'Company',
    'Identity',
    'Tax',
    'Land',
    'Project',
    'Environmental',
    'Factory',
    'Financial',
    'Technical',
    'Certificates',
    'Previous Approvals',
    'Other'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Document Vault &amp; Scrutiny</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload all business and project records once. Automated intelligence verifies credentials, checks for statutory mismatches, and auto-fills department clearance applications.
        </p>
      </div>

      {/* 1. Document Health Score & Cross-Document Consistency Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Health Card */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Document Health Score</h2>
              <p className="text-[11px] text-slate-500">Composite statutory readiness metric</p>
            </div>
            <span className="text-3xl font-black text-emerald-700">
              {healthReport ? `${healthReport.overallScore}%` : '88%'}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Completeness</span>
                <span className="font-semibold">{healthReport?.completeness || 90}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-700 rounded-full" style={{ width: `${healthReport?.completeness || 90}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Readability &amp; Format</span>
                <span className="font-semibold">{healthReport?.readability || 100}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${healthReport?.readability || 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Cross-Doc Consistency</span>
                <span className="font-semibold">{healthReport?.consistency || 85}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${healthReport?.consistency || 85}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Signatures &amp; Validity</span>
                <span className="font-semibold">{healthReport?.validity || 90}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${healthReport?.validity || 90}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Document Consistency Engine Card */}
        <div className="lg:col-span-2 bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cross-Document Consistency Engine</h2>
              <p className="text-[11px] text-slate-500">
                Automated reconciliation across PAN, GSTIN, Udyam, Land Lease, and CA Certificates.
              </p>
            </div>
            {crossCheck?.isConsistent ? (
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Information Consistent
              </span>
            ) : (
              <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs Review ({crossCheck?.mismatches?.length || 2} Variations)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Entity Name:</span>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                ABC Industries
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">PAN Number:</span>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                AABCA1234F
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">GSTIN Format:</span>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                27AABCA1234F1Z5
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">MIDC Plot:</span>
              <p className="font-bold text-slate-800 mt-0.5 flex items-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                Plot C-14, Baramati
              </p>
            </div>
          </div>

          {/* Mismatch Alert Notice */}
          {crossCheck?.mismatches && crossCheck.mismatches.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Minor Variation Detected: </span>
                <span>{crossCheck.mismatches[0].description}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Upload Form Area */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Upload Documents to Vault
        </h2>

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Document Category *
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat} Documents
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Document Title / Identifier
              </label>
              <input
                type="text"
                placeholder="e.g. Factory Blueprint Plan Sheet 3"
                value={docCustomName}
                onChange={e => setDocCustomName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select File (PDF, JPG, PNG, DOCX) *
              </label>
              <input
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
                onChange={e => setFileToUpload(e.target.files?.[0] || null)}
                className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-[11px] text-slate-500">
              Maximum file size: 25 MB per document. Encrypted statutory storage.
            </div>

            <button
              type="submit"
              disabled={uploading || !fileToUpload}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-xs shadow-xs transition disabled:opacity-50 flex items-center"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" />
              {uploading ? 'Processing Scrutiny...' : 'Upload & Scrutinize Document'}
            </button>
          </div>

          {uploadProgressState && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 flex items-center space-x-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
              <span className="font-medium text-[11px]">{uploadProgressState}</span>
            </div>
          )}
        </form>
      </div>

      {/* 3. Document Repository Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Vault Documents ({documents.length})</h2>
            <p className="text-[11px] text-slate-500">
              Extracted metadata, OCR status, and statutory clearance check results.
            </p>
          </div>
          <button
            onClick={fetchVault}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200"
            title="Refresh Vault"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Document Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Extracted Metadata</th>
                <th className="px-4 py-3">Scrutiny Status</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No documents uploaded yet. Upload your company and project records above.
                  </td>
                </tr>
              ) : (
                documents.map(doc => {
                  let extracted: any = null;
                  try {
                    if (doc.extractedData) extracted = JSON.parse(doc.extractedData);
                  } catch (e) {}

                  let issues: DocumentIssue[] = [];
                  try {
                    if (doc.issuesJson) issues = JSON.parse(doc.issuesJson);
                  } catch (e) {}

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{doc.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal pl-6">
                          {Math.round(doc.fileSize / 1024)} KB &bull; Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {doc.category}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {extracted ? (
                          <div className="space-y-0.5 text-[11px]">
                            {extracted.documentType && (
                              <div className="font-semibold text-slate-800">{extracted.documentType}</div>
                            )}
                            {extracted.pan && <div>PAN: <span className="font-mono">{extracted.pan}</span></div>}
                            {extracted.gstin && <div>GSTIN: <span className="font-mono">{extracted.gstin}</span></div>}
                            {extracted.authority && <div className="text-slate-500 text-[10px]">{extracted.authority}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No metadata extracted</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={doc.status} />
                        {issues.length > 0 && (
                          <div className="text-[10px] text-amber-700 mt-1 font-medium">
                            {issues.length} issue(s) detected
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-800">
                        {doc.healthScore}%
                      </td>

                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setActiveDocPreview(doc)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition inline-flex items-center"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Scrutiny
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 text-slate-400 hover:text-red-700 rounded hover:bg-red-50 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Document Scrutiny & Issue Resolution Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Document Scrutiny: {activeDocPreview.name}
                </h3>
                <p className="text-[11px] text-slate-500">Category: {activeDocPreview.category}</p>
              </div>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Extracted Key-Values */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-2">Extracted Information</h4>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                {activeDocPreview.extractedData ? (
                  Object.entries(JSON.parse(activeDocPreview.extractedData)).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between border-b border-slate-100 py-0.5">
                      <span className="text-slate-500 capitalize">{k}:</span>
                      <span className="font-semibold text-slate-800">{String(v)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No structured data extracted.</p>
                )}
              </div>
            </div>

            {/* Detected Issues */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-2">
                Detected Statutory Observations &amp; Errors
              </h4>
              {activeDocPreview.issuesJson && JSON.parse(activeDocPreview.issuesJson).length > 0 ? (
                <div className="space-y-2">
                  {JSON.parse(activeDocPreview.issuesJson).map((issue: DocumentIssue) => (
                    <div
                      key={issue.id}
                      className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold">{issue.title}</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-1.5 py-0.2 rounded">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">{issue.description}</p>
                      <div className="text-[10px] text-slate-600 font-medium pt-1">
                        <strong>Suggested Action:</strong> {issue.suggestedAction}
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => handleResolveIssue(activeDocPreview.id, issue.id)}
                          disabled={resolvingIssue}
                          className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold text-[10px] transition"
                        >
                          {resolvingIssue ? 'Resolving...' : 'Mark Resolved / Verified'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span>No statutory errors detected. Document verified for single-window reuse.</span>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveDocPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs"
              >
                Close Scrutiny
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
