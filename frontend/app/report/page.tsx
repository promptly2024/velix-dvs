"use client";
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, FileText, Phone, ShieldAlert, ArrowRight, RefreshCcw } from 'lucide-react';

// TYPES
type WorkflowType = 'QUESTION' | 'INPUT_FORM' | 'INFO' | 'ACTION' | 'TEMPLATE_FORM';

interface WorkflowOption {
    id: string;
    label: string;
    nextNodeId: string | null;
    order: number;
}

interface WorkflowNode {
    id: string;
    title: string;
    content: string;
    type: WorkflowType;
    resourceLink?: string | null;
    templateId?: string | null;
    options: WorkflowOption[];
}

interface IncidentResponse {
    incidentId: string;
    node: WorkflowNode;
    finished?: boolean;
    message?: string;
}

interface Threats {
    id: string;
    name: string;
    description: string;
    key: string;
}

const IncidentReportPage = () => {
    const API_BASE = "http://localhost:3001/api/v1/incident";
    const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMmI5YmExZC03YzJlLTQ1NGMtOGNiYy1iMDExYTUwYjQ4ZTYiLCJuYW1lIjoidGVzdHVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjQyMzU0OTIsImV4cCI6MTc2NDg0MDI5Mn0.xmcZN3BR223DPS3fYsnD6QIJqrnBXAStxR8GabOVLuA';

    const [loading, setLoading] = useState(true);
    const [incidentId, setIncidentId] = useState<string | null>(null);
    const [currentNode, setCurrentNode] = useState<WorkflowNode | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [threats, setThreats] = useState<Threats[]>([]);
    const [finishMessage, setFinishMessage] = useState("");
    const [showThreatSelection, setShowThreatSelection] = useState(true);
    // Template form state
    const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({});
    const [generatedText, setGeneratedText] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

    // 1. INITIALIZE WORKFLOW
    // useEffect(() => {
    //     startIncident("FINANCIAL_THREAT");
    // }, []);
    const fetchThreats = async () => {
        try {
            const res = await fetch(`${API_BASE}/threats`, {
                method: 'GET',
                headers: {
                    'Authorization': TOKEN,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            setThreats(data.threats);
            console.log("Available Threats:", data.threats);
        } catch (error) {
            console.error("Error fetching threats:", error);
        }
    };

    useEffect(() => {
        fetchThreats();
    }, []);

    const startIncident = async (category: string) => {
        setLoading(true);
        setIsFinished(false);
        setShowThreatSelection(false);
        try {
            const res = await fetch(`${API_BASE}/start/${category}`, {
                method: 'GET',
                headers: {
                    'Authorization': TOKEN,
                    'Content-Type': 'application/json'
                }
            });
            const data: IncidentResponse = await res.json();

            if (res.ok) {
                setIncidentId(data.incidentId);
                setCurrentNode(data.node);
            } else {
                console.error("Failed to start:", data);
            }
        } catch (error) {
            console.error("Network Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. HANDLE NEXT STEP
    const handleOptionClick = async (optionId: string) => {
        if (!incidentId) return;
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/next`, {
                method: 'POST',
                headers: {
                    'Authorization': TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    incidentId: incidentId,
                    selectedOptionId: optionId,
                    // inputData: {} // Future: If user typed bank name, send here
                })
            });

            const data = await res.json();

            if (data.finished) {
                setIsFinished(true);
                setFinishMessage(data.message || "Process Completed.");
            } else {
                setCurrentNode(data.node);
            }
        } catch (error) {
            console.error("Error fetching next step:", error);
        } finally {
            setLoading(false);
        }
    };

    // Generate template without advancing the node
    const handleGenerateTemplate = async () => {
        if (!incidentId) return;
        setIsGenerating(true);
        setGeneratedText("");
        try {
            const res = await fetch(`${API_BASE}/generate-template`, {
                method: 'POST',
                headers: {
                    'Authorization': TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ incidentId, inputData: templateInputs })
            });
            const data = await res.json();
            if (!res.ok) {
                console.error('Generate template failed:', data);
                return;
            }
            setGeneratedText(data.filledText || "");
        } catch (e) {
            console.error('Generate template error:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadText = () => {
        if (!generatedText) return;
        const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'complaint_letter.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPdf = async () => {
        if (!incidentId) return;
        setIsDownloadingPdf(true);
        try {
            const res = await fetch(`${API_BASE}/generate-template-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ incidentId, inputData: templateInputs })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert('Failed to generate PDF. ');
                return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'incident_template.pdf';
            a.click();
            URL.revokeObjectURL(url);
            
        } catch (e) {
            alert('Error generating PDF. ');
            console.error('Download PDF error:', e);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // Icon based on node type
    const getIcon = () => {
        if (isFinished) return <CheckCircle className="w-12 h-12 text-green-500" />;
        switch (currentNode?.type) {
            case 'ACTION': return <Phone className="w-10 h-10 text-red-500" />;
            case 'TEMPLATE_FORM': return <FileText className="w-10 h-10 text-blue-500" />;
            case 'INFO': return <ShieldAlert className="w-10 h-10 text-yellow-500" />;
            default: return <AlertCircle className="w-10 h-10 text-indigo-500" />;
        }
    };

    // Show threat selection screen first
    if (showThreatSelection) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="bg-indigo-600 p-6">
                        <h1 className="text-white font-bold text-2xl flex items-center gap-3">
                            <ShieldAlert size={28} /> Select Threat Type
                        </h1>
                        <p className="text-indigo-100 mt-2">Choose the type of incident you want to report</p>
                    </div>

                    <div className="p-6">
                        {loading && threats.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading threats...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {threats.map((threat) => (
                                    <button
                                        key={threat.id}
                                        onClick={() => startIncident(threat.key)}
                                        className="w-full text-left p-5 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex justify-between items-start group"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-indigo-700">
                                                {threat.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {threat.description}
                                            </p>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all mt-1 ml-4" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (loading && !currentNode && !isFinished) {
        return <div className="flex h-screen items-center justify-center">Loading Assessment...</div>;
    }

    // 3. UI: FINISHED STATE
    if (isFinished) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-4">{getIcon()}</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Complete</h2>
                    <p className="text-gray-600 mb-6">{finishMessage}</p>
                    <button
                        onClick={() => {
                            setShowThreatSelection(true);
                            setIncidentId(null);
                            setCurrentNode(null);
                            setIsFinished(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                    >
                        <RefreshCcw size={18} /> Start Over
                    </button>
                </div>
            </div>
        );
    }

    // 4. UI: ACTIVE NODE STATE
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

                <div className="bg-indigo-600 p-4">
                    <h1 className="text-white font-bold text-lg flex items-center gap-2">
                        <ShieldAlert size={20} /> Incident Response Assistant
                    </h1>
                </div>

                <div className="p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="mb-4 bg-gray-50 p-4 rounded-full">
                            {getIcon()}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 leading-snug">
                            {currentNode?.content}
                        </h2>
                    </div>

                    {/* 1. If Action Type: Show Resource Link */}
                    {currentNode?.type === 'ACTION' && currentNode.resourceLink && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-center">
                            <p className="text-sm text-red-600 mb-2 font-medium">External Action Required</p>
                            <a
                                href={currentNode.resourceLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold underline"
                            >
                                <Phone size={16} /> Open Resource / Call Helpline
                            </a>
                        </div>
                    )}

                    {/* 2. If Template Type: Show Form Placeholder */}
                    {currentNode?.type === 'TEMPLATE_FORM' && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm text-blue-700 mb-2 font-medium">Generate Complaint Letter</p>
                            <div className="grid grid-cols-1 gap-2">
                                <input value={templateInputs.BankName || ''} onChange={(e) => setTemplateInputs({ ...templateInputs, BankName: e.target.value })} type="text" placeholder="Bank Name ({{BankName}})" className="w-full p-2 border rounded" />
                                <input value={templateInputs.Amount || ''} onChange={(e) => setTemplateInputs({ ...templateInputs, Amount: e.target.value })} type="text" placeholder="Amount ({{Amount}})" className="w-full p-2 border rounded" />
                                <input value={templateInputs.Date || ''} onChange={(e) => setTemplateInputs({ ...templateInputs, Date: e.target.value })} type="text" placeholder="Date ({{Date}})" className="w-full p-2 border rounded" />
                                <input value={templateInputs.UserName || ''} onChange={(e) => setTemplateInputs({ ...templateInputs, UserName: e.target.value })} type="text" placeholder="Your Name ({{UserName}})" className="w-full p-2 border rounded" />
                                <input value={templateInputs.AccountNumber || ''} onChange={(e) => setTemplateInputs({ ...templateInputs, AccountNumber: e.target.value })} type="text" placeholder="Account Number ({{AccountNumber}})" className="w-full p-2 border rounded" />
                                <input value={templateInputs.TransactionID || ''} onChange={(e) => setTemplateInputs({ ...templateInputs, TransactionID: e.target.value })} type="text" placeholder="Transaction ID ({{TransactionID}})" className="w-full p-2 border rounded" />
                                <input value={templateInputs.Phone || ''} onChange={(e) => setTemplateInputs({ ...templateInputs, Phone: e.target.value })} type="text" placeholder="Phone ({{Phone}})" className="w-full p-2 border rounded" />
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                                <button disabled={isGenerating} onClick={handleGenerateTemplate} className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1 rounded">
                                    {isGenerating ? 'Generating...' : 'Generate Preview'}
                                </button>
                                {generatedText && (
                                    <button onClick={downloadText} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Download Text</button>
                                )}
                                <button disabled={isDownloadingPdf} onClick={downloadPdf} className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-3 py-1 rounded">
                                    {isDownloadingPdf ? 'Preparing PDF...' : 'Download PDF'}
                                </button>
                            </div>
                            {generatedText && (
                                <textarea className="mt-3 w-full h-48 p-2 border rounded text-sm" readOnly value={generatedText} />
                            )}
                        </div>
                    )}

                    {/* OPTIONS / BUTTONS */}
                    <div className="space-y-3 mt-6">
                        {loading ? (
                            <div className="text-center text-gray-400">Processing...</div>
                        ) : currentNode?.options && currentNode.options.length > 0 ? (
                            currentNode.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option.id)}
                                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex justify-between items-center group
                    ${option.label.toLowerCase().includes('no')
                                            ? 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
                                            : 'border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 font-medium'
                                        }`}
                                >
                                    <span>{option.label}</span>
                                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-600 mb-4">Process completed. No further actions available.</p>
                                <button
                                    onClick={() => {
                                        setShowThreatSelection(true);
                                        setIncidentId(null);
                                        setCurrentNode(null);
                                        setIsFinished(false);
                                        setTemplateInputs({});
                                        setGeneratedText("");
                                    }}
                                    className="flex items-center justify-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                                >
                                    <RefreshCcw size={18} /> Return to Home
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t">
                    ID: {incidentId?.slice(0, 8)}... • Secure Workflow
                </div>

            </div>
        </div>
    )
}

export default IncidentReportPage;