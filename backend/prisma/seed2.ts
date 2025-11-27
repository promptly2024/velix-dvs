import { PrismaClient, AssessmentCategory, WorkflowNodeType } from '@prisma/client'

const prisma = new PrismaClient()
// to run this seed file: npx prisma db seed --preview-feature or npx ts-node prisma/seed2.ts

// 1. HELPER DATA (Logic Flow Definitions)

const WORKFLOW_DATA = [
    // THREAT 1: FINANCIAL THREAT (Detailed Flow)
    {
        category: AssessmentCategory.FINANCIAL_THREAT,
        title: "Financial Fraud Response System",
        description: "Steps to recover lost money and secure accounts.",
        nodes: [
            {
                id: "fin_start", // Internal ID for linking
                text: "Have unauthorized funds been deducted from your account?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "Yes, money deducted", nextNodeId: "fin_block_check" },
                    { label: "No, just suspicious", nextNodeId: "fin_prevention_tips" }
                ]
            },
            // --- BRANCH: YES (Money Lost) ---
            {
                id: "fin_block_check",
                text: "Have you blocked your bank account or debit/credit card?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, I have blocked it", nextNodeId: "fin_1930_check" },
                    { label: "No, not yet", nextNodeId: "fin_action_block_card" }
                ]
            },
            {
                id: "fin_action_block_card",
                text: "Block your card immediately! Use the link below to find your bank's helpline number.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://rbi.org.in/Scripts/CommonPersonDescriptions.aspx?Id=1443", // List of bank numbers
                options: [
                    { label: "I have blocked it now", nextNodeId: "fin_1930_check" }
                ]
            },
            {
                id: "fin_1930_check",
                text: "Did you file a complaint on the 'National Cyber Crime Portal' (1930)?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, filed it", nextNodeId: "fin_fir_check" },
                    { label: "No", nextNodeId: "fin_action_1930" }
                ]
            },
            {
                id: "fin_action_1930",
                text: "Dial 1930 immediately or report on cybercrime.gov.in. This is crucial during the 'Golden Hour' to freeze the funds.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://cybercrime.gov.in",
                options: [
                    { label: "Complaint filed", nextNodeId: "fin_fir_check" }
                ]
            },
            {
                id: "fin_fir_check",
                text: "Do you need to file an FIR at the police station or submit a written application to the bank?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, need to write FIR/Letter", nextNodeId: "fin_template_generate" },
                    { label: "No, already done", nextNodeId: "fin_end_success" }
                ]
            },
            {
                id: "fin_template_generate",
                text: "Fill in your details below, and we will generate a formal complaint letter for the Police/Bank.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_bank_fraud", // Links to template table
                options: [
                    { label: "Download Complete", nextNodeId: "fin_end_success" }
                ]
            },
            {
                id: "fin_end_success",
                text: "You have taken all necessary steps. Keep your Acknowledgement Number and FIR copy safe.",
                type: WorkflowNodeType.INFO,
                options: [] // End of flow
            },
            // --- BRANCH: NO (Prevention) ---
            {
                id: "fin_prevention_tips",
                text: "Do not panic. Change your passwords immediately and do not click on any unknown links.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // ---------------------------------------------------------
    // THREAT 2: SOCIAL MEDIA VULNERABILITY (Detailed Flow)
    // ---------------------------------------------------------
    {
        category: AssessmentCategory.SOCIAL_MEDIA_VULNERABILITY,
        title: "Social Media Harassment & Hacking",
        description: "Steps for account recovery, reporting impersonation, or bullying.",
        nodes: [
            {
                id: "sm_start",
                text: "Select the type of issue you are facing:",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "My account got hacked", nextNodeId: "sm_hack_step1" },
                    { label: "Someone is blackmailing/harassing me", nextNodeId: "sm_harass_evidence" },
                    { label: "Fake profile created (Impersonation)", nextNodeId: "sm_impersonation" }
                ]
            },
            // --- BRANCH: HARASSMENT ---
            {
                id: "sm_harass_evidence",
                text: "First Step: Secure the evidence. Have you taken screenshots of the chat, messages, and profile?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, I have screenshots", nextNodeId: "sm_harass_block" },
                    { label: "No, let me take them", nextNodeId: "sm_action_screenshot" }
                ]
            },
            {
                id: "sm_action_screenshot",
                text: "Do NOT delete the chat yet! Take screenshots of the full conversation, the profile URL, and any photos shared.",
                type: WorkflowNodeType.INFO,
                options: [
                    { label: "Done, captured evidence", nextNodeId: "sm_harass_block" }
                ]
            },
            {
                id: "sm_harass_block",
                text: "Now 'Block' that user immediately and use the 'Report' button on the platform.",
                type: WorkflowNodeType.ACTION,
                options: [
                    { label: "Reported and Blocked", nextNodeId: "sm_legal_check" }
                ]
            },
            {
                id: "sm_legal_check",
                text: "Is the threat severe (e.g., threat to leak private photos or physical harm)?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, it's serious", nextNodeId: "sm_cyber_report" },
                    { label: "No, just spam/trolling", nextNodeId: "sm_end_safe" }
                ]
            },
            {
                id: "sm_cyber_report",
                text: "You must report this to the Cyber Crime Portal immediately.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://cybercrime.gov.in",
                options: [
                    { label: "Process Completed", nextNodeId: "sm_end_safe" }
                ]
            },
            {
                id: "sm_end_safe",
                text: "Stay alert. Review your account privacy settings and limit who can message you.",
                type: WorkflowNodeType.INFO,
                options: []
            },
            // --- BRANCH: HACKING (Placeholder logic) ---
            {
                id: "sm_hack_step1",
                text: "Do you still have access to the email or phone number linked to the account?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Return to Menu", nextNodeId: "sm_start" }
                ]
            },
            // --- BRANCH: IMPERSONATION (Placeholder logic) ---
            {
                id: "sm_impersonation",
                text: "Report the profile to the platform using your original ID proof.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    }
];

const TEMPLATES = [
    {
        id: "temp_bank_fraud",
        name: "Bank Fraud Complaint Letter",
        body: `To,
The Branch Manager,
{{BankName}},

Subject: Reporting Unauthorized Transaction of Rs. {{Amount}}

Sir/Ma'am,
I am {{UserName}}, holding account number {{AccountNumber}}. 
I want to report an unauthorized transaction of Rs. {{Amount}} on {{Date}}. 
I have not shared my OTP or PIN with anyone.

Please block my card/account immediately to prevent further loss.

Transaction ID: {{TransactionID}}

Sincerely,
{{UserName}}
{{Phone}}`
    }
];

// ==========================================
// 2. MAIN SEEDING FUNCTION
// ==========================================

async function main() {
    console.log('🌱 Starting Seeding Process (English)...');

    // A. Clear old data 
    // Warning: This deletes existing workflow data to prevent duplicates
    await prisma.workflowOption.deleteMany({});
    await prisma.workflowNode.deleteMany({});
    await prisma.incidentWorkflow.deleteMany({});
    await prisma.responseTemplate.deleteMany({});

    console.log('🧹 Old workflow data cleared.');

    // B. Seed Templates first
    for (const t of TEMPLATES) {
        await prisma.responseTemplate.create({
            data: {
                id: t.id,
                name: t.name,
                body: t.body
            }
        })
    }
    console.log('📝 Templates seeded.');

    // C. Seed Workflows & Nodes
    for (const workflowData of WORKFLOW_DATA) {
        console.log(`🚀 Seeding Workflow: ${workflowData.title}`);

        // 1. Create Workflow Container
        const workflow = await prisma.incidentWorkflow.create({
            data: {
                category: workflowData.category,
                title: workflowData.title,
                description: workflowData.description,
            }
        });

        // 2. Create All Nodes (Store ID map for linking)
        const idMap = new Map<string, string>();

        for (const node of workflowData.nodes) {
            const dbNode = await prisma.workflowNode.create({
                data: {
                    workflowId: workflow.id,
                    title: node.id,
                    content: node.text,
                    type: node.type,
                    resourceLink: node.resourceLink || null,
                    // templateId: node.templateId || null,
                    isStartNode: node.isStartNode || false
                }
            });

            idMap.set(node.id, dbNode.id);

            // If it's the start node, update workflow reference
            if (node.isStartNode) {
                await prisma.incidentWorkflow.update({
                    where: { id: workflow.id },
                    data: { startNodeId: dbNode.id }
                });
            }
        }

        // 3. Create Options and Link Nodes
        for (const node of workflowData.nodes) {
            const parentNodeUUID = idMap.get(node.id);

            if (node.options && node.options.length > 0) {
                for (const option of node.options) {
                    const nextNodeUUID = option.nextNodeId ? idMap.get(option.nextNodeId) : null;

                    await prisma.workflowOption.create({
                        data: {
                            nodeId: parentNodeUUID!,
                            label: option.label,
                            nextNodeId: nextNodeUUID
                        }
                    });
                }
            }
            console.log(`   - Node '${node.id}' with options seeded.`);
        }
    }

    console.log('✅ Seeding Completed Successfully!');
}

main()
    .catch((e) => {
        console.error(e)
        console.log('\n❌ Seeding Failed. See error above.')
    })
    .finally(async () => {
        await prisma.$disconnect()
        console.log('🌿 Prisma Client Disconnected.')
    })

/** jaha se chhode wahi se khule
 * Template download ho har jagah jaha required ho
 * 
 * Admin Login
 * User Management (List, Deactivate, Role Change)
 * Game create and edit (CRUD)
 * Guardian mode 
 * 
*/
