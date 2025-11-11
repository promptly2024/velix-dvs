export const breachNotificationTemplate = {
  subject: (breachCount: number) => 
    `Security Alert: ${breachCount} Data Breach${breachCount > 1 ? 'es' : ''} Found`,
  
  html: (
    checkedEmail: string,
    breachCount: number,
    breachList: string,
  ) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Security Alert: Data Breaches Detected</h2>
      
      <p>We found <strong>${breachCount}</strong> data breach${breachCount > 1 ? 'es' : ''} affecting the email address: <strong>${checkedEmail}</strong></p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <h3 style="color: #991b1b; margin-top: 0;">Affected Breaches:</h3>
        <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${breachList}</pre>
      </div>
    </div>
  `,
  
  text: (
    checkedEmail: string,
    breachCount: number,
    breachList: string,
  ) => `
Security Alert: ${breachCount} Data Breach${breachCount > 1 ? 'es' : ''} Found

We found ${breachCount} data breach${breachCount > 1 ? 'es' : ''} affecting the email address: ${checkedEmail}

Affected Breaches:
${breachList} `,
};

export const passwordBreachTemplate = {
  subject: (pwnCount: number) => 
    `Critical: Password Found in ${pwnCount.toLocaleString()} Data Breaches`,
  
  html: (pwnCount: number, severity: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Critical Security Alert</h2>
      
      <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <p style="color: #991b1b; font-size: 18px; margin: 0;">
          <strong>Your password has been found in ${pwnCount.toLocaleString()} data breaches!</strong>
        </p>
        <p style="color: #991b1b; margin: 10px 0 0 0;">
          Severity: <strong>${severity}</strong>
        </p>
      </div> `,
  
  text: (pwnCount: number, severity: string) => `Critical Security Alert

Your password has been found in ${pwnCount.toLocaleString()} data breaches!
Severity: ${severity}`,
};

export const batchReportTemplate = {
  subject: (totalBreaches: number) => 
    `Batch Email Check Complete - ${totalBreaches} Total Breaches Found`,
  
  html: (resultsList: string, totalBreaches: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Batch Email Check Results</h2>
      
      <p>Your batch email check has completed. Here's a summary:</p>
      
      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Results Summary:</h3>
        <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${resultsList}</pre>
      </div>
      
      <div style="background-color: #fef2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0; color: #991b1b;">
          <strong>Total Breaches Found:</strong> ${totalBreaches}
        </p>
      </div>
    </div>
  `,
  
  text: (resultsList: string, totalBreaches: number) => `
Batch Email Check Results

Your batch email check has completed. Here's a summary:

${resultsList}

Total Breaches Found: ${totalBreaches}
  `,
};
