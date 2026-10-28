import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Generate secure login credentials for approved owners
 */
export const generateOwnerCredentials = (owner) => {
  // Use owner's email as login email
  const email = owner.email;

  // Generate a secure random password
  const password = generateSecurePassword();

  return {
    email,
    password,
    tempPassword: true // Flag to indicate this is a temporary password
  };
};

/**
 * Generate a secure random password
 */
const generateSecurePassword = () => {
  // Generate a 12-character password with mix of letters, numbers, and symbols
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  let password = '';

  // Ensure at least one character from each type
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@#$%&*';

  // Add one character from each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password to randomize character positions
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Hash password for storage
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

