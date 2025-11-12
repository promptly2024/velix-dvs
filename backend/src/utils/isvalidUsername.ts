// Utility function to validate usernames
export const isValidUsername = (username: string): { success: boolean, message?: string } => {
    if (typeof username !== 'string') {
        return { success: false, message: "Username must be a string." };
    }

    if (username.length < 3 || username.length > 20) {
        return { success: false, message: "Username must be between 3 and 20 characters long." };
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/; // Letters, numbers, underscores, hyphens
    if (!usernameRegex.test(username)) {
        return {
            success: false,
            message: "Username can only contain letters, numbers, underscores (_), and hyphens (-)."
        };
    }

    if (username.startsWith('_') || username.startsWith('-') || username.endsWith('_') || username.endsWith('-')) {
        return {
            success: false,
            message: "Username cannot start or end with an underscore or hyphen."
        };
    }

    return { success: true };
};