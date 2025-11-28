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
            // BRANCH: YES (Money Lost)
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
                resourceLink: "https://rbi.org.in/",
                options: [
                    { label: "I have blocked it now", nextNodeId: "fin_1930_check" }
                ]
            },
            {
                id: "fin_1930_check",
                text: "Did you file a complaint on the 'National Cyber Crime Portal' (1930)?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, filed it", nextNodeId: "fin_evidence" },
                    { label: "No", nextNodeId: "fin_action_1930" }
                ]
            },
            {
                id: "fin_action_1930",
                text: "Dial 1930 immediately or report on cybercrime.gov.in. This is crucial during the 'Golden Hour' to freeze the funds.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://cybercrime.gov.in",
                options: [
                    { label: "Complaint filed", nextNodeId: "fin_evidence" }
                ]
            },
            {
                id: "fin_evidence",
                text: "Evidence Checklist: 1) Screenshot of SMS/Email for the unauthorized transaction. 2) Mini statement or bank app screenshot. 3) Call/Chat logs with bank. Keep these ready for FIR/Bank letter.",
                type: WorkflowNodeType.INFO,
                options: [ { label: "Next", nextNodeId: "fin_fir_check" } ]
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
            // BRANCH: NO (Prevention)
            {
                id: "fin_prevention_tips",
                text: "Do not panic. Change your passwords immediately and do not click on any unknown links.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // 
    // THREAT 2: SOCIAL MEDIA VULNERABILITY (Detailed Flow)

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
            // BRANCH: HARASSMENT
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
            // BRANCH: HACKING (Placeholder logic)
            {
                id: "sm_hack_step1",
                text: "Do you still have access to the email or phone number linked to the account?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Show Recovery Steps", nextNodeId: "sm_hack_platform" },
                    { label: "Return to Menu", nextNodeId: "sm_start" }
                ]
            },
            {
                id: "sm_hack_platform",
                text: "Select the platform to view official recovery steps",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Instagram", nextNodeId: "sm_hack_instagram" },
                    { label: "Facebook", nextNodeId: "sm_hack_facebook" },
                    { label: "X / Twitter", nextNodeId: "sm_hack_twitter" },
                    { label: "Google Account (Gmail)", nextNodeId: "sm_hack_google" },
                    { label: "WhatsApp", nextNodeId: "sm_hack_whatsapp" },
                    { label: "Other / Not listed", nextNodeId: "sm_support_portal" }
                ]
            },
            {
                id: "sm_hack_instagram",
                text: "Instagram Recovery: 1) Open the app → Get help logging in → Need more help. 2) Use the email/phone on file to verify. 3) If changed, request a security code and identity verification.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://help.instagram.com/149494825257596",
                options: [{ label: "Done / Back", nextNodeId: "sm_end_safe" }]
            },
            {
                id: "sm_hack_facebook",
                text: "Facebook Recovery: Use facebook.com/hacked → Secure your account → review devices, email/phone, and 2FA settings.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://www.facebook.com/hacked",
                options: [{ label: "Done / Back", nextNodeId: "sm_end_safe" }]
            },
            {
                id: "sm_hack_twitter",
                text: "X/Twitter Recovery: Request a password reset or file a hacked-account report if email/phone changed.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://help.x.com/en/forms/account-access/regain-access/hacked-or-compromised",
                options: [{ label: "Done / Back", nextNodeId: "sm_end_safe" }]
            },
            {
                id: "sm_hack_google",
                text: "Google Account Recovery: Go to g.co/recover → answer known questions → add recovery email/phone once restored.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://support.google.com/accounts/answer/6294825",
                options: [{ label: "Done / Back", nextNodeId: "sm_end_safe" }]
            },
            {
                id: "sm_hack_whatsapp",
                text: "WhatsApp Recovery: Log in with your number → verify via SMS → if unauthorized, email support to deactivate temporarily.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://faq.whatsapp.com/1131652977717250",
                options: [{ label: "Done / Back", nextNodeId: "sm_end_safe" }]
            },
            {
                id: "sm_support_portal",
                text: "Use the platform’s official Help Center and search ‘Hacked account’ / ‘Recover account’. Avoid third-party ‘unlock’ services.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Back", nextNodeId: "sm_end_safe" }]
            },
            // BRANCH: IMPERSONATION
            {
                id: "sm_impersonation",
                text: "Report the profile to the platform using your original ID proof.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },


    // THREAT 3: IDENTITY THEFT RISK (Detailed & Victim Centric)

    {
        category: AssessmentCategory.IDENTITY_THEFT_RISK,
        title: "Identity Theft Recovery Assistant",
        description: "If someone is using your name/ID to take loans or SIM cards.",
        nodes: [
            {
                id: "id_start",
                text: "Identity theft can be scary, but we can fix it. Tell us, how did you find out?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "Recovery agents are calling me for a loan I didn't take", nextNodeId: "id_loan_fraud" },
                    { label: "I found unknown accounts on my Credit Report", nextNodeId: "id_loan_fraud" },
                    { label: "My physical Wallet/ID Documents are lost/stolen", nextNodeId: "id_lost_docs" },
                    { label: "I suspect fake SIM cards in my name", nextNodeId: "id_sim_check" }
                ]
            },

            // BRANCH 1: LOAN FRAUD (Financially Scariest)
            {
                id: "id_loan_fraud",
                text: "First, don't panic. You are NOT liable for fraud if you report it. Have you formally disputed this with the Bank/Lender?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, I complained", nextNodeId: "id_loan_ombudsman" },
                    { label: "No, I don't know how", nextNodeId: "id_loan_template" }
                ]
            },
            {
                id: "id_loan_template",
                text: "We need to send a formal 'Dispute Letter' to the bank immediately. Fill in the details below.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_id_dispute",
                options: [
                    { label: "Letter Generated", nextNodeId: "id_cibil_dispute" }
                ]
            },
            {
                id: "id_cibil_dispute",
                text: "Great. Now, you also need to inform the Credit Bureau (CIBIL/Experian) to remove this entry from your report.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://www.cibil.com/",
                options: [
                    { label: "I will do this", nextNodeId: "id_police_cyber" }
                ]
            },
            {
                id: "id_loan_ombudsman",
                text: "If the bank hasn't resolved it in 30 days, approach the RBI Ombudsman.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://cms.rbi.org.in/",
                options: [{ label: "Okay", nextNodeId: "id_end" }]
            },

            // BRANCH 2: LOST DOCUMENTS (Prevention)
            {
                id: "id_lost_docs",
                text: "Losing IDs is risky. Have you filed a 'Lost Article Report' (NCR) with the police? This proves your innocence if IDs are misused later.",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, I have the slip", nextNodeId: "id_lock_biometrics" },
                    { label: "No, how to do it?", nextNodeId: "id_action_lost_report" }
                ]
            },
            {
                id: "id_action_lost_report",
                text: "You can file a 'Lost Report' online in most states without visiting the station. Do this NOW.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://digitalpolice.gov.in/",
                options: [{ label: "Filed it", nextNodeId: "id_lock_biometrics" }]
            },
            {
                id: "id_lock_biometrics",
                text: "Crucial Step: Lock your Aadhaar Biometrics so no one can use your fingerprint for verification.\nSteps:\n1) Visit myaadhaar.uidai.gov.in and Sign In.\n2) Go to ‘Aadhaar Lock/Unlock’ → Biometrics.\n3) Turn ON ‘Lock Biometrics’.\n4) Confirm via OTP.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://myaadhaar.uidai.gov.in/",
                options: [{ label: "Biometrics Locked", nextNodeId: "id_end" }]
            },

            // BRANCH 3: FAKE SIM CARDS
            {
                id: "id_sim_check",
                text: "The Govt of India has a portal (TAFCOP) to check all mobile numbers linked to your Aadhaar.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://tafcop.sancharsaathi.gov.in/",
                options: [
                    { label: "Found unknown numbers & Reported", nextNodeId: "id_end" },
                    { label: "All numbers are mine", nextNodeId: "id_end" }
                ]
            },

            // COMMON END
            {
                id: "id_police_cyber",
                text: "Finally, report this identity theft on the National Cyber Crime Portal as 'Identity Theft'.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://cybercrime.gov.in",
                options: [{ label: "Done", nextNodeId: "id_end" }]
            },
            {
                id: "id_end",
                text: "You have secured your identity. Keep checking your SMS and Email for alerts.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // THREAT 4: PROFESSIONAL EXPOSURE (Career Protection)

    {
        category: AssessmentCategory.PROFESSIONAL_EXPOSURE,
        title: "Workplace Security Incident Response",
        description: "Guidance for work email hacks, data leaks, or device theft.",
        nodes: [
            {
                id: "prof_start",
                text: "We understand you are worried about your job. To give the best advice, tell us what happened?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "My Work Email/Slack is Hacked", nextNodeId: "prof_account_hack" },
                    { label: "I accidentally leaked sensitive data", nextNodeId: "prof_data_leak" },
                    { label: "I lost my Office Laptop/Phone", nextNodeId: "prof_device_lost" }
                ]
            },

            // BRANCH 1: HACKED ACCOUNT
            {
                id: "prof_account_hack",
                text: "Can you still login to your account?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes", nextNodeId: "prof_change_pwd" },
                    { label: "No, locked out", nextNodeId: "prof_notify_it_urgent" }
                ]
            },
            {
                id: "prof_change_pwd",
                text: "Change your password IMMEDIATELY using a different device. Enable MFA if not active.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Done", nextNodeId: "prof_notify_it_urgent" }]
            },

            // BRANCH 2: DATA LEAK (Human Error)
            {
                id: "prof_data_leak",
                text: "Did you send the data to the wrong email or upload it publicly?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Wrong Email Recipient", nextNodeId: "prof_recall_email" },
                    { label: "Public Upload (GitHub/Drive)", nextNodeId: "prof_delete_public" }
                ]
            },
            {
                id: "prof_recall_email",
                text: "Attempt to use the 'Recall Message' feature if using Outlook. Send a follow-up email asking the recipient to delete it immediately without reading.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Next", nextNodeId: "prof_report_protocol" }]
            },
            {
                id: "prof_delete_public",
                text: "Make the repository/folder Private immediately. Check logs to see if anyone downloaded it.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Next", nextNodeId: "prof_report_protocol" }]
            },

            // CRITICAL STEP: REPORTING
            {
                id: "prof_notify_it_urgent",
                text: "You MUST notify your IT Security Team / CISO immediately.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Why? I might get fired.", nextNodeId: "prof_why_report" }]
            },
            {
                id: "prof_why_report",
                text: "Hiding a breach is often grounds for immediate termination and legal action. Reporting it shows responsibility. Do you want a template to report this professionally?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, help me write it", nextNodeId: "prof_report_template" },
                    { label: "I will manage", nextNodeId: "prof_legal_check" }
                ]
            },
            {
                id: "prof_report_template",
                text: "Use this professional format to inform your manager/IT. It admits the mistake but highlights your quick action.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_internal_incident",
                options: [{ label: "Report Sent", nextNodeId: "prof_legal_check" }]
            },

            // LEGAL
            {
                id: "prof_legal_check",
                text: "Review your Employment Contract or NDA regarding 'Data Breach'. It helps to know your liability limits.",
                type: WorkflowNodeType.INFO,
                options: []
            },

            // BRANCH 3: DEVICE LOST
            {
                id: "prof_device_lost",
                text: "Contact IT immediately to 'Remote Wipe' the device. File a police lost report for the asset.",
                type: WorkflowNodeType.ACTION,
                options: []
            }
        ]
    },

    // THREAT 5: HEALTHCARE PRIVACY RISK

    {
        category: AssessmentCategory.HEALTHCARE_PRIVACY_RISK,
        title: "Medical Data Breach Response",
        description: "If your medical reports, insurance data, or health records are leaked.",
        nodes: [
            {
                id: "health_start",
                text: "Medical privacy is your right. Tell us, what is the exact issue?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "My Medical Reports/Status is leaked publicly", nextNodeId: "health_leak_source" },
                    { label: "I got an SMS for an Insurance Claim I didn't make", nextNodeId: "health_insurance_fraud" },
                    { label: "A Hospital/Lab is refusing to delete my data", nextNodeId: "health_right_erasure" }
                ]
            },

            // BRANCH 1: INSURANCE FRAUD
            {
                id: "health_insurance_fraud",
                text: "This is urgent. Someone might be using your policy limit. Have you informed your TPA (Third Party Administrator)?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "No, give me the number", nextNodeId: "health_tpa_list" },
                    { label: "Yes, informed them", nextNodeId: "health_block_id" }
                ]
            },
            {
                id: "health_tpa_list",
                text: "Find your TPA/Insurer contact number from your Health Card or Policy Document. Call them and say 'I want to report a fraudulent claim'.",
                type: WorkflowNodeType.INFO, // Could be ACTION if we had a database of TPAs
                options: [{ label: "Done, reported", nextNodeId: "health_block_id" }]
            },
            {
                id: "health_block_id",
                text: "Ask them to temporarily 'Freeze' your Health ID card / UHID so no new claims can be generated.",
                type: WorkflowNodeType.INFO,
                options: []
            },

            // BRANCH 2: DATA LEAK / STIGMA
            {
                id: "health_leak_source",
                text: "Where is the data visible?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "On a Hospital/Lab Website", nextNodeId: "health_notice_hospital" },
                    { label: "On Social Media/WhatsApp", nextNodeId: "health_social_takedown" }
                ]
            },
            {
                id: "health_social_takedown",
                text: "If it's on social media, use the 'Report -> Harassment/Private Info' option on that post immediately.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Next", nextNodeId: "health_notice_hospital" }]
            },
            {
                id: "health_notice_hospital",
                text: "The Hospital/Lab is legally responsible for your data. You should send a formal demand to their 'Grievance Officer' to remove it.",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Generate Demand Letter", nextNodeId: "health_template_generate" }
                ]
            },
            {
                id: "health_template_generate",
                text: "Fill details to generate a 'Data Deletion Demand' letter under the Digital Personal Data Protection (DPDP) Act.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_health_data_deletion",
                options: [{ label: "Letter Ready", nextNodeId: "health_end" }]
            },

            // BRANCH 3: RIGHT TO ERASURE
            {
                id: "health_right_erasure",
                text: "Under the new Data Protection laws, you have the 'Right to Erasure'. Use the template above to enforce this.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Go to Template", nextNodeId: "health_template_generate" }]
            },

            {
                id: "health_end",
                text: "Keep a copy of this communication. If they don't act in 72 hours, you can file a complaint with the Data Protection Board.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // THREAT 6: LOCATION PRIVACY THREAT (High Risk / Physical Safety)

    {
        category: AssessmentCategory.LOCATION_PRIVACY_THREAT,
        title: "Stalking & Location Tracking Detection",
        description: "Detect hidden trackers (AirTags), spyware, or unwanted location sharing.",
        nodes: [
            {
                id: "loc_start",
                text: "⚠️ SAFETY CHECK: Are you in immediate physical danger right now?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "YES, I am unsafe", nextNodeId: "loc_emergency_sos" },
                    { label: "No, but I suspect digital tracking", nextNodeId: "loc_tracking_type" }
                ]
            },

            // BRANCH 1: EMERGENCY
            {
                id: "loc_emergency_sos",
                text: "Stop using this app. Go to a public place immediately. Dial 112 or 100 now.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "tel:112",
                options: []
            },

            // BRANCH 2: INVESTIGATION
            {
                id: "loc_tracking_type",
                text: "Why do you think you are being tracked?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Someone knows my exact location", nextNodeId: "loc_check_sharing" },
                    { label: "I found an unknown device (AirTag/Tracker)", nextNodeId: "loc_airtag_found" },
                    { label: "My battery drains fast / Phone heats up", nextNodeId: "loc_spyware_check" }
                ]
            },

            // SUB-BRANCH: GOOGLE/APPLE SHARING
            {
                id: "loc_check_sharing",
                text: "Most stalking happens via 'Location Sharing' left ON. Let's check Google Maps.",
                type: WorkflowNodeType.ACTION,
                // Instructions for user
                content: "Open Google Maps -> Click Profile Icon -> 'Location Sharing'. Is anyone listed there?",
                options: [
                    { label: "Yes, removed them", nextNodeId: "loc_check_whatsapp" },
                    { label: "No one there", nextNodeId: "loc_check_whatsapp" }
                ]
            },
            {
                id: "loc_check_whatsapp",
                text: "Check WhatsApp -> Settings -> Privacy -> Live Location. Is it sharing?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Stopped sharing", nextNodeId: "loc_pass_reset" },
                    { label: "Not sharing", nextNodeId: "loc_spyware_check" }
                ]
            },
            {
                id: "loc_pass_reset",
                text: "If someone enabled this, they have access to your phone. Change your lock screen PIN immediately.",
                type: WorkflowNodeType.INFO,
                options: []
            },

            // SUB-BRANCH: SPYWARE
            {
                id: "loc_spyware_check",
                text: "Spyware is hard to find. Have you installed any apps recently outside of Play Store (APK files)?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Maybe / Not sure", nextNodeId: "loc_factory_reset" },
                    { label: "No", nextNodeId: "loc_permissions" }
                ]
            },
            {
                id: "loc_factory_reset",
                text: "The only 100% way to remove Spyware is a 'Factory Reset'. Back up your photos, but do NOT back up apps. Reset the phone.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "I will do this", nextNodeId: "loc_police_stalking" }]
            },

            // SUB-BRANCH: AIRTAGS / PHYSICAL TRACKERS
            {
                id: "loc_airtag_found",
                text: "If you found a tracker, DO NOT throw it away. It is evidence.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Next", nextNodeId: "loc_disable_tracker" }]
            },
            {
                id: "loc_disable_tracker",
                text: "You can remove the battery to stop tracking. Take a photo of the serial number inside.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Next", nextNodeId: "loc_police_stalking" }]
            },

            // LEGAL ACTION
            {
                id: "loc_police_stalking",
                text: "Stalking (Physical or Cyber) is a serious crime under Section 354D IPC. You should file a police complaint.",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Generate Complaint Letter", nextNodeId: "loc_template_stalking" },
                    { label: "I will visit station", nextNodeId: "loc_end_safe" },
                    { label: "See Safety Tips", nextNodeId: "loc_safety_plan" }
                ]
            },
            {
                id: "loc_template_stalking",
                text: "Use this template to file a complaint at the nearest police station.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_stalking_complaint",
                options: [{ label: "Done", nextNodeId: "loc_end_safe" }]
            },
            {
                id: "loc_safety_plan",
                text: "Safety Plan: 1) Share your live location with a trusted contact. 2) Prefer public places. 3) Keep emergency numbers (112/100) ready. 4) Preserve evidence; do not confront alone.",
                type: WorkflowNodeType.INFO,
                options: [ { label: "Understood", nextNodeId: "loc_end_safe" } ]
            },
            {
                id: "loc_end_safe",
                text: "Stay safe. Trust your instincts. If you feel unsafe, call the police.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // THREAT 7: COMMUNICATION SECURITY (SIM Swap & Privacy)

    {
        category: AssessmentCategory.COMMUNICATION_SECURITY,
        title: "SIM Swap & Call Privacy Protection",
        description: "Urgent steps if your SIM stops working or you suspect call tapping.",
        nodes: [
            {
                id: "comm_start",
                text: "What seems to be the problem with your communication?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "My SIM suddenly has 'No Signal' (SIM Swap Risk)", nextNodeId: "comm_sim_swap_urgent" },
                    { label: "I suspect my calls are being forwarded/tapped", nextNodeId: "comm_call_fwd_check" },
                    { label: "Receiving bombarding OTPs (SMS Bombing)", nextNodeId: "comm_sms_bombing" }
                ]
            },

            // BRANCH 1: SIM SWAP (CRITICAL)
            {
                id: "comm_sim_swap_urgent",
                text: "⚠️ DANGER: If your SIM stopped working without reason, hackers might have cloned it to steal Bank OTPs.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "What should I do?", nextNodeId: "comm_action_operator" }]
            },
            {
                id: "comm_action_operator",
                text: "IMMEDIATE ACTIONS:\n1. Call your Operator (Airtel/Jio/Vi) from another phone to BLOCK the SIM.\n2. Call your Bank to freeze accounts.",
                type: WorkflowNodeType.ACTION,
                options: [
                    { label: "I have blocked SIM & Bank", nextNodeId: "comm_sim_complaint" }
                ]
            },
            {
                id: "comm_sim_complaint",
                text: "You must visit the operator store to get a new SIM and file a formal complaint.\nNext: Report the incident to DoT and keep a ticket ID.",
                type: WorkflowNodeType.INFO,
                options: [
                    { label: "Report to DoT / Sanchar Saathi", nextNodeId: "comm_report_dot" },
                    { label: "Find Telco Nodal Officer", nextNodeId: "comm_telco_nodal" },
                    { label: "Generate Telco Complaint Letter", nextNodeId: "comm_template_sim_swap" },
                    { label: "Done", nextNodeId: "comm_end_safe" }
                ]
            },
            {
                id: "comm_template_sim_swap",
                text: "Generate a formal complaint letter to your telecom operator for suspected SIM swap.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_sim_swap_telco",
                options: [{ label: "Letter Ready", nextNodeId: "comm_end_safe" }]
            },
            {
                id: "comm_report_dot",
                text: "Report SIM swap/fraud to DoT portal. Keep acknowledgement handy for bank and police.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://www.sancharsaathi.gov.in/",
                options: [{ label: "Reported", nextNodeId: "comm_end_safe" }]
            },
            {
                id: "comm_telco_nodal",
                text: "Escalate to your operator’s Nodal/Appellate officer with your complaint and KYC.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://www.trai.gov.in/consumer-connect/ccs/contact-details-nodal-officers",
                options: [{ label: "Noted", nextNodeId: "comm_end_safe" }]
            },

            // BRANCH 2: CALL TAPPING / FORWARDING
            {
                id: "comm_call_fwd_check",
                text: "Hackers often set up 'Call Forwarding' to listen to your calls. Let's check.",
                type: WorkflowNodeType.ACTION,
                content: "Dial *#62# or *#21# on your dialer. Does it show any unknown number?",
                options: [
                    { label: "Yes, an unknown number showed up", nextNodeId: "comm_disable_fwd" },
                    { label: "No, it says 'Not Forwarded'", nextNodeId: "comm_end_safe" }
                ]
            },
            {
                id: "comm_disable_fwd",
                text: "Dial ##002# immediately to erase all call forwarding settings.",
                type: WorkflowNodeType.ACTION,
                options: [{ label: "Done, erased", nextNodeId: "comm_end_safe" }]
            },

            // BRANCH 3: SMS BOMBING
            {
                id: "comm_sms_bombing",
                text: "This is usually done to hide a 'Real Bank OTP' amidst 100 fake messages. Check your Bank Transaction SMS carefully.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Checking Bank SMS now", nextNodeId: "comm_dnd_activate" }]
            },
            {
                id: "comm_dnd_activate",
                text: "Enable DND (Do Not Disturb) to reduce spam. Send 'START 0' to 1909.",
                type: WorkflowNodeType.INFO,
                options: []
            },

            {
                id: "comm_end_safe",
                text: "Your line seems secure now. Never share OTPs over call.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },
    // THREAT 8: DIGITAL FOOTPRINT RISK (Privacy Cleanup)

    {
        category: AssessmentCategory.DIGITAL_FOOTPRINT_RISK,
        title: "Clean Your Digital Footprint",
        description: "Remove personal info from Google Search and old social accounts.",
        nodes: [
            {
                id: "foot_start",
                text: "What information do you want to remove from the internet?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "My Phone/Address is visible on Google Search", nextNodeId: "foot_google_removal" },
                    { label: "Old Social Media posts/photos", nextNodeId: "foot_social_audit" },
                    { label: "Unwanted accounts on random websites", nextNodeId: "foot_saymine" }
                ]
            },

            // BRANCH 1: GOOGLE SEARCH REMOVAL
            {
                id: "foot_google_removal",
                text: "Google has a special tool called 'Results about you' to request removal of personal contact info.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://myactivity.google.com/results-about-you",
                options: [
                    { label: "I have submitted a request", nextNodeId: "foot_end" }
                ]
            },

            // BRANCH 2: SOCIAL MEDIA
            {
                id: "foot_social_audit",
                text: "There is no 'Delete All' button for the internet. You must manually delete posts or set your profile to 'Private'.",
                type: WorkflowNodeType.INFO,
                options: [
                    { label: "How to archive instead of delete?", nextNodeId: "foot_archive_tips" }
                ]
            },
            {
                id: "foot_archive_tips",
                text: "On Instagram/Facebook, use the 'Archive' feature. It hides posts from public view but keeps them for you.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Done", nextNodeId: "foot_end" }]
            },

            // BRANCH 3: DELETE UNUSED ACCOUNTS
            {
                id: "foot_saymine",
                text: "Many old websites hold your data. Use a service like 'JustDelete.me' to find delete links for popular sites.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://backgroundchecks.org/justdeleteme/",
                options: []
            },

            {
                id: "foot_end",
                text: "Regularly Google yourself to see what new information pops up.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // THREAT 9: ACCOUNT SECURITY THREAT (Hacked Account Recovery)

    {
        category: AssessmentCategory.ACCOUNT_SECURITY_THREAT,
        title: "Account Breach Recovery",
        description: "Steps to secure compromised accounts and kick out hackers.",
        nodes: [
            {
                id: "acc_start",
                text: "Do you still have access to your account?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "Yes, I can login but it's suspicious", nextNodeId: "acc_secure_session" },
                    { label: "No, hacker changed the password", nextNodeId: "acc_recovery_process" }
                ]
            },

            // BRANCH 1: STILL HAVE ACCESS
            {
                id: "acc_secure_session",
                text: "First Step: Force logout everyone else. Go to Settings -> Security -> 'Log out of all sessions'.",
                type: WorkflowNodeType.INFO,
                options: [
                    { label: "Logged everyone out", nextNodeId: "acc_change_pass" }
                ]
            },
            {
                id: "acc_change_pass",
                text: "Now change your password. Do not reuse an old password.",
                type: WorkflowNodeType.INFO,
                options: [
                    { label: "Password Changed", nextNodeId: "acc_setup_2fa" }
                ]
            },
            {
                id: "acc_setup_2fa",
                text: "Enable 'Two-Factor Authentication' (2FA) using an App like Google Authenticator. SMS 2FA is not safe enough.",
                type: WorkflowNodeType.ACTION,
                options: [{ label: "2FA Enabled", nextNodeId: "acc_review_apps" }]
            },
            {
                id: "acc_review_apps",
                text: "Review connected apps and sessions: remove unknown third-party app access, sign out of other devices, and rotate backup codes if available.",
                type: WorkflowNodeType.INFO,
                options: [ { label: "Done", nextNodeId: "acc_check_breach" } ]
            },

            // BRANCH 2: LOCKED OUT
            {
                id: "acc_recovery_process",
                text: "Use the 'Forgot Password' link. If the hacker changed recovery email/phone, look for 'Try another way' or 'Account Hacked' support form.",
                type: WorkflowNodeType.INFO,
                options: [
                    { label: "I recovered it", nextNodeId: "acc_secure_session" },
                    { label: "Still can't access", nextNodeId: "acc_platform_support" }
                ]
            },
            {
                id: "acc_platform_support",
                text: "Select your platform for the official account recovery process.",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Google (Gmail)", nextNodeId: "acc_support_google" },
                    { label: "Instagram", nextNodeId: "acc_support_instagram" },
                    { label: "Facebook", nextNodeId: "acc_support_facebook" },
                    { label: "X / Twitter", nextNodeId: "acc_support_twitter" },
                    { label: "WhatsApp", nextNodeId: "acc_support_whatsapp" },
                    { label: "Generate Appeal Email", nextNodeId: "acc_template_platform" },
                    { label: "Back", nextNodeId: "acc_check_breach" }
                ]
            },
            {
                id: "acc_template_platform",
                text: "Generate a recovery appeal email for your platform support.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_platform_recovery",
                options: [{ label: "Letter Ready", nextNodeId: "acc_check_breach" }]
            },
            {
                id: "acc_support_google",
                text: "Google Account Recovery → g.co/recover → add recovery options once restored.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://support.google.com/accounts/answer/6294825",
                options: [{ label: "Done", nextNodeId: "acc_check_breach" }]
            },
            {
                id: "acc_support_instagram",
                text: "Instagram hacked / no access → Request security code and ID verification.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://help.instagram.com/149494825257596",
                options: [{ label: "Done", nextNodeId: "acc_check_breach" }]
            },
            {
                id: "acc_support_facebook",
                text: "Facebook hacked → Use facebook.com/hacked → secure devices and change credentials.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://www.facebook.com/hacked",
                options: [{ label: "Done", nextNodeId: "acc_check_breach" }]
            },
            {
                id: "acc_support_twitter",
                text: "X/Twitter hacked → follow official guidance; remove suspicious apps and enable 2FA.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://help.twitter.com/en/safety-and-security/hacked-account",
                options: [{ label: "Done", nextNodeId: "acc_check_breach" }]
            },
            {
                id: "acc_support_whatsapp",
                text: "WhatsApp account stolen → verify via SMS; email support to lock if needed.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://faq.whatsapp.com/general/security-and-privacy/stolen-accounts",
                options: [{ label: "Done", nextNodeId: "acc_check_breach" }]
            },

            // COMMON CHECK
            {
                id: "acc_check_breach",
                text: "Check if your email was leaked in a data breach using 'Have I Been Pwned'.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://haveibeenpwned.com/",
                options: []
            }
        ]
    },

    // THREAT 10: FAMILY & PERSONAL SAFETY

    {
        category: AssessmentCategory.FAMILY_PERSONAL_SAFETY,
        title: "Family Online Safety Center",
        description: "Protecting children and seniors from online risks.",
        nodes: [
            {
                id: "fam_start",
                text: "Whose safety are you concerned about?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "My Child (Under 18)", nextNodeId: "fam_child_safety" },
                    { label: "Elderly Parents (Senior Citizens)", nextNodeId: "fam_senior_scam" },
                    { label: "General Family Safety", nextNodeId: "fam_home_wifi" }
                ]
            },

            // BRANCH 1: CHILD SAFETY
            {
                id: "fam_child_safety",
                text: "Is the child facing bullying or talking to strangers?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Cyberbullying / Harassment", nextNodeId: "fam_bullying_report" },
                    { label: "Accessing inappropriate content", nextNodeId: "fam_parental_tools" }
                ]
            },
            {
                id: "fam_bullying_report",
                text: "Save screenshots of the bullying messages. Do not reply. Block the bully immediately.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Next", nextNodeId: "fam_school_report" }]
            },
            {
                id: "fam_school_report",
                text: "If the bully is a classmate, report it to the School Counselor. If it's an adult stranger, report to Police.",
                type: WorkflowNodeType.INFO,
                options: []
            },
            {
                id: "fam_parental_tools",
                text: "Set up parental controls to protect kids online.",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Google Family Link (Android)", nextNodeId: "fam_parental_tools_google" },
                    { label: "Apple Family Sharing (iOS)", nextNodeId: "fam_parental_tools_apple" }
                ]
            },
            {
                id: "fam_parental_tools_google",
                text: "Use Google Family Link to manage screen time and apps.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://families.google.com/familylink/",
                options: []
            },
            {
                id: "fam_parental_tools_apple",
                text: "Use Apple Family Sharing & Screen Time restrictions to manage an iPhone/iPad.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://support.apple.com/en-in/HT201088",
                options: []
            },

            // BRANCH 2: SENIOR CITIZENS
            {
                id: "fam_senior_scam",
                text: "Seniors are targets for KYC/Electricity Bill scams. Have they shared any OTP recently?",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Yes, money deducted", nextNodeId: "fin_start" }, // Link to Financial Flow logic (conceptually)
                    { label: "No, just prevention", nextNodeId: "fam_senior_tips" }
                ]
            },
            {
                id: "fam_senior_tips",
                text: "Install a spam blocker (Truecaller) on their phone and tell them: 'No Government officer asks for OTP'.",
                type: WorkflowNodeType.INFO,
                options: []
            },

            // BRANCH 3: HOME WIFI
            {
                id: "fam_home_wifi",
                text: "Secure your Home WiFi. Change the default router password (e.g., admin/admin) to something strong.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // THREAT 11: LEGAL COMPLIANCE RISK (Data Rights)

    {
        category: AssessmentCategory.LEGAL_COMPLIANCE_RISK,
        title: "Data Privacy Rights Helper",
        description: "Exercise your rights under DPDP Act against companies misusing data.",
        nodes: [
            {
                id: "legal_start",
                text: "How is your data being misused?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "Spam Calls/SMS after unsubscribing", nextNodeId: "legal_dnd_violation" },
                    { label: "Company refuses to delete my account", nextNodeId: "legal_erasure_template" }
                ]
            },
            {
                id: "legal_erasure_template",
                text: "Generate a 'Right to Erasure / Account Deletion' request to the company.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_right_to_erasure_company",
                options: [{ label: "Letter Ready", nextNodeId: "legal_end" }]
            },

            // SPAM CALLS
            {
                id: "legal_dnd_violation",
                text: "If you are registered on DND and still get calls, it is illegal. You can report them to TRAI.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://trai.gov.in/",
                options: [{ label: "Reported", nextNodeId: "legal_end" }]
            },

            {
                id: "legal_end",
                text: "Always read the 'Privacy Policy' before clicking 'I Agree'. Uncheck pre-ticked boxes for marketing.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // THREAT 12: EDUCATIONAL RECORDS EXPOSURE

    {
        category: AssessmentCategory.EDUCATIONAL_RECORDS_EXPOSURE,
        title: "Academic Records Protection",
        description: "Handling fake degrees or leaked exam results.",
        nodes: [
            {
                id: "edu_start",
                text: "What is the issue with your academic records?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "Someone is using a fake degree in my name", nextNodeId: "edu_impersonation" },
                    { label: "My Exam Results/Admit Card is leaked publicly", nextNodeId: "edu_data_leak" }
                ]
            },
            {
                id: "edu_impersonation",
                text: "This is a crime. You must inform the University Registrar and file an FIR for forgery.",
                type: WorkflowNodeType.INFO,
                options: []
            },
            {
                id: "edu_data_leak",
                text: "Institutions cannot publish sensitive data (Phone/Address) with results. Write to the 'Controller of Examinations'.",
                type: WorkflowNodeType.INFO,
                options: []
            }
        ]
    },

    // THREAT 13: DIGITAL REPUTATION THREAT (Defamation/Deepfake)

    {
        category: AssessmentCategory.DIGITAL_REPUTATION_THREAT,
        title: "Reputation Defender",
        description: "Combat fake news, defamation, and deepfakes.",
        nodes: [
            {
                id: "rep_start",
                text: "What is damaging your reputation?",
                type: WorkflowNodeType.QUESTION,
                isStartNode: true,
                options: [
                    { label: "Deepfake / Morphed Photos", nextNodeId: "rep_deepfake_urgent" },
                    { label: "False/Defamatory Posts", nextNodeId: "rep_defamation_notice" },
                    { label: "Old Embarrassing Photos", nextNodeId: "foot_google_removal" } // Link to footprint logic
                ]
            },

            // BRANCH 1: DEEPFAKE (High Priority)
            {
                id: "rep_deepfake_urgent",
                text: "Deepfakes are a punishable offense. Report immediately to the platform (Instagram/X) as 'Non-Consensual Imagery'.",
                type: WorkflowNodeType.INFO,
                options: [{ label: "Reported to Platform", nextNodeId: "rep_cyber_complaint" }]
            },
            {
                id: "rep_cyber_complaint",
                text: "File a complaint on cybercrime.gov.in under 'Cyber Bullying / Morphing'. Police take this seriously.",
                type: WorkflowNodeType.ACTION,
                resourceLink: "https://cybercrime.gov.in",
                options: []
            },

            // BRANCH 2: DEFAMATION
            {
                id: "rep_defamation_notice",
                text: "If someone is spreading lies to harm your image, you can send a Legal Notice for Defamation.",
                type: WorkflowNodeType.QUESTION,
                options: [
                    { label: "Generate Legal Notice", nextNodeId: "rep_template_legal" },
                    { label: "Ignore it", nextNodeId: "rep_ignore_advice" }
                ]
            },
            {
                id: "rep_template_legal",
                text: "Fill details to draft a 'Cease and Desist' notice to the person posting fake content.",
                type: WorkflowNodeType.TEMPLATE_FORM,
                templateId: "temp_defamation_notice",
                options: [{ label: "Notice Ready", nextNodeId: "rep_end" }]
            },
            {
                id: "rep_ignore_advice",
                text: "Sometimes, ignoring trolls is the best strategy to stop giving them attention. Block and move on.",
                type: WorkflowNodeType.INFO,
                options: []
            },
            {
                id: "rep_end",
                text: "Monitor your online presence regularly.",
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
    },
    {
        id: "temp_id_dispute",
        name: "Loan Dispute Letter (Identity Theft)",
        body: `To,
The Nodal Officer,
{{BankName}},

Subject: DISPUTE NOTICE - Fraudulent Loan Account / Transaction

Dear Sir/Madam,

I am writing to formally dispute a loan account / credit card entry appearing in my name under your bank.
Account/Ref Number: {{LoanAccountNumber}}
Amount: {{Amount}}

I confirm that:
1. I did NOT apply for this loan/card.
2. I did NOT sign any documents or receive these funds.
3. This is a clear case of IDENTITY THEFT.

I have already reported this to the Cyber Police (Complaint No: {{PoliceComplaintNo}}).

I request you to immediately:
1. Mark this account as "FRAUD" and stop all collection calls.
2. Remove this entry from my CIBIL/Credit Report.
3. Provide me with the documents used to open this fake account (KYC proofs) for police investigation.

Failure to act will force me to escalate this to the RBI Ombudsman.

Sincerely,
{{UserName}}
{{Phone}}`
    },
    {
        id: "temp_internal_incident",
        name: "Internal Incident Report (To Manager/IT)",
        body: `To,
IT Security Team / Reporting Manager,

Subject: Incident Report - Potential Security Issue

Dear Team,

I am writing to voluntarily report a security incident regarding {{IncidentType}} (e.g., lost device, suspicious email click).

Time of Incident: {{Time}}
Details:
{{Description}}

Immediate Actions I have taken:
1. Disconnected from network.
2. Changed passwords.
3. {{OtherActions}}

I am available to assist with any investigation and remediation required.

Regards,
{{UserName}}
{{EmployeeID}}`
    },
    {
        id: "temp_health_data_deletion",
        name: "Medical Data Deletion Demand (DPDP Act)",
        body: `To,
The Grievance / Privacy Officer,
{{HospitalOrLabName}},

Subject: Demand for Erasure of Personal Data under DPDP Act

Sir/Madam,

I, {{UserName}}, was a patient at your facility on {{Date}}.
It has come to my notice that my sensitive medical records are being displayed/shared publicly at {{SourceOfLeak}} without my consent.

I hereby exercise my "Right to Erasure" and "Right to Correction" under the applicable Data Protection Laws.

I demand that you:
1. Immediately remove my medical data from {{SourceOfLeak}}.
2. Confirm in writing that this data has been deleted.
3. Investigate how this breach occurred.

If this is not done within 72 hours, I will be compelled to file a complaint with the Data Protection Board and seek compensation.

Regards,
{{UserName}}
{{Phone}}`
    },
    {
        id: "temp_stalking_complaint",
        name: "Police Complaint - Stalking/Tracking",
        body: `To,
The Station House Officer (SHO),
{{PoliceStationName}},

Subject: Complaint regarding Stalking and Illegal Location Tracking (Sec 354D IPC / IT Act)

Sir,

I, {{UserName}}, resident of {{UserAddress}}, wish to report that I am being stalked and illegally tracked by an unknown/known person.

Details of Suspicion:
1. {{SuspiciousActivity}}.
2. Incident happened on: {{Date}}.

Evidence:
I have attached screenshots/photos of the tracker/messages.

I fear for my safety and request you to:
1. Register an FIR under Section 354D (Stalking) and relevant IT Act sections.
2. Investigate the source of this tracking.

Sincerely,
{{UserName}}
{{Phone}}`
    },
    {
        id: "temp_defamation_notice",
        name: "Legal Notice for Defamation (Cease & Desist)",
        body: `To,
{{OffenderName}},
(Link/Address if available)

Subject: CEASE AND DESIST NOTICE - Defamatory Content

Sir/Madam,

It has come to my attention that you have published false and defamatory statements about me on {{PlatformName}} on {{Date}}.

Statement in question: "{{QuoteOfFakeStatement}}"

These statements are completely false and have caused severe damage to my reputation and mental peace.

I hereby demand that you:
1. Immediately DELETE the said post/content.
2. Publish an unconditional apology.
3. Cease from posting any further defamatory content about me.

Failure to comply within 24 hours will force me to initiate criminal proceedings under Section 499/500 (Defamation) of the IPC.

Regards,
{{UserName}}`
    },
    {
        id: "temp_right_to_erasure_company",
        name: "Right to Erasure / Account Deletion Request",
        body: `To,
Data Protection / Grievance Officer,
{{CompanyName}},

Subject: Request for Erasure of Personal Data and Account Deletion (DPDP Compliance)

Sir/Madam,

I, {{UserName}}, associated with the email {{Email}} and phone {{Phone}}, request deletion of my account and erasure of all personal data held by {{CompanyName}}.

Basis: I am exercising my rights under applicable data protection laws. Please confirm:
1. Erasure of my personal data and deactivation of my account.
2. Deletion of my data from backups/logs as per policy.
3. Notification of erasure completion within a reasonable period.

If you rely on any legal basis to retain specific data, kindly inform me with reasons and retention duration.

Sincerely,
{{UserName}}`
    },
    {
        id: "temp_sim_swap_telco",
        name: "SIM Swap Complaint to Telecom Operator",
        body: `To,
Nodal/Appellate Officer,
{{OperatorName}} ({{Circle}}),

Subject: Urgent Complaint – Suspected SIM Swap / Unauthorized SIM Replacement

Sir/Madam,

I, {{UserName}} (Phone: {{PhoneNumber}}), report a suspected SIM swap. My SIM stopped working on {{DateTime}} without request.

Details:
• Last known location: {{Location}}
• Store visited / Complaint No (if any): {{ComplaintRef}}

Requests:
1. Block any unauthorized SIM replacement immediately.
2. Restore service to my rightful SIM after KYC verification.
3. Provide an incident report and store/CSP details involved.

I am also reporting this to DoT.

Sincerely,
{{UserName}}
{{Email}}`
    },
    {
        id: "temp_platform_recovery",
        name: "Account Recovery Appeal (Platform)",
        body: `To,
Support Team – {{PlatformName}},

Subject: Account Recovery Request – Unauthorized Access

Dear Team,

My account (Username/Email: {{AccountIdentifier}}) appears to be compromised. I no longer have access to the registered email/phone.

Evidence:
• Last successful login: {{LastLogin}}
• Suspicious changes observed: {{ChangesObserved}}

I request identity verification and restoration of access. I consent to provide ID proof if needed.

Post-recovery, I will enable 2FA and review security settings.

Regards,
{{UserName}}
{{ContactEmail}}`
    }
];


// 2. MAIN SEEDING FUNCTION


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
                    resourceLink: (node as any).resourceLink || null,
                    templateId: (node as any).templateId || null,
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


export interface PoliceWebsite {
    name: string;
    website: string;
}

export const STATE_POLICE_WEBSITES: PoliceWebsite[] = [
    { name: "Andhra Pradesh", website: "https://citizen.appolice.gov.in" },
    { name: "Arunachal Pradesh", website: "http://arunpol.nic.in" },
    { name: "Assam", website: "https://police.assam.gov.in" },
    { name: "Bihar", website: "http://police.bihar.gov.in" },
    { name: "Chhattisgarh", website: "http://cgpolice.gov.in" },
    { name: "Goa", website: "https://citizen.goapolice.gov.in" },
    { name: "Gujarat", website: "http://www.police.gujarat.gov.in" },
    { name: "Haryana", website: "https://haryanapolice.gov.in/login" },
    { name: "Himachal Pradesh", website: "https://citizenportal.hppolice.gov.in/citizen" },
    { name: "Jharkhand", website: "https://www.jhpolice.gov.in" },
    { name: "Karnataka", website: "https://ksp.karnataka.gov.in" },
    { name: "Kerala", website: "https://keralapolice.gov.in" },
    { name: "Madhya Pradesh", website: "https://www.mppolice.gov.in" },
    { name: "Maharashtra", website: "https://www.mahapolice.gov.in" },
    { name: "Manipur", website: "http://www.manipurpolice.gov.in" },
    { name: "Meghalaya", website: "https://megpolice.gov.in" },
    { name: "Mizoram", website: "http://police.mizoram.gov.in" },
    { name: "Nagaland", website: "https://police.nagaland.gov.in" },
    { name: "Odisha", website: "https://odishapolice.gov.in" },
    { name: "Punjab", website: "http://www.punjabpolice.gov.in" },
    { name: "Rajasthan", website: "http://police.rajasthan.gov.in" },
    { name: "Sikkim", website: "https://police.sikkim.gov.in" },
    { name: "Tamil Nadu", website: "http://www.tnpolice.gov.in" },
    { name: "Telangana", website: "https://www.tspolice.gov.in" },
    { name: "Tripura", website: "https://tripurapolice.gov.in" },
    { name: "Uttar Pradesh", website: "https://uppolice.gov.in" },
    { name: "Uttarakhand", website: "https://uttarakhandpolice.uk.gov.in" },
    { name: "West Bengal", website: "https://wbpolice.gov.in" }
];

export const UT_POLICE_WEBSITES: PoliceWebsite[] = [
    { name: "Andaman and Nicobar Islands", website: "https://police.andaman.gov.in" },
    { name: "Chandigarh", website: "https://chandigarhpolice.gov.in" },
    { name: "Dadra & Nagar Haveli and Daman & Diu", website: "https://dnhpd.gov.in" },
    { name: "Delhi (NCT)", website: "https://delhipolice.gov.in" },
    { name: "Jammu & Kashmir", website: "https://www.jkpolice.gov.in" },
    { name: "Ladakh", website: "https://police.ladakh.gov.in" },
    { name: "Lakshadweep", website: "https://police.lakshadweep.gov.in" },
    { name: "Puducherry", website: "https://police.py.gov.in" }
];
