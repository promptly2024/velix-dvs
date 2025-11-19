import { PrismaClient, DetectionSource } from "@prisma/client";
const prisma = new PrismaClient();

function ing(key: string, name: string, sources: DetectionSource[], scam: string) {
    return { key, name, detectionSources: sources, possibleScam: scam };
}

async function main() {
    console.log("Seeding FULL 13 Threat Categories + Ingredients...");

    const threats = [
        {
            key: "FINANCIAL_THREAT",
            name: "Financial Threat",
            ingredients: [
                ing("upi_id", "UPI ID", ["WEB_SEARCH", "DARK_WEB"], "UPI fraud, payment request scam"),
                ing("credit_card_number", "Credit Card Number", ["WEB_SEARCH", "DARK_WEB"], "Card fraud"),
                ing("debit_card_number", "Debit Card Number", ["WEB_SEARCH", "DARK_WEB"], "Debit card misuse scam"),
                ing("bank_account_number", "Bank Account Number", ["WEB_SEARCH", "DARK_WEB"], "KYC scam, account takeover"),
                ing("cvv_exposure", "CVV Exposure", ["DARK_WEB"], "Card cloning / fraud"),
                ing("card_expiry", "Card Expiry Date", ["WEB_SEARCH", "DARK_WEB"], "Card fraud"),
                ing("netbank_username", "Net Banking Username", ["BREACH", "WEB_SEARCH"], "Net banking compromise"),
                ing("netbank_password", "Net Banking Password", ["BREACH"], "Net banking takeover"),
                ing("wallet_id", "Wallet ID", ["WEB_SEARCH", "BREACH"], "Wallet theft"),
                ing("transaction_history", "Transaction History", ["WEB_SEARCH"], "Chargeback/fraud evidence"),
                ing("bank_statements", "Bank Statements", ["WEB_SEARCH"], "Financial profiling"),
                // ing("salary_slip", "Salary Slip", ["WEB_SEARCH"], "Salary-based scams"),
                // ing("loan_account_number", "Loan Account Number", ["WEB_SEARCH"], "Loan fraud"),
                // ing("insurance_policy_number", "Insurance Policy Number", ["WEB_SEARCH"], "Insurance fraud"),
                // ing("mutual_fund_folio", "Mutual Fund Folio Number", ["WEB_SEARCH"], "Investment fraud"),
                ing("demat_account_number", "Demat Account Number", ["WEB_SEARCH"], "Trading fraud"),
                // ing("trading_account_login", "Trading Account Login", ["WEB_SEARCH", "BREACH"], "Trading account takeover"),
                ing("crypto_wallet_address", "Cryptocurrency Wallet Address", ["WEB_SEARCH", "DARK_WEB"], "Crypto theft"),
                ing("crypto_private_key", "Crypto Private Key", ["DARK_WEB"], "Immediate wallet drain"),
                // ing("pan_financial_link", "PAN-linked Financial Data", ["WEB_SEARCH", "BREACH"], "Fraudulent loans")
            ]
        },

        {
            key: "IDENTITY_THEFT_RISK",
            name: "Identity Theft Risk",
            ingredients: [
                ing("full_name", "Full Name", ["WEB_SEARCH"], "Fake identity creation"),
                ing("date_of_birth", "Date of Birth", ["WEB_SEARCH"], "DOB-based verification scam"),
                ing("aadhaar_number", "Aadhaar Number", ["WEB_SEARCH"], "Identity misuse"),
                ing("pan_number", "PAN Number", ["WEB_SEARCH"], "Loan/credit fraud"),
                ing("passport_number", "Passport Number", ["WEB_SEARCH"], "Travel/doc misuse"),
                ing("driving_license_number", "Driving License Number", ["WEB_SEARCH"], "Document forgery"),
                ing("voter_id_number", "Voter ID Number", ["WEB_SEARCH"], "Identity spoofing"),
                // ing("ration_card_number", "Ration Card Number", ["WEB_SEARCH"], "ID misuse"),
                ing("signature_sample", "Signature Sample", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Forgery"),
                ing("photograph", "Photograph", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Fake profiles / impersonation"),
                ing("parent_names", "Parent Names", ["WEB_SEARCH"], "Family-based scams"),
                ing("personal_id_documents", "Personal ID Documents", ["WEB_SEARCH"], "Document misuse"),
                ing("qr_code_identity_data", "QR Code Identity Data", ["WEB_SEARCH"], "QR misuse"),
                ing("phone_number", "Phone Number", ["BREACH", "WEB_SEARCH"], "SIM/OTP fraud"),
                ing("email_id", "Email ID", ["BREACH", "WEB_SEARCH"], "Email compromise"),
                ing("gender", "Gender", ["WEB_SEARCH"], "Targeted impersonation"),
                ing("address_proof_document", "Address Proof Document", ["WEB_SEARCH"], "Address misuse")
            ]
        },

        {
            key: "PROFESSIONAL_EXPOSURE",
            name: "Professional Exposure",
            ingredients: [
                ing("resume_cv", "Resume / CV", ["WEB_SEARCH"], "Fake HR / job offer scam"),
                ing("linkedin_id", "LinkedIn ID", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Recruiter impersonation"),
                ing("employment_id", "Employment ID", ["WEB_SEARCH"], "Employee impersonation"),
                ing("company_name", "Company Name", ["WEB_SEARCH"], "Impersonation / verification scam"),
                ing("office_email_id", "Office Email ID", ["WEB_SEARCH"], "Corporate phishing"),
                ing("work_location", "Work Location", ["WEB_SEARCH"], "Office-targeted scams"),
                ing("job_role_department", "Job Role / Department", ["WEB_SEARCH"], "Targeted social engineering"),
                ing("manager_details", "Manager Details", ["WEB_SEARCH"], "Manager impersonation")
            ]
        },

        {
            key: "SOCIAL_MEDIA_VULNERABILITY",
            name: "Social Media Vulnerability",
            ingredients: [
                ing("facebook_profile", "Facebook Profile", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Fake FB account / impersonation"),
                ing("instagram_profile", "Instagram Profile", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Instagram impersonation"),
                ing("twitter_profile", "Twitter/X Profile", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Social phishing"),
                ing("youtube_channel", "YouTube Channel", ["WEB_SEARCH"], "Impersonation / reputation scam"),
                ing("reddit_id", "Reddit ID", ["WEB_SEARCH"], "Forum impersonation"),
                ing("snapchat_id", "Snapchat ID", ["WEB_SEARCH"], "Social misuse"),
                ing("telegram_username", "Telegram Username", ["WEB_SEARCH"], "Telegram scams"),
                ing("whatsapp_number", "WhatsApp Number", ["BREACH", "WEB_SEARCH"], "WhatsApp takeover"),
                ing("social_photos", "Social Media Photos", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Sextortion / impersonation"),
                // ing("friends_list", "Social Friends List", ["SOCIAL_SEARCH"], "Targeted scams")
            ]
        },

        {
            key: "HEALTHCARE_PRIVACY_RISK",
            name: "Healthcare Privacy Risk",
            ingredients: [
                ing("hospital_records", "Hospital Records", ["WEB_SEARCH"], "Medical insurance fraud"),
                ing("lab_reports", "Lab Reports", ["WEB_SEARCH"], "Medical data misuse"),
                ing("prescription_data", "Prescription Data", ["WEB_SEARCH"], "Pharmacy fraud"),
                ing("doctor_details", "Doctor Details", ["WEB_SEARCH"], "Impersonation scams"),
                ing("insurance_health_id", "Insurance Health ID", ["WEB_SEARCH"], "Policy fraud"),
                // ing("abha_number", "ABHA Number", ["WEB_SEARCH"], "Health ID misuse"),
                ing("vaccination_certificate", "Vaccination Certificate", ["WEB_SEARCH"], "Certificate misuse"),
                ing("medical_history", "Medical History", ["WEB_SEARCH"], "Health data extortion"),
                // ing("mental_health_data", "Mental Health Data", ["WEB_SEARCH"], "Sensitive leak")
            ]
        },

        {
            key: "LOCATION_PRIVACY_THREAT",
            name: "Location Privacy Threat",
            ingredients: [
                ing("home_address", "Home Address", ["WEB_SEARCH"], "Delivery / home visit scam"),
                ing("permanent_address", "Permanent Address", ["WEB_SEARCH"], "Verification scam"),
                ing("temporary_address", "Temporary Address", ["WEB_SEARCH"], "Address misuse"),
                ing("office_address", "Office Address", ["WEB_SEARCH"], "Office-targeted scam"),
                ing("live_location", "Live Location", ["SOCIAL_SEARCH"], "Real-time targeted scam"),
                ing("travel_history", "Travel History", ["WEB_SEARCH"], "Trip-based scams"),
                // ing("checkin_location", "Check-in Location Data", ["SOCIAL_SEARCH"], "Location exploit"),
                // ing("ride_history", "Ride History (Uber/Ola)", ["WEB_SEARCH"], "Delivery/recon scams"),
                ing("maps_activity", "Maps Activity", ["WEB_SEARCH"], "Location profiling")
            ]
        },

        {
            key: "COMMUNICATION_SECURITY",
            name: "Communication Security",
            ingredients: [
                ing("phone_number_comm", "Phone Number", ["BREACH", "WEB_SEARCH"], "OTP / SIM-swap scam"),
                ing("email_comm", "Email ID", ["BREACH", "WEB_SEARCH"], "Email phishing"),
                ing("sms_logs", "SMS Logs", ["WEB_SEARCH"], "OTP exposure"),
                ing("call_logs", "Call Logs", ["WEB_SEARCH"], "Phone social engineering"),
                ing("otp_exposure", "OTP Exposure", ["WEB_SEARCH", "BREACH"], "OTP-based fraud"),
                // ing("chat_dump", "WhatsApp/Telegram Chats (dump)", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Conversation extortion")
            ]
        },

        {
            key: "DIGITAL_FOOTPRINT_RISK",
            name: "Digital Footprint Risk",
            ingredients: [
                // ing("old_accounts_list", "Old Accounts List", ["BREACH", "WEB_SEARCH"], "Account reuse exploitation"),
                ing("app_signup_data", "App Signup Data", ["WEB_SEARCH"], "Profiling"),
                ing("search_history", "Search History (indexed)", ["WEB_SEARCH"], "Profiling"),
                ing("ip_address", "IP Address", ["BREACH", "WEB_SEARCH"], "Device tracking"),
                ing("device_fingerprint", "Device Fingerprint", ["WEB_SEARCH"], "Tracking"),
                ing("dark_web_mentions", "Dark Web Mentions", ["DARK_WEB"], "Credential sale")
            ]
        },

        {
            key: "ACCOUNT_SECURITY_THREAT",
            name: "Account Security Threat",
            ingredients: [
                ing("username", "Username", ["BREACH", "WEB_SEARCH"], "Account brute-force"),
                ing("password", "Password", ["BREACH"], "Credential stuffing"),
                ing("two_fa_disabled", "2FA Disabled", ["AI_PROMPT"], "Easier takeover"),
                ing("recovery_email", "Recovery Email", ["WEB_SEARCH"], "Account recovery exploit"),
                ing("recovery_phone", "Recovery Phone", ["WEB_SEARCH"], "Recovery exploit")
            ]
        },

        {
            key: "FAMILY_PERSONAL_SAFETY",
            name: "Family / Personal Safety",
            ingredients: [
                ing("family_member_names", "Family Member Names", ["WEB_SEARCH", "AI_PROMPT"], "Relative emergency scam"),
                ing("children_names", "Children's Names", ["WEB_SEARCH"], "Child-targeted scam"),
                ing("home_layout_photos", "Home Layout Photos", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Burglary/targeting"),
                ing("daily_routine", "Daily Routine Patterns", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Stalking/extortion")
            ]
        },

        {
            key: "LEGAL_COMPLIANCE_RISK",
            name: "Legal / Compliance Risk",
            ingredients: [
                ing("court_case_records", "Court Case Records", ["WEB_SEARCH"], "Fake legal notice / extortion"),
                ing("fir_copy", "FIR Copy", ["WEB_SEARCH"], "Legal intimidation scams"),
                ing("tax_returns", "Tax Returns", ["WEB_SEARCH"], "Tax fraud exploitation"),
                // ing("gst_data", "GST Data", ["WEB_SEARCH"], "Business compliance scams"),
                ing("driving_penalty_records", "Driving Penalty Records", ["WEB_SEARCH"], "RTO-related fraud")
            ]
        },

        {
            key: "EDUCATIONAL_RECORDS_EXPOSURE",
            name: "Educational Records Exposure",
            ingredients: [
                ing("school_name", "School Name", ["WEB_SEARCH", "AI_PROMPT"], "Scholarship/job scam"),
                ing("college_name", "College Name", ["WEB_SEARCH", "AI_PROMPT"], "Job eligibility scam"),
                ing("student_id", "Student ID", ["WEB_SEARCH"], "Identity misuse"),
                ing("enrollment_number", "Enrollment Number", ["WEB_SEARCH"], "Verification scams"),
                ing("roll_number", "Roll Number", ["WEB_SEARCH"], "Academic impersonation"),
                ing("marksheet", "Marksheet / Transcript", ["WEB_SEARCH"], "Credential misuse")
            ]
        },

        {
            key: "DIGITAL_REPUTATION_THREAT",
            name: "Digital Reputation Threat",
            ingredients: [
                ing("negative_public_posts", "Negative Public Posts", ["WEB_SEARCH"], "Reputation extortion"),
                ing("bad_reviews", "Bad Reviews", ["WEB_SEARCH"], "Business/person reputation scam"),
                ing("leaked_chats", "Leaked Chats", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Blackmail"),
                ing("fake_profiles_detected", "Fake Profiles Detected", ["WEB_SEARCH", "SOCIAL_SEARCH"], "Impersonation"),
                ing("defamation_mentions", "Defamation Mentions", ["WEB_SEARCH"], "Legal/reputation damage")
            ]
        }
    ];

    for (const t of threats) {
        console.log(`Seeding Threat Category: ${t.name}`);
        const threat = await prisma.threatCategory.upsert({
            where: { key: t.key },
            update: {
                name: t.name,
                description: t.name
            },
            create: {
                key: t.key,
                name: t.name,
                description: t.name
            }
        });

        // seed ingredients under this threat
        for (const ingredient of t.ingredients) {
            await prisma.threatIngredient.upsert({
                where: { key: ingredient.key },
                update: {
                    name: ingredient.name,
                    detectionSources: ingredient.detectionSources,
                    possibleScam: ingredient.possibleScam,
                    threatCategoryId: threat.id
                },
                create: {
                    key: ingredient.key,
                    name: ingredient.name,
                    detectionSources: ingredient.detectionSources,
                    possibleScam: ingredient.possibleScam,
                    threatCategoryId: threat.id
                }
            });
        }
        console.log(`Finished seeding Threat Category: ${t.name} ✔`);
    }

    console.log("All threats seeded ✅");
}

main()
    .catch((e) => {
        console.error(e);
        // process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("Disconnected from DB.");
    });
