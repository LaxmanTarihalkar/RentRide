import { supabase } from './supabase.js';

// User database operations
const userDB = {
  // Create new user
  async createUser(email, hashedPassword, firstName, lastName, role = 'customer') {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          role,
          email_verified: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Find user by email
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  // Find user by ID
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user
  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Verify user email
  async verifyEmail(id) {
    return this.updateUser(id, { email_verified: true });
  },

  // Update password
  async updatePassword(id, hashedPassword) {
    return this.updateUser(id, { password: hashedPassword });
  },
};

// Verification tokens
const tokenDB = {
  // Create verification token
  async createToken(userId, token, type, expiresAt) {
    const { data, error } = await supabase
      .from('verification_tokens')
      .insert([
        {
          user_id: userId,
          token,
          type, // 'email_verification' or 'password_reset'
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Find valid token
  async findValidToken(token, type) {
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('type', type)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Mark token as used
  async markTokenUsed(id) {
    const { data, error } = await supabase
      .from('verification_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete expired tokens (cleanup)
  async deleteExpiredTokens() {
    const { error } = await supabase
      .from('verification_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  },
};

export { userDB, tokenDB };