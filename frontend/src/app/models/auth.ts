// Interface representing the data required for email verification.
export interface EmailVerification {
    email: string;
    code: string; 
}

// Interface representing the data required for user login.
export interface UserLogin {
    email: string;
    password: string;
}

// Interface representing the data required for user registration.
export interface UserRegister {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

// Interface representing the data required for password reset.
export interface PasswordReset {
    email: string; // The email address of the user.
    newPassword: string; // The new password chosen by the user.
    confirmNewPassword: string; // The repeated new password for confirmation.
}
