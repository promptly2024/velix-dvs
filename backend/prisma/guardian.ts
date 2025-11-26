import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGuardianMode() {
  console.log('🌱 Starting Guardian Mode seed...');

  // ============================================
  // 1. FINANCIAL THREAT
  // ============================================
  const financialThreat = await prisma.threatCategory.upsert({
    where: { key: 'FINANCIAL_THREAT' },
    update: {},
    create: {
      key: 'FINANCIAL_THREAT',
      name: 'Financial Threat',
      description: 'Banking fraud, UPI scams, unauthorized transactions, investment frauds',
    },
  });

  const financialWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: financialThreat.id,
      name: 'Financial Scam Response',
      description: 'Immediate steps to take when experiencing financial fraud',
      priority: 1,
      isActive: true,
    },
  });

  // Financial Threat - Step 1: Block Card/Account
  const fin_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: financialWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you immediately blocked your compromised card/account with your bank?',
      explanationText: 'Blocking prevents further unauthorized transactions. Time is critical.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: fin_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! You\'ve stopped further damage. Keep the blocking reference number safe.',
        actionItems: [
          'Note the blocking reference number',
          'Request email confirmation',
          'Check if international transactions are also blocked',
        ],
        resourceLinks: [],
        urgencyLevel: 'MEDIUM',
      },
      {
        stepId: fin_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '🚨 URGENT: Call your bank customer care NOW and block your card/account immediately!',
        actionItems: [
          'Call bank helpline immediately (find number on bank website)',
          'Request temporary block on all cards and accounts',
          'Disable net banking and UPI temporarily',
          'Note the complaint reference number',
          'Ask for written confirmation via email',
        ],
        resourceLinks: ['https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=2009'],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Financial Threat - Step 2: Report to Bank
  const fin_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: financialWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you filed a written complaint with your bank about the fraudulent transaction?',
      explanationText: 'Written complaints create official records needed for refunds and investigations.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: fin_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Perfect! Keep all complaint documents safe for future reference.',
        actionItems: [
          'Save the complaint reference number',
          'Take screenshots of all transaction details',
          'Keep email confirmations in a safe folder',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: fin_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'File a written complaint immediately - this is required for refund claims.',
        actionItems: [
          'Visit bank branch or use bank\'s mobile app to lodge complaint',
          'Provide transaction ID, date, time, and amount',
          'Mention you did not authorize the transaction',
          'Request investigation under RBI guidelines',
          'Ask for zero-liability coverage eligibility',
          'Get written acknowledgment with complaint number',
        ],
        resourceLinks: ['https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=2009'],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Financial Threat - Step 3: Cybercrime Portal
  const fin_step3 = await prisma.guardianStep.create({
    data: {
      workflowId: financialWorkflow.id,
      stepNumber: 3,
      questionText: 'Have you reported this on the National Cybercrime Reporting Portal (1930)?',
      explanationText: 'Reporting to cybercrime portal can help freeze fraudster accounts and recover funds.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: fin_step3.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Excellent! The acknowledgment number is important for tracking and legal proceedings.',
        actionItems: [
          'Save the acknowledgment number',
          'Screenshot the complaint details',
          'Track status on portal regularly',
        ],
        resourceLinks: ['https://cybercrime.gov.in'],
        urgencyLevel: 'LOW',
      },
      {
        stepId: fin_step3.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Report immediately on cybercrime portal - this can help freeze fraudster accounts within hours!',
        actionItems: [
          'Call 1930 helpline OR visit https://cybercrime.gov.in',
          'Select "Report Anonymously" or create account',
          'Choose category: Financial Fraud',
          'Enter transaction details (amount, account, date, time)',
          'Upload transaction screenshot/SMS proof',
          'Note acknowledgment number after submission',
          'Share acknowledgment number with your bank',
        ],
        resourceLinks: ['https://cybercrime.gov.in', 'tel:1930'],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Financial Threat - Step 4: Change Credentials
  const fin_step4 = await prisma.guardianStep.create({
    data: {
      workflowId: financialWorkflow.id,
      stepNumber: 4,
      questionText: 'Have you changed all banking passwords, PINs, and UPI PINs?',
      explanationText: 'Changing credentials prevents repeat attacks on your accounts.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: fin_step4.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Great security practice! Use strong unique passwords for each account.',
        actionItems: [
          'Enable biometric authentication',
          'Set transaction limits',
          'Enable two-factor authentication',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: fin_step4.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '⚠️ Change all credentials NOW to prevent further unauthorized access!',
        actionItems: [
          'Change net banking password immediately',
          'Change UPI PIN on all payment apps',
          'Change ATM PIN for all cards',
          'Change mobile banking password',
          'Remove all saved/remembered passwords',
          'Review and remove suspicious linked devices',
          'Enable biometric login wherever possible',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Financial Threat - Step 5: Police FIR (for amounts > 50k)
  const fin_step5 = await prisma.guardianStep.create({
    data: {
      workflowId: financialWorkflow.id,
      stepNumber: 5,
      questionText: 'If the fraud amount is significant (>₹50,000), have you filed an FIR at the police station?',
      explanationText: 'FIR strengthens legal case and is required for insurance claims.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: fin_step5.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Well done! Keep FIR copy safe for all proceedings.',
        actionItems: [
          'Keep FIR copy in secure location',
          'Share FIR number with bank',
          'Follow up weekly for investigation updates',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: fin_step5.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Visit local police station to file FIR. Bring all evidence and transaction records.',
        actionItems: [
          'Collect all evidence: SMS, emails, screenshots, call logs',
          'Visit nearest cyber cell or police station',
          'Request FIR under IT Act 2000 and IPC sections 419, 420',
          'Mention cybercrime portal complaint number',
          'Get FIR copy with case number',
          'Submit FIR copy to bank for refund process',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  console.log('✅ Financial Threat workflow created');

  // ============================================
  // 2. IDENTITY THEFT RISK
  // ============================================
  const identityThreat = await prisma.threatCategory.upsert({
    where: { key: 'IDENTITY_THEFT_RISK' },
    update: {},
    create: {
      key: 'IDENTITY_THEFT_RISK',
      name: 'Identity Theft Risk',
      description: 'Someone using your Aadhaar, PAN, documents fraudulently',
    },
  });

  const identityWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: identityThreat.id,
      name: 'Identity Theft Response',
      description: 'Steps to take when your identity documents are misused',
      priority: 2,
      isActive: true,
    },
  });

  // Identity Theft - Step 1: Lock Aadhaar
  const id_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: identityWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you locked your Aadhaar biometrics to prevent unauthorized usage?',
      explanationText: 'Locking Aadhaar prevents misuse for SIM cards, bank accounts, or loan applications.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: id_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Your Aadhaar is now protected from unauthorized biometric authentication.',
        actionItems: [
          'Keep Aadhaar locked unless you need to use it',
          'Temporarily unlock only when required',
          'Re-lock immediately after use',
        ],
        resourceLinks: ['https://resident.uidai.gov.in/'],
        urgencyLevel: 'LOW',
      },
      {
        stepId: id_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '⚠️ Lock your Aadhaar immediately to prevent further misuse!',
        actionItems: [
          'Visit https://resident.uidai.gov.in/',
          'Login with Aadhaar number and OTP',
          'Click on "Lock/Unlock Biometrics"',
          'Lock your biometrics immediately',
          'Download virtual ID for safe sharing instead of Aadhaar number',
          'Enable biometric lock notifications',
        ],
        resourceLinks: ['https://resident.uidai.gov.in/'],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Identity Theft - Step 2: Credit Report Check
  const id_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: identityWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you checked your credit report for unauthorized loans or credit cards?',
      explanationText: 'Identity thieves often open credit accounts in your name.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: id_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good practice! Continue monitoring your credit report monthly.',
        actionItems: [
          'Set up credit alerts for new inquiries',
          'Monitor credit score monthly',
          'Report any suspicious activity immediately',
        ],
        resourceLinks: ['https://www.cibil.com/', 'https://www.experian.in/'],
        urgencyLevel: 'LOW',
      },
      {
        stepId: id_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Check your credit report immediately - identity thieves may have taken loans in your name!',
        actionItems: [
          'Get free credit report from CIBIL/Experian/Equifax',
          'Review all accounts and inquiries carefully',
          'Look for accounts you didn\'t open',
          'Check for unauthorized loan applications',
          'Report any fraudulent entries to credit bureau',
          'Place fraud alert on your credit file',
          'Request credit freeze if needed',
        ],
        resourceLinks: ['https://www.cibil.com/', 'https://www.experian.in/'],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Identity Theft - Step 3: Report to Authorities
  const id_step3 = await prisma.guardianStep.create({
    data: {
      workflowId: identityWorkflow.id,
      stepNumber: 3,
      questionText: 'Have you filed an FIR for identity theft at your local police station?',
      explanationText: 'FIR is crucial evidence that your identity was stolen and misused.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: id_step3.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Excellent! Keep FIR copy for disputing fraudulent accounts and transactions.',
        actionItems: [
          'Keep multiple copies of FIR',
          'Share FIR with affected banks/institutions',
          'Use FIR to dispute fraudulent accounts',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: id_step3.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'File FIR immediately under IT Act Section 66C for identity theft.',
        actionItems: [
          'Visit nearest police station or cyber cell',
          'File FIR under IT Act Section 66C (identity theft)',
          'Provide all evidence of misuse',
          'Mention specific instances where identity was misused',
          'Get FIR copy for your records',
          'Share FIR with banks and credit bureaus',
          'File complaint on cybercrime portal also',
        ],
        resourceLinks: ['https://cybercrime.gov.in'],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Identity Theft - Step 4: Notify Institutions
  const id_step4 = await prisma.guardianStep.create({
    data: {
      workflowId: identityWorkflow.id,
      stepNumber: 4,
      questionText: 'Have you informed all banks, telcos, and financial institutions about the identity theft?',
      explanationText: 'Institutions need to know to prevent fraudulent account openings.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: id_step4.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Great! Institutions are now alerted and will flag suspicious activities.',
        actionItems: [
          'Keep all notification confirmations',
          'Follow up weekly for updates',
          'Request enhanced security on all accounts',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: id_step4.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Notify all institutions immediately to prevent new fraudulent accounts.',
        actionItems: [
          'Contact all banks where you have accounts',
          'Inform telecom providers to prevent SIM fraud',
          'Notify income tax department (for PAN misuse)',
          'Alert UIDAI about Aadhaar misuse',
          'Send written notice with FIR copy',
          'Request enhanced verification for any new accounts',
          'Set up fraud alerts on all accounts',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  console.log('✅ Identity Theft workflow created');

  // ============================================
  // 3. PROFESSIONAL EXPOSURE
  // ============================================
  const professionalThreat = await prisma.threatCategory.upsert({
    where: { key: 'PROFESSIONAL_EXPOSURE' },
    update: {},
    create: {
      key: 'PROFESSIONAL_EXPOSURE',
      name: 'Professional Exposure',
      description: 'Work emails leaked, LinkedIn compromised, professional reputation at risk',
    },
  });

  const professionalWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: professionalThreat.id,
      name: 'Professional Exposure Response',
      description: 'Protect your professional reputation and work accounts',
      priority: 3,
      isActive: true,
    },
  });

  // Professional - Step 1: Secure Work Email
  const prof_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: professionalWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you changed your work email password and enabled 2FA?',
      explanationText: 'Work email compromise can lead to company data breaches and client information leaks.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: prof_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Your work email is now more secure.',
        actionItems: [
          'Review recent sent emails for suspicious activity',
          'Check email forwarding rules',
          'Monitor login activity regularly',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: prof_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '⚠️ Secure your work email immediately - it may contain sensitive company data!',
        actionItems: [
          'Change work email password NOW',
          'Enable two-factor authentication',
          'Review email forwarding and filter rules',
          'Check recent login locations and devices',
          'Sign out from all other sessions',
          'Review sent emails for unauthorized messages',
          'Scan for suspicious calendar invites',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Professional - Step 2: Notify IT Department
  const prof_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: professionalWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you informed your company\'s IT security team about the breach?',
      explanationText: 'IT team can investigate company-wide impacts and secure other systems.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: prof_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Perfect! IT team can now monitor for any wider security impacts.',
        actionItems: [
          'Follow IT team\'s additional security recommendations',
          'Cooperate with any internal investigation',
          'Complete any required security training',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: prof_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Notify IT security immediately - company data may be at risk!',
        actionItems: [
          'Email or call IT security team immediately',
          'Provide details: what was compromised, when, how',
          'Share any suspicious emails or activities',
          'Request security audit of your accounts',
          'Ask for guidance on securing work devices',
          'Request monitoring of company network for your credentials',
          'Document the incident timeline',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Professional - Step 3: LinkedIn/Professional Networks
  const prof_step3 = await prisma.guardianStep.create({
    data: {
      workflowId: professionalWorkflow.id,
      stepNumber: 3,
      questionText: 'Have you secured your LinkedIn and professional network accounts?',
      explanationText: 'Compromised professional profiles can damage reputation and enable social engineering attacks.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: prof_step3.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Great! Your professional online presence is now protected.',
        actionItems: [
          'Review recent posts and connection requests',
          'Monitor profile changes',
          'Set up login alerts',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: prof_step3.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Secure your professional accounts now to prevent reputation damage!',
        actionItems: [
          'Change LinkedIn password immediately',
          'Enable two-step verification',
          'Review and remove suspicious connections',
          'Check for unauthorized posts or messages',
          'Review profile changes and experience edits',
          'Secure other professional accounts (GitHub, Stack Overflow, etc.)',
          'Alert your network if account was compromised',
        ],
        resourceLinks: ['https://www.linkedin.com/help/linkedin/answer/a1339154'],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Professional - Step 4: Client Notification
  const prof_step4 = await prisma.guardianStep.create({
    data: {
      workflowId: professionalWorkflow.id,
      stepNumber: 4,
      questionText: 'If client data was potentially exposed, have you informed affected clients?',
      explanationText: 'Transparency with clients maintains trust and allows them to protect themselves.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: prof_step4.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Professional and ethical response. Clients will appreciate the transparency.',
        actionItems: [
          'Provide clients with security recommendations',
          'Offer to answer any security concerns',
          'Document all client communications',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: prof_step4.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'If client data was exposed, inform them immediately - it\'s ethical and may be legally required.',
        actionItems: [
          'Assess what client data may have been exposed',
          'Consult with legal/compliance team',
          'Prepare clear communication about the incident',
          'Notify affected clients promptly',
          'Provide guidance on protective measures',
          'Offer support and monitoring services if applicable',
          'Document all notifications for compliance',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  console.log('✅ Professional Exposure workflow created');

  // ============================================
  // 4. SOCIAL MEDIA VULNERABILITY
  // ============================================
  const socialMediaThreat = await prisma.threatCategory.upsert({
    where: { key: 'SOCIAL_MEDIA_VULNERABILITY' },
    update: {},
    create: {
      key: 'SOCIAL_MEDIA_VULNERABILITY',
      name: 'Social Media Vulnerability',
      description: 'Account hacked, impersonation, privacy breach on social platforms',
    },
  });

  const socialMediaWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: socialMediaThreat.id,
      name: 'Social Media Account Recovery',
      description: 'Steps to recover and secure hacked social media accounts',
      priority: 4,
      isActive: true,
    },
  });

  // Social Media - Step 1: Account Recovery
  const sm_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: socialMediaWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you initiated account recovery through the platform\'s official process?',
      explanationText: 'Quick recovery prevents hackers from causing more damage or locking you out permanently.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: sm_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good start! Follow the recovery process carefully and keep all confirmation emails.',
        actionItems: [
          'Check recovery email regularly',
          'Respond to platform verification requests promptly',
          'Keep recovery confirmation numbers',
        ],
        resourceLinks: [],
        urgencyLevel: 'MEDIUM',
      },
      {
        stepId: sm_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '⚠️ Start account recovery immediately before the hacker locks you out completely!',
        actionItems: [
          'Visit platform\'s help center immediately',
          'Click "I can\'t access my account" or similar option',
          'Use recovery email or phone number',
          'Follow verification steps (ID proof may be required)',
          'Report the hack through official reporting form',
          'For Instagram: use "Need more help" in login screen',
          'For Facebook: visit facebook.com/hacked',
          'For Twitter/X: visit help.twitter.com/forms/account-access',
        ],
        resourceLinks: [
          'https://www.facebook.com/hacked',
          'https://help.instagram.com/',
          'https://help.twitter.com/forms/account-access',
        ],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Social Media - Step 2: Alert Contacts
  const sm_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: socialMediaWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you warned your friends/followers about the hack through alternate channels?',
      explanationText: 'Hackers often send scam messages to your contacts. Warning them prevents spread.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: sm_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Excellent! You\'ve prevented your contacts from falling for scams sent from your account.',
        actionItems: [
          'Post warning on other social media platforms',
          'Keep contacts updated on recovery progress',
          'Thank them for not responding to suspicious messages',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: sm_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Warn your contacts NOW - hackers are likely sending scam messages from your account!',
        actionItems: [
          'Message friends on WhatsApp/SMS about the hack',
          'Post on other social media you still control',
          'Ask them to ignore messages from hacked account',
          'Warn about potential money requests or links',
          'Tell them to report suspicious messages',
          'Ask them not to click any links sent by your account',
          'Update your email contacts if email was compromised',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Social Media - Step 3: Remove Malicious Content
  const sm_step3 = await prisma.guardianStep.create({
    data: {
      workflowId: socialMediaWorkflow.id,
      stepNumber: 3,
      questionText: 'After regaining access, have you deleted all posts/messages made by the hacker?',
      explanationText: 'Hackers often post scams, inappropriate content, or malicious links.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: sm_step3.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Great! Your profile is now clean. Monitor for any reputation damage.',
        actionItems: [
          'Screenshot deleted content for records',
          'Search your name to check for any lingering issues',
          'Monitor tagged posts',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: sm_step3.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Review your account immediately and delete all unauthorized content!',
        actionItems: [
          'Check all recent posts on your profile',
          'Review stories and reels',
          'Check sent messages and DMs',
          'Delete any posts you didn\'t create',
          'Remove tags from suspicious posts',
          'Check for changed profile information',
          'Review and remove unauthorized apps/connections',
          'Check privacy settings for changes',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Social Media - Step 4: Secure Account
  const sm_step4 = await prisma.guardianStep.create({
    data: {
      workflowId: socialMediaWorkflow.id,
      stepNumber: 4,
      questionText: 'Have you changed password, enabled 2FA, and logged out all other devices?',
      explanationText: 'Full security measures prevent re-entry by hackers.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: sm_step4.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Perfect! Your account is now fully secured. Stay vigilant for unusual activity.',
        actionItems: [
          'Set up login alerts',
          'Review connected apps monthly',
          'Use unique password not used elsewhere',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: sm_step4.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '⚠️ Secure your account completely NOW to prevent the hacker from returning!',
        actionItems: [
          'Change password to a strong unique one',
          'Enable two-factor authentication (2FA)',
          'Log out from all devices/sessions',
          'Review and revoke third-party app access',
          'Update recovery email and phone number',
          'Set up login alerts',
          'Review recent login activity',
          'Enable login approvals',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  console.log('✅ Social Media Vulnerability workflow created');

  // ============================================
  // 5. HEALTHCARE PRIVACY RISK
  // ============================================
  const healthcareThreat = await prisma.threatCategory.upsert({
    where: { key: 'HEALTHCARE_PRIVACY_RISK' },
    update: {},
    create: {
      key: 'HEALTHCARE_PRIVACY_RISK',
      name: 'Healthcare Privacy Risk',
      description: 'Medical records leaked, health insurance data exposed',
    },
  });

  const healthcareWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: healthcareThreat.id,
      name: 'Healthcare Data Breach Response',
      description: 'Protect your medical privacy after a health data breach',
      priority: 5,
      isActive: true,
    },
  });

  // Healthcare - Step 1: Contact Healthcare Provider
  const health_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: healthcareWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you contacted the hospital/clinic about the medical records breach?',
      explanationText: 'Healthcare providers must be notified to investigate and prevent further leaks.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: health_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Request a detailed report of what data was exposed.',
        actionItems: [
          'Ask for written confirmation of the breach',
          'Request details of what records were affected',
          'Inquire about breach remediation steps',
        ],
        resourceLinks: [],
        urgencyLevel: 'MEDIUM',
      },
      {
        stepId: health_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Contact your healthcare provider immediately to report the breach!',
        actionItems: [
          'Call hospital/clinic patient services',
          'Request to speak with privacy officer',
          'File written complaint about data breach',
          'Ask what medical records were exposed',
          'Request breach investigation',
          'Ask about security improvements being implemented',
          'Request notification process for affected patients',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Healthcare - Step 2: Notify Insurance
  const health_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: healthcareWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you informed your health insurance company about the potential data breach?',
      explanationText: 'Insurance fraud using your medical information can lead to claim denials and legal issues.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: health_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Smart move! Insurance company can now flag fraudulent claims.',
        actionItems: [
          'Request fraud alerts on your policy',
          'Monitor explanation of benefits (EOB) statements',
          'Review all claims regularly',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: health_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Notify insurance immediately - fraudsters may file fake claims using your information!',
        actionItems: [
          'Call insurance customer service',
          'Report potential medical identity theft',
          'Request fraud alert on your account',
          'Ask for detailed review of recent claims',
          'Request notification for all new claims',
          'Get copies of all EOB statements',
          'Set up online account access for monitoring',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Healthcare - Step 3: Review Medical Records
  const health_step3 = await prisma.guardianStep.create({
    data: {
      workflowId: healthcareWorkflow.id,
      stepNumber: 3,
      questionText: 'Have you requested and reviewed your complete medical records for unauthorized entries?',
      explanationText: 'Fraudulent medical procedures in your records can affect future treatments and insurance.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: health_step3.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Thorough! Report any inaccuracies or fraudulent entries immediately.',
        actionItems: [
          'Keep copies of corrected records',
          'Request amendments to remove fraudulent entries',
          'Document all discrepancies',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: health_step3.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Request your medical records immediately to check for medical identity theft!',
        actionItems: [
          'Submit written request for complete medical records',
          'Review all diagnoses, treatments, and prescriptions',
          'Look for procedures you never had',
          'Check for medications you never received',
          'Verify all dates and doctor names',
          'Report any fraudulent entries to healthcare provider',
          'Request corrections to your medical record',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Healthcare - Step 4: Monitor Credit
  const health_step4 = await prisma.guardianStep.create({
    data: {
      workflowId: healthcareWorkflow.id,
      stepNumber: 4,
      questionText: 'Have you placed fraud alerts and are monitoring for medical debt collections?',
      explanationText: 'Medical identity theft can result in fraudulent bills sent to collections.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: health_step4.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Excellent vigilance! Continue monitoring for at least 12 months.',
        actionItems: [
          'Check credit reports monthly',
          'Review all medical bills carefully',
          'Dispute any fraudulent debts immediately',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: health_step4.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Set up fraud alerts now - medical identity theft can damage your credit!',
        actionItems: [
          'Place fraud alert with credit bureaus',
          'Monitor credit reports for medical collections',
          'Set up alerts for new accounts',
          'Review credit report for medical debts',
          'Dispute any fraudulent medical debts',
          'Consider credit freeze if theft is severe',
          'Keep records of all disputes',
        ],
        resourceLinks: ['https://www.cibil.com/'],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  console.log('✅ Healthcare Privacy Risk workflow created');

  // ============================================
  // 6. LOCATION PRIVACY THREAT
  // ============================================
  const locationThreat = await prisma.threatCategory.upsert({
    where: { key: 'LOCATION_PRIVACY_THREAT' },
    update: {},
    create: {
      key: 'LOCATION_PRIVACY_THREAT',
      name: 'Location Privacy Threat',
      description: 'Real-time location tracking, stalking, address exposure',
    },
  });

  const locationWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: locationThreat.id,
      name: 'Location Privacy Protection',
      description: 'Stop location tracking and protect physical safety',
      priority: 6,
      isActive: true,
    },
  });

  // Location - Step 1: Disable Location Sharing
  const loc_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: locationWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you disabled location sharing on all apps and social media?',
      explanationText: 'Active location sharing can enable stalking and physical threats.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: loc_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Your real-time location is now private.',
        actionItems: [
          'Periodically review location permissions',
          'Check social media posts for location tags',
          'Avoid checking in at regular locations',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: loc_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '⚠️ Disable location sharing immediately to protect your physical safety!',
        actionItems: [
          'Turn off phone location services for non-essential apps',
          'Disable location in Instagram, Facebook, Snapchat settings',
          'Turn off Google Maps location sharing',
          'Disable Find My Friends / similar apps',
          'Remove location from past social media posts',
          'Turn off location metadata in camera settings',
          'Review app permissions and revoke location access',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Location - Step 2: Remove Address from Public Records
  const loc_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: locationWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you requested removal of your address from people search sites and public databases?',
      explanationText: 'Public address listings enable stalking and harassment.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: loc_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Great work! Continue monitoring as these sites often re-list information.',
        actionItems: [
          'Search your name + city monthly',
          'Request removal again if relisted',
          'Use privacy services if needed',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: loc_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Start removing your address from public sites now to reduce stalking risk!',
        actionItems: [
          'Search for your name and address on Google',
          'Contact Justdial, Sulekha to remove listings',
          'Request removal from property websites',
          'Contact voter registration office about privacy options',
          'Remove address from business registrations if possible',
          'Use virtual address for public registrations',
          'Consider address privacy services',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // Location - Step 3: Report Stalking
  const loc_step3 = await prisma.guardianStep.create({
    data: {
      workflowId: locationWorkflow.id,
      stepNumber: 3,
      questionText: 'If you\'re being stalked or harassed, have you filed a police complaint?',
      explanationText: 'Stalking is a serious crime that requires law enforcement intervention.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: loc_step3.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Important step for your safety. Keep all evidence and follow up regularly.',
        actionItems: [
          'Keep complaint number and FIR copy safe',
          'Document all stalking incidents with dates/times',
          'Inform trusted friends and family',
        ],
        resourceLinks: [],
        urgencyLevel: 'MEDIUM',
      },
      {
        stepId: loc_step3.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: '⚠️ If you feel unsafe, file a police complaint immediately! Stalking is a criminal offense.',
        actionItems: [
          'Gather all evidence: messages, photos, videos, emails',
          'Document all incidents with dates, times, locations',
          'Visit nearest police station or women\'s helpline',
          'File complaint under IPC Section 354D (stalking)',
          'Request police protection if needed',
          'Get restraining order if applicable',
          'Inform workplace/building security about the threat',
          'Share situation with trusted contacts',
        ],
        resourceLinks: ['tel:112', 'tel:1091'],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // Location - Step 4: Secure Home Network
  const loc_step4 = await prisma.guardianStep.create({
    data: {
      workflowId: locationWorkflow.id,
      stepNumber: 4,
      questionText: 'Have you secured your home WiFi and checked for tracking devices?',
      explanationText: 'Stalkers may use WiFi tracking or physical GPS devices to monitor you.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: loc_step4.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Your home network is secure. Stay vigilant for any unusual signs.',
        actionItems: [
          'Periodically scan for unknown devices on network',
          'Check vehicle regularly for tracking devices',
          'Monitor for suspicious WiFi networks near home',
        ],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: loc_step4.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Secure your home network and check for tracking devices now!',
        actionItems: [
          'Change WiFi password immediately',
          'Hide WiFi network name (SSID)',
          'Check connected devices for unknowns',
          'Update router firmware',
          'Check vehicle for GPS trackers (under car, wheel wells)',
          'Scan phone for stalkerware apps',
          'Check personal items for AirTags or Tiles',
          'Consider professional sweep if seriously concerned',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  console.log('✅ Location Privacy Threat workflow created');

  // ============================================
  // 7. COMMUNICATION SECURITY (Shorter workflows for remaining threats)
  // ============================================
  const commThreat = await prisma.threatCategory.upsert({
    where: { key: 'COMMUNICATION_SECURITY' },
    update: {},
    create: {
      key: 'COMMUNICATION_SECURITY',
      name: 'Communication Security',
      description: 'Phone tapped, messages intercepted, email compromised',
    },
  });

  const commWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: commThreat.id,
      name: 'Communication Security Response',
      description: 'Secure your communications after a breach',
      priority: 7,
      isActive: true,
    },
  });

  const comm_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: commWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you changed all email and messaging app passwords?',
      explanationText: 'Compromised communications can expose sensitive personal and professional information.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: comm_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Enable 2FA on all accounts for extra security.',
        actionItems: ['Enable 2FA', 'Review recent messages', 'Check forwarding rules'],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: comm_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Change all communication passwords immediately!',
        actionItems: [
          'Change email password',
          'Change WhatsApp, Telegram passwords',
          'Enable 2FA on all apps',
          'Log out all other devices',
          'Check email forwarding rules',
          'Review linked devices',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  const comm_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: commWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you checked your phone for spyware or stalkerware apps?',
      explanationText: 'Spyware can intercept all communications and track your activities.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: comm_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Your device is clean. Keep monitoring regularly.',
        actionItems: ['Run security scans monthly', 'Review installed apps', 'Check battery drain'],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: comm_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Scan your device for spyware immediately!',
        actionItems: [
          'Install reputable antivirus app',
          'Run full device scan',
          'Review all installed apps',
          'Uninstall suspicious apps',
          'Check for unusual battery drain or data usage',
          'Factory reset if spyware found',
          'Change all passwords after cleanup',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  console.log('✅ Communication Security workflow created');

  // ============================================
  // 8-13: Remaining Workflows (Streamlined)
  // ============================================

  // 8. DIGITAL FOOTPRINT RISK
  const digitalFootprintThreat = await prisma.threatCategory.upsert({
    where: { key: 'DIGITAL_FOOTPRINT_RISK' },
    update: {},
    create: {
      key: 'DIGITAL_FOOTPRINT_RISK',
      name: 'Digital Footprint Risk',
      description: 'Excessive personal information online, old accounts exposed',
    },
  });

  const digitalFootprintWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: digitalFootprintThreat.id,
      name: 'Digital Footprint Cleanup',
      description: 'Reduce your digital exposure and clean up old accounts',
      priority: 8,
      isActive: true,
    },
  });

  const df_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: digitalFootprintWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you identified and deleted old, unused online accounts?',
      explanationText: 'Old accounts are vulnerable to breaches and can expose outdated personal information.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: df_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Great cleanup! Continue auditing your online presence quarterly.',
        actionItems: ['Review accounts quarterly', 'Use password manager to track accounts', 'Set calendar reminder'],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: df_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Audit and delete old accounts now to reduce your attack surface!',
        actionItems: [
          'Search email for signup confirmations',
          'Use services like JustDeleteMe',
          'Delete social media accounts you don\'t use',
          'Remove old forum profiles',
          'Close unused email accounts',
          'Request data deletion where possible',
        ],
        resourceLinks: ['https://justdeleteme.xyz'],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // 9. ACCOUNT SECURITY THREAT
  const accountSecurityThreat = await prisma.threatCategory.upsert({
    where: { key: 'ACCOUNT_SECURITY_THREAT' },
    update: {},
    create: {
      key: 'ACCOUNT_SECURITY_THREAT',
      name: 'Account Security Threat',
      description: 'Weak passwords, no 2FA, multiple account compromises',
    },
  });

  const accountSecurityWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: accountSecurityThreat.id,
      name: 'Account Security Hardening',
      description: 'Strengthen all account security immediately',
      priority: 9,
      isActive: true,
    },
  });

  const as_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: accountSecurityWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you enabled two-factor authentication (2FA) on all critical accounts?',
      explanationText: '2FA prevents unauthorized access even if password is compromised.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: as_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Excellent! Use authenticator apps instead of SMS when possible.',
        actionItems: ['Use authenticator app', 'Save backup codes', 'Review 2FA regularly'],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: as_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Enable 2FA immediately on all important accounts!',
        actionItems: [
          'Enable 2FA on email accounts first',
          'Enable 2FA on banking and payment apps',
          'Enable 2FA on social media',
          'Use Google Authenticator or Authy',
          'Save backup codes in secure location',
          'Avoid SMS-based 2FA if app-based available',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // 10. FAMILY PERSONAL SAFETY
  const familySafetyThreat = await prisma.threatCategory.upsert({
    where: { key: 'FAMILY_PERSONAL_SAFETY' },
    update: {},
    create: {
      key: 'FAMILY_PERSONAL_SAFETY',
      name: 'Family & Personal Safety',
      description: 'Children\'s information exposed, family members targeted',
    },
  });

  const familySafetyWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: familySafetyThreat.id,
      name: 'Family Safety Protection',
      description: 'Protect family members from digital threats',
      priority: 10,
      isActive: true,
    },
  });

  const fs_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: familySafetyWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you removed children\'s photos and personal information from public profiles?',
      explanationText: 'Children\'s information can be exploited for identity theft and safety risks.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: fs_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good protection! Continue being mindful about what you share.',
        actionItems: ['Review privacy settings', 'Educate family on privacy', 'Use private sharing'],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: fs_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Remove children\'s information from public view immediately!',
        actionItems: [
          'Delete public photos showing children\'s faces',
          'Remove posts mentioning children\'s names, schools, locations',
          'Set social media to private/friends only',
          'Remove children from profile pictures',
          'Ask family members to do the same',
          'Use private photo sharing apps for family',
        ],
        resourceLinks: [],
        urgencyLevel: 'CRITICAL',
      },
    ],
  });

  // 11. LEGAL COMPLIANCE RISK
  const legalComplianceThreat = await prisma.threatCategory.upsert({
    where: { key: 'LEGAL_COMPLIANCE_RISK' },
    update: {},
    create: {
      key: 'LEGAL_COMPLIANCE_RISK',
      name: 'Legal & Compliance Risk',
      description: 'Regulatory violations, data protection law breaches',
    },
  });

  const legalComplianceWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: legalComplianceThreat.id,
      name: 'Legal Compliance Response',
      description: 'Address legal and regulatory compliance issues',
      priority: 11,
      isActive: true,
    },
  });

  const lc_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: legalComplianceWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you consulted with a legal professional about the breach?',
      explanationText: 'Data breaches may have legal obligations and liability implications.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: lc_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Smart move! Follow all legal advice carefully.',
        actionItems: ['Document all actions', 'Follow legal counsel', 'Keep records'],
        resourceLinks: [],
        urgencyLevel: 'MEDIUM',
      },
      {
        stepId: lc_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Consult legal counsel immediately to understand your obligations!',
        actionItems: [
          'Contact cybersecurity lawyer',
          'Understand notification requirements under DPDP Act',
          'Check if 72-hour breach notification applies',
          'Document all breach details',
          'Understand potential liability',
          'Get advice on regulatory compliance',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // 12. EDUCATIONAL RECORDS EXPOSURE
  const educationThreat = await prisma.threatCategory.upsert({
    where: { key: 'EDUCATIONAL_RECORDS_EXPOSURE' },
    update: {},
    create: {
      key: 'EDUCATIONAL_RECORDS_EXPOSURE',
      name: 'Educational Records Exposure',
      description: 'Academic records leaked, student information compromised',
    },
  });

  const educationWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: educationThreat.id,
      name: 'Educational Data Breach Response',
      description: 'Protect academic records and student information',
      priority: 12,
      isActive: true,
    },
  });

  const ed_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: educationWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you contacted your educational institution about the data breach?',
      explanationText: 'Schools/universities must be notified to secure systems and prevent fraud.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: ed_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Request details about what was exposed.',
        actionItems: ['Request breach details', 'Monitor for fake transcripts', 'Verify credentials'],
        resourceLinks: [],
        urgencyLevel: 'MEDIUM',
      },
      {
        stepId: ed_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Contact your institution immediately!',
        actionItems: [
          'Email/call registrar office',
          'Report the breach incident',
          'Request security review of your records',
          'Ask about verification procedures for transcript requests',
          'Request alerts for any record access',
          'Change student portal password',
        ],
        resourceLinks: [],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  // 13. DIGITAL REPUTATION THREAT
  const reputationThreat = await prisma.threatCategory.upsert({
    where: { key: 'DIGITAL_REPUTATION_THREAT' },
    update: {},
    create: {
      key: 'DIGITAL_REPUTATION_THREAT',
      name: 'Digital Reputation Threat',
      description: 'False information spread, defamation, online harassment',
    },
  });

  const reputationWorkflow = await prisma.guardianWorkflow.create({
    data: {
      threatCategoryId: reputationThreat.id,
      name: 'Digital Reputation Protection',
      description: 'Address reputation damage and false information',
      priority: 13,
      isActive: true,
    },
  });

  const dr_step1 = await prisma.guardianStep.create({
    data: {
      workflowId: reputationWorkflow.id,
      stepNumber: 1,
      questionText: 'Have you documented all false or defamatory content about you?',
      explanationText: 'Documentation is crucial for legal action and content removal requests.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: dr_step1.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Keep all evidence timestamped and preserved.',
        actionItems: ['Timestamp all evidence', 'Use archive.org', 'Keep screenshots'],
        resourceLinks: [],
        urgencyLevel: 'MEDIUM',
      },
      {
        stepId: dr_step1.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Document everything immediately before content is removed or changed!',
        actionItems: [
          'Take screenshots with visible URLs and dates',
          'Save archived copies using archive.org',
          'Document URLs of all offensive content',
          'Record dates and times of posts',
          'Save all harassing messages',
          'Document impact on personal/professional life',
        ],
        resourceLinks: ['https://archive.org'],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  const dr_step2 = await prisma.guardianStep.create({
    data: {
      workflowId: reputationWorkflow.id,
      stepNumber: 2,
      questionText: 'Have you requested content removal from platforms and search engines?',
      explanationText: 'Most platforms have processes for removing defamatory or harassing content.',
      isConditional: false,
    },
  });

  await prisma.guardianOption.createMany({
    data: [
      {
        stepId: dr_step2.id,
        optionText: 'Yes',
        optionValue: true,
        guidanceText: 'Good! Follow up regularly on removal requests.',
        actionItems: ['Track request IDs', 'Follow up weekly', 'Escalate if needed'],
        resourceLinks: [],
        urgencyLevel: 'LOW',
      },
      {
        stepId: dr_step2.id,
        optionText: 'No',
        optionValue: false,
        guidanceText: 'Submit removal requests immediately to limit damage!',
        actionItems: [
          'Report content to social media platforms',
          'Request Google search result removal (if applicable)',
          'File DMCA takedown for copyrighted images',
          'Report to website hosting providers',
          'Use platform-specific reporting tools',
          'Request expedited review for severe cases',
        ],
        resourceLinks: ['https://www.google.com/webmasters/tools/legal-removal-request'],
        urgencyLevel: 'HIGH',
      },
    ],
  });

  console.log('✅ All 13 Guardian Mode workflows created successfully!');
}

seedGuardianMode()
  .catch((e) => {
    console.error('❌ Error seeding Guardian Mode:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
