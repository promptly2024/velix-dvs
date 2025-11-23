export const createResponseSchema = () => ({
  type: "object",
  properties: {
    email: {
      type: "string",
      description: "The email address being searched",
    },
    socialMediaAccounts: {
      type: "array",
      description: "List of social media accounts found",
      items: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            description: "Platform name (e.g., LinkedIn, Instagram)",
          },
          hasAccount: {
            type: "boolean",
            description: "Whether an account was found",
          },
          url: {
            type: "string",
            description: "Profile URL if found",
          },
          username: {
            type: "string",
            description: "Username or handle",
          },
          profileName: {
            type: "string",
            description: "Display name on the platform",
            nullable: true,
          },
        },
        required: ["platform", "hasAccount", "url", "username"],
      },
    },
    professionalInfo: {
      type: "object",
      description: "Professional information found",
      properties: {
        currentCompany: {
          type: "string",
          nullable: true,
        },
        position: {
          type: "string",
          nullable: true,
        },
        location: {
          type: "string",
          nullable: true,
        },
        linkedinUrl: {
          type: "string",
          nullable: true,
        },
      },
    },
    personalInfo: {
      type: "object",
      description: "Personal information found from public sources",
      properties: {
        name: {
          type: "string",
          nullable: true,
        },
        phone: {
          type: "string",
          nullable: true,
        },
        address: {
          type: "string",
          nullable: true,
        },
        education: {
          type: "array",
          items: {
            type: "string",
          },
          nullable: true,
        },
      },
    },
    otherOnlinePresence: {
      type: "array",
      description: "Other online profiles, portfolios, or websites",
      items: {
        type: "string",
      },
    },
  },
  required: ["email", "socialMediaAccounts"],
});
