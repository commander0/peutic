import { Database } from './database';

export const EmailService = {
  sendWelcomeEmail: (email: string, name: string) => {
    const subject = "Welcome to Peutic - Your Journey Begins";
    const body = `
      Hi ${name},
      
      Welcome to Peutic. We are honored to be part of your journey towards mental clarity and emotional well-being.
      
      Your private sanctuary is ready. You can now connect with our specialists 24/7.
      
      Warm regards,
      The Peutic Team
    `;
    Database.sendEmail(email, subject, body);
  },

  sendVerificationEmail: (email: string, code: string) => {
    const subject = "Verify your Peutic Account";
    const body = `
      Your verification code is: ${code}
      
      Please enter this code to complete your registration.
    `;
    Database.sendEmail(email, subject, body);
  },

  sendReceipt: (email: string, amount: number, cost: number) => {
    const subject = "Your Transaction Receipt";
    const body = `
      Thank you for your purchase.
      
      Amount Added: ${amount} minutes
      Total Cost: $${cost.toFixed(2)}
      
      Your balance has been updated.
    `;
    Database.sendEmail(email, subject, body);
  },
  
  sendAccountDeletionNotice: (email: string) => {
    const subject = "Account Deleted";
    const body = `
      Your Peutic account has been permanently deleted as requested. 
      Any remaining credits have been forfeited.
      
      We hope to see you again in the future.
    `;
    Database.sendEmail(email, subject, body);
  }
};