/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Save, Trash2, ArrowRight, Link as LinkIcon,
    Settings, AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/const';

interface Workflow {
    id: string;
    title: string;
    category: string;
    startNodeId: string | null;
}

interface Option {
    id: string;
    label: string;
    nextNodeId: string | null;
}

interface Node {
    id: string;
    title: string;
    content: string;
    type: 'QUESTION' | 'INFO' | 'ACTION' | 'TEMPLATE_FORM';
    resourceLink?: string;
    isStartNode?: boolean;
    options: Option[];
}

const AdminWorkflowEditor = () => {

    const [tokenValue] = useState(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (!token) {
            if (typeof window !== 'undefined') {
                window.location.href = "/admin/login";
            }
        }
        return `Bearer ${token}` || "";
    });

    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");

    const [nodes, setNodes] = useState<Node[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [newOptionLabel, setNewOptionLabel] = useState("");
    const [newOptionTarget, setNewOptionTarget] = useState("");

    const handleWorkflowSelect = useCallback(async (wfId: string) => {
        setSelectedWorkflowId(wfId);
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/workflow/${wfId}/nodes`, { headers: { 'Authorization': tokenValue } });
            if (!res.ok) throw new Error(`Failed to fetch nodes (${res.status})`);
            const data = await res.json();
            setNodes(data);
            setSelectedNode(null);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to fetch nodes.");
        } finally {
            setLoading(false);
        }
    }, [tokenValue]);


    useEffect(() => {
        let didSelect = false;
        const fetchWorkflows = async () => {
            setErrorMsg("");
            try {
                const res = await fetch(`${API_BASE_URL}/admin/workflows`, { 
                    headers: { 
                        'Authorization': `${tokenValue}` 
                    } 
                });
                if (!res.ok) throw new Error(`Failed to fetch workflows (${res.status})`);
                const data = await res.json();
                setWorkflows(data);
                if (data.length > 0 && !didSelect) {
                    setSelectedWorkflowId(data[0].id);
                    didSelect = true;
                }
            } catch (err: any) {
                setErrorMsg(err.message || "Failed to fetch workflows.");
            }
        };
        fetchWorkflows();
    }, [tokenValue]);

    // Fetch nodes when workflow selection changes
    useEffect(() => {
        if (!selectedWorkflowId) return;
        const fetchNodes = async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                const res = await fetch(`${API_BASE_URL}/admin/workflow/${selectedWorkflowId}/nodes`,
                    {
                        headers: {
                            'Authorization': `${tokenValue}` 
                        }
                    });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `Failed to fetch nodes (${res.status})`);
                }
                const data = await res.json();
                setNodes(data);
                setSelectedNode(null);
            } catch (err: any) {
                setErrorMsg(err.message || "Failed to fetch nodes.");
            } finally {
                setLoading(false);
            }
        };
        fetchNodes();
    }, [selectedWorkflowId, tokenValue]);

    // --- 3. CREATE NEW NODE ---
    const handleCreateNode = async () => {
        const newNodePayload = {
            workflowId: selectedWorkflowId,
            title: `new_node_${nodes.length + 1}`,
            content: "Enter question here...",
            type: "QUESTION"
        };

        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/node`, {
                method: 'POST',
                headers: { 'Authorization': `${tokenValue}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(newNodePayload)
            });
            if (!res.ok) throw new Error(`Failed to create node (${res.status})`);
            const savedNode = await res.json();
            await handleWorkflowSelect(selectedWorkflowId);
            setSelectedNode({ ...savedNode, options: [] });
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to create node.");
        }
    };

    const handleUpdateNode = async () => {
        if (!selectedNode) return;
        setStatusMsg("Saving...");
        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/node/${selectedNode.id}`, {
                method: 'PUT',
                headers: { 'Authorization': tokenValue, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: selectedNode.title,
                    content: selectedNode.content,
                    type: selectedNode.type,
                    resourceLink: selectedNode.resourceLink
                })
            });
            if (!res.ok) throw new Error(`Failed to update node (${res.status})`);
            const updatedList = nodes.map(n => n.id === selectedNode.id ? selectedNode : n);
            setNodes(updatedList);
            setStatusMsg("Saved!");
            setTimeout(() => setStatusMsg(""), 2000);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to update node.");
            setStatusMsg("");
        }
    };

    const handleAddOption = async () => {
        if (!selectedNode || !newOptionLabel) return;
        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/option`, {
                method: 'POST',
                headers: { 'Authorization': tokenValue, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentNodeId: selectedNode.id,
                    label: newOptionLabel,
                    nextNodeId: newOptionTarget || null
                })
            });
            if (!res.ok) throw new Error(`Failed to add option (${res.status})`);
            const res2 = await fetch(`${API_BASE_URL}/admin/workflow/${selectedWorkflowId}/nodes`, { headers: { 'Authorization': tokenValue } });
            if (!res2.ok) throw new Error(`Failed to refresh nodes (${res2.status})`);
            const data = await res2.json();
            setNodes(data);
            const updatedCurrent = data.find((n: Node) => n.id === selectedNode.id);
            setSelectedNode(updatedCurrent);
            setNewOptionLabel("");
            setNewOptionTarget("");
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to add option.");
        }
    };

    const handleDeleteOption = async (optId: string) => {
        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/option/${optId}`, {
                method: 'DELETE',
                headers: { 'Authorization': tokenValue }
            });
            if (!res.ok) throw new Error(`Failed to delete option (${res.status})`);
            const res2 = await fetch(`${API_BASE_URL}/admin/workflow/${selectedWorkflowId}/nodes`, { headers: { 'Authorization': tokenValue } });
            if (!res2.ok) throw new Error(`Failed to refresh nodes (${res2.status})`);
            const data = await res2.json();
            setNodes(data);
            setSelectedNode(data.find((n: Node) => n.id === selectedNode?.id));
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to delete option.");
        }
    };

    const handleSetStartNode = async () => {
        if (!selectedNode) return;
        setErrorMsg("");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/workflow/set-start`, {
                method: 'PUT',
                headers: { 'Authorization': tokenValue, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId: selectedWorkflowId,
                    nodeId: selectedNode.id
                })
            });
            if (!res.ok) throw new Error(`Failed to set start node (${res.status})`);
            alert("Start Node Updated!");
            handleWorkflowSelect(selectedWorkflowId);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to set start node.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {errorMsg && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-red-100 text-red-700 text-center p-2 text-sm font-bold">
                    {errorMsg}
                </div>
            )}

            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <label className="text-xs font-bold text-gray-500 uppercase">Select Workflow</label>
                    <select
                        className="w-full mt-1 p-2 border rounded font-medium"
                        value={selectedWorkflowId}
                        onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    >
                        {workflows.map(wf => (
                            <option key={wf.id} value={wf.id}>{wf.title} ({wf.category})</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? <p className="p-4 text-center text-gray-400">Loading nodes...</p> :
                        Array.isArray(nodes) && nodes.map((node) => (
                            <div
                                key={node.id}
                                onClick={() => setSelectedNode(node)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedNode?.id === node.id
                                    ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1 rounded">{node.title}</span>
                                    {node.isStartNode && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">START</span>}
                                </div>
                                <p className="text-sm font-medium text-gray-800 mt-1 line-clamp-2">{node.content}</p>
                                <div className="mt-2 flex gap-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><LinkIcon size={10} /> {node.options.length} Options</span>
                                    <span className="uppercase border px-1 rounded">{node.type}</span>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="p-4 border-t">
                    <button
                        onClick={handleCreateNode}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                        <Plus size={18} /> Create New Node
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
                {selectedNode ? (
                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <Settings size={18} /> Edit Node
                            </h2>
                            <div className="flex gap-2">
                                {!selectedNode.isStartNode && (
                                    <button onClick={handleSetStartNode} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                                        Set as Start Node
                                    </button>
                                )}
                                <button onClick={handleUpdateNode} className="flex items-center gap-1 bg-black text-white px-4 py-1.5 rounded hover:bg-gray-800">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Internal ID / Title</label>
                                <input
                                    type="text"
                                    value={selectedNode.title}
                                    onChange={(e) => setSelectedNode({ ...selectedNode, title: e.target.value })}
                                    className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Question / Content Text</label>
                                <textarea
                                    rows={3}
                                    value={selectedNode.content}
                                    onChange={(e) => setSelectedNode({ ...selectedNode, content: e.target.value })}
                                    className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Node Type</label>
                                    <select
                                        value={selectedNode.type}
                                        onChange={(e) => setSelectedNode({ ...selectedNode, type: e.target.value as any })}
                                        className="w-full mt-1 p-2 border rounded"
                                    >
                                        <option value="QUESTION">Question (Yes/No)</option>
                                        <option value="INFO">Info (Just Text)</option>
                                        <option value="ACTION">Action (Link/Call)</option>
                                        <option value="TEMPLATE_FORM">Template Form</option>
                                    </select>
                                </div>
                                {(selectedNode.type === 'ACTION' || selectedNode.type === 'INFO') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Resource URL / Phone</label>
                                        <input
                                            type="text"
                                            placeholder="https://... or tel:1930"
                                            value={selectedNode.resourceLink || ""}
                                            onChange={(e) => setSelectedNode({ ...selectedNode, resourceLink: e.target.value })}
                                            className="w-full mt-1 p-2 border rounded"
                                        />
                                    </div>
                                )}
                            </div>

                            <hr className="my-4" />

                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase mb-3 flex items-center gap-2">
                                    <LinkIcon size={16} /> Connections (Buttons)
                                </h3>

                                <div className="space-y-2 mb-4">
                                    {selectedNode.options.length === 0 && <p className="text-sm text-gray-400 italic">No options added. This node is a dead end.</p>}

                                    {selectedNode.options.map(opt => (
                                        <div key={opt.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded border">
                                            <span className="font-bold text-sm bg-white px-2 py-1 border rounded shadow-sm">{opt.label}</span>
                                            <ArrowRight size={14} className="text-gray-400" />
                                            <span className="text-sm text-indigo-600 font-medium truncate flex-1">
                                                {nodes.find(n => n.id === opt.nextNodeId)?.title || "End of Flow"}
                                            </span>
                                            <button onClick={() => handleDeleteOption(opt.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <p className="text-xs font-bold text-indigo-800 mb-2">ADD NEW CONNECTION</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Button Label (e.g. Yes)"
                                            value={newOptionLabel}
                                            onChange={(e) => setNewOptionLabel(e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded"
                                        />
                                        <select
                                            value={newOptionTarget}
                                            onChange={(e) => setNewOptionTarget(e.target.value)}
                                            className="flex-1 p-2 text-sm border rounded"
                                        >
                                            <option value="">(Select Next Node)</option>
                                            <option value="">-- END FLOW --</option>
                                            {nodes
                                                .filter(n => n.id !== selectedNode.id)
                                                .map(n => (
                                                    <option key={n.id} value={n.id}>Go to: {n.title}</option>
                                                ))}
                                        </select>
                                        <button
                                            onClick={handleAddOption}
                                            disabled={!newOptionLabel}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                        {statusMsg && <div className="bg-green-100 text-green-700 text-center p-2 text-sm font-bold">{statusMsg}</div>}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <AlertCircle size={48} className="mb-4 text-gray-300" />
                        <p>Select a node from the left sidebar to edit details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminWorkflowEditor;

/*
[
    {
        "id": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "Financial Fraud Response System",
        "category": "FINANCIAL_THREAT",
        "startNodeId": "1dd5e7fb-2282-4902-b847-847a3805ee8b",
        "nodes": [
            {
                "id": "1dd5e7fb-2282-4902-b847-847a3805ee8b",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_start",
                "content": "Have unauthorized funds been deducted from your account?",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": true
            },
            {
                "id": "b021301b-76d3-463e-a49b-8e1579acf25a",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_block_check",
                "content": "Have you blocked your bank account or debit/credit card?",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "2877d972-7141-4e7d-a4f0-faaed4cfd004",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_action_block_card",
                "content": "Block your card immediately! Use the link below to find your bank's helpline number.",
                "type": "ACTION",
                "resourceLink": "https://rbi.org.in/Scripts/CommonPersonDescriptions.aspx?Id=1443",
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "67621c6c-397d-4471-9722-44ebacb3beec",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_1930_check",
                "content": "Did you file a complaint on the 'National Cyber Crime Portal' (1930)?",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "6a87be1a-be91-4a5f-b5e0-26c7c21be856",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_action_1930",
                "content": "Dial 1930 immediately or report on cybercrime.gov.in. This is crucial during the 'Golden Hour' to freeze the funds.",
                "type": "ACTION",
                "resourceLink": "https://cybercrime.gov.in",
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "39180122-15e8-4431-a697-9ee3cb6dbd68",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_fir_check",
                "content": "Do you need to file an FIR at the police station or submit a written application to the bank?",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "162c40bc-2af9-43a9-a77f-3d06610e3298",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_template_generate",
                "content": "Fill in your details below, and we will generate a formal complaint letter for the Police/Bank.",
                "type": "TEMPLATE_FORM",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "bf4686a5-b7cc-4e6a-ac7c-6b6e7293b3d1",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_end_success",
                "content": "You have taken all necessary steps. Keep your Acknowledgement Number and FIR copy safe.",
                "type": "INFO",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "6bbccddc-8061-4879-9211-5d9ad6b05819",
                "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
                "title": "fin_prevention_tips",
                "content": "Do not panic. Change your passwords immediately and do not click on any unknown links.",
                "type": "INFO",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            }
        ]
    },
    {
        "id": "52256801-4612-4422-944e-e240390ca2b0",
        "title": "Social Media Harassment & Hacking",
        "category": "SOCIAL_MEDIA_VULNERABILITY",
        "startNodeId": "48a6c9d6-649e-418b-9826-8ecc986b54da",
        "nodes": [
            {
                "id": "48a6c9d6-649e-418b-9826-8ecc986b54da",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_start",
                "content": "Select the type of issue you are facing:",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": true
            },
            {
                "id": "6b550589-5725-4617-b346-0b83099f1410",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_harass_evidence",
                "content": "First Step: Secure the evidence. Have you taken screenshots of the chat, messages, and profile?",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "38438ef9-3cd4-4797-861f-5e00ccfa09fb",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_action_screenshot",
                "content": "Do NOT delete the chat yet! Take screenshots of the full conversation, the profile URL, and any photos shared.",
                "type": "INFO",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "67c0087b-18db-4e55-aee3-ad39dd2ad3aa",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_harass_block",
                "content": "Now 'Block' that user immediately and use the 'Report' button on the platform.",
                "type": "ACTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "c61d3954-13bb-4537-9f8d-3f094d92d929",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_legal_check",
                "content": "Is the threat severe (e.g., threat to leak private photos or physical harm)?",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "d96f8279-f827-466d-9fe8-b94c261d5409",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_cyber_report",
                "content": "You must report this to the Cyber Crime Portal immediately.",
                "type": "ACTION",
                "resourceLink": "https://cybercrime.gov.in",
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "b57375bb-8b1d-4631-9cb6-85a8d5fc25fc",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_end_safe",
                "content": "Stay alert. Review your account privacy settings and limit who can message you.",
                "type": "INFO",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "88a84dc3-4a3b-46fc-8817-a3e58a1e1cb5",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_hack_step1",
                "content": "Do you still have access to the email or phone number linked to the account?",
                "type": "QUESTION",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            },
            {
                "id": "dc9e7abe-5a5d-492a-b211-464e5e56c7e9",
                "workflowId": "52256801-4612-4422-944e-e240390ca2b0",
                "title": "sm_impersonation",
                "content": "Report the profile to the platform using your original ID proof.",
                "type": "INFO",
                "resourceLink": null,
                "templateId": null,
                "isStartNode": false
            }
        ]
    }
]

// Nodes for Financial Fraud Response System
[
    {
        "id": "67621c6c-397d-4471-9722-44ebacb3beec",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_1930_check",
        "content": "Did you file a complaint on the 'National Cyber Crime Portal' (1930)?",
        "type": "QUESTION",
        "resourceLink": null,
        "templateId": null,
        "isStartNode": false,
        "options": [
            {
                "id": "6c4afdec-1bd1-42fb-8a30-cc603b63b3aa",
                "nodeId": "67621c6c-397d-4471-9722-44ebacb3beec",
                "label": "Yes, filed it",
                "nextNodeId": "39180122-15e8-4431-a697-9ee3cb6dbd68",
                "requiredInput": null,
                "order": 0
            },
            {
                "id": "0875fadd-72d2-4cc0-9516-56aa3b050c37",
                "nodeId": "67621c6c-397d-4471-9722-44ebacb3beec",
                "label": "No",
                "nextNodeId": "6a87be1a-be91-4a5f-b5e0-26c7c21be856",
                "requiredInput": null,
                "order": 0
            }
        ]
    },
    {
        "id": "6a87be1a-be91-4a5f-b5e0-26c7c21be856",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_action_1930",
        "content": "Dial 1930 immediately or report on cybercrime.gov.in. This is crucial during the 'Golden Hour' to freeze the funds.",
        "type": "ACTION",
        "resourceLink": "https://cybercrime.gov.in",
        "templateId": null,
        "isStartNode": false,
        "options": [
            {
                "id": "0460941c-c9d8-4833-a014-cdf90e884e83",
                "nodeId": "6a87be1a-be91-4a5f-b5e0-26c7c21be856",
                "label": "Complaint filed",
                "nextNodeId": "39180122-15e8-4431-a697-9ee3cb6dbd68",
                "requiredInput": null,
                "order": 0
            }
        ]
    },
    {
        "id": "2877d972-7141-4e7d-a4f0-faaed4cfd004",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_action_block_card",
        "content": "Block your card immediately! Use the link below to find your bank's helpline number.",
        "type": "ACTION",
        "resourceLink": "https://rbi.org.in/Scripts/CommonPersonDescriptions.aspx?Id=1443",
        "templateId": null,
        "isStartNode": false,
        "options": [
            {
                "id": "05a33675-37d0-4622-a184-aca56ddb38bb",
                "nodeId": "2877d972-7141-4e7d-a4f0-faaed4cfd004",
                "label": "I have blocked it now",
                "nextNodeId": "67621c6c-397d-4471-9722-44ebacb3beec",
                "requiredInput": null,
                "order": 0
            }
        ]
    },
    {
        "id": "b021301b-76d3-463e-a49b-8e1579acf25a",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_block_check",
        "content": "Have you blocked your bank account or debit/credit card?",
        "type": "QUESTION",
        "resourceLink": null,
        "templateId": null,
        "isStartNode": false,
        "options": [
            {
                "id": "095b2492-92c3-4a09-b570-526dcba163d0",
                "nodeId": "b021301b-76d3-463e-a49b-8e1579acf25a",
                "label": "Yes, I have blocked it",
                "nextNodeId": "67621c6c-397d-4471-9722-44ebacb3beec",
                "requiredInput": null,
                "order": 0
            },
            {
                "id": "424f0e28-e886-4fdc-9742-5a4eb2ba648e",
                "nodeId": "b021301b-76d3-463e-a49b-8e1579acf25a",
                "label": "No, not yet",
                "nextNodeId": "2877d972-7141-4e7d-a4f0-faaed4cfd004",
                "requiredInput": null,
                "order": 0
            }
        ]
    },
    {
        "id": "bf4686a5-b7cc-4e6a-ac7c-6b6e7293b3d1",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_end_success",
        "content": "You have taken all necessary steps. Keep your Acknowledgement Number and FIR copy safe.",
        "type": "INFO",
        "resourceLink": null,
        "templateId": null,
        "isStartNode": false,
        "options": []
    },
    {
        "id": "39180122-15e8-4431-a697-9ee3cb6dbd68",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_fir_check",
        "content": "Do you need to file an FIR at the police station or submit a written application to the bank?",
        "type": "QUESTION",
        "resourceLink": null,
        "templateId": null,
        "isStartNode": false,
        "options": [
            {
                "id": "28ca5b75-f6d1-4b68-8017-8591ca8ab604",
                "nodeId": "39180122-15e8-4431-a697-9ee3cb6dbd68",
                "label": "Yes, need to write FIR/Letter",
                "nextNodeId": "162c40bc-2af9-43a9-a77f-3d06610e3298",
                "requiredInput": null,
                "order": 0
            },
            {
                "id": "fb1d6d33-2a64-4815-ab3d-9c91afd0d036",
                "nodeId": "39180122-15e8-4431-a697-9ee3cb6dbd68",
                "label": "No, already done",
                "nextNodeId": "bf4686a5-b7cc-4e6a-ac7c-6b6e7293b3d1",
                "requiredInput": null,
                "order": 0
            }
        ]
    },
    {
        "id": "6bbccddc-8061-4879-9211-5d9ad6b05819",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_prevention_tips",
        "content": "Do not panic. Change your passwords immediately and do not click on any unknown links.",
        "type": "INFO",
        "resourceLink": null,
        "templateId": null,
        "isStartNode": false,
        "options": []
    },
    {
        "id": "1dd5e7fb-2282-4902-b847-847a3805ee8b",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_start",
        "content": "Have unauthorized funds been deducted from your account?",
        "type": "QUESTION",
        "resourceLink": null,
        "templateId": null,
        "isStartNode": true,
        "options": [
            {
                "id": "96061802-7643-48a4-9e42-977692dacbef",
                "nodeId": "1dd5e7fb-2282-4902-b847-847a3805ee8b",
                "label": "Yes, money deducted",
                "nextNodeId": "b021301b-76d3-463e-a49b-8e1579acf25a",
                "requiredInput": null,
                "order": 0
            },
            {
                "id": "4bcd9533-8ac7-4ff1-8e00-724f8d140153",
                "nodeId": "1dd5e7fb-2282-4902-b847-847a3805ee8b",
                "label": "No, just suspicious",
                "nextNodeId": "6bbccddc-8061-4879-9211-5d9ad6b05819",
                "requiredInput": null,
                "order": 0
            }
        ]
    },
    {
        "id": "162c40bc-2af9-43a9-a77f-3d06610e3298",
        "workflowId": "53be0657-f10e-4a03-a7e0-6677f835ab8c",
        "title": "fin_template_generate",
        "content": "Fill in your details below, and we will generate a formal complaint letter for the Police/Bank.",
        "type": "TEMPLATE_FORM",
        "resourceLink": null,
        "templateId": null,
        "isStartNode": false,
        "options": [
            {
                "id": "b9601187-bc69-48eb-a16e-db669d303bb2",
                "nodeId": "162c40bc-2af9-43a9-a77f-3d06610e3298",
                "label": "Download Complete",
                "nextNodeId": "bf4686a5-b7cc-4e6a-ac7c-6b6e7293b3d1",
                "requiredInput": null,
                "order": 0
            }
        ]
    }
]
*/