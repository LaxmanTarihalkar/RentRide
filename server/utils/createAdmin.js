import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

export const createAdminUser = async () => {
  try {
    console.log('🔧 Creating admin user...');
    
    // Hash the admin password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'admin@rentride.com')
      .single();

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return { success: true, message: 'Admin user exists' };
    }

    // Create admin user (without role column for now)
    const { data: newAdmin, error: createError } = await supabase
      .from('users')
      .insert([{
        email: 'admin@rentride.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        email_verified: true
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating admin user:', createError);
      return { success: false, error: createError };
    }

    console.log('✅ Admin user created successfully:', newAdmin.email);
    return { success: true, data: newAdmin };

  } catch (error) {
    console.error('❌ Error in createAdminUser:', error);
    return { success: false, error };
  }
};

// Function to ensure admin user exists on server startup
export const ensureAdminExists = async () => {
  try {
    const result = await createAdminUser();
    if (result.success) {
      console.log('🎯 Admin user ready for login: admin@rentride.com / admin123');
    } else {
      console.error('⚠️ Failed to ensure admin user exists');
    }
  } catch (error) {
    console.error('⚠️ Error ensuring admin exists:', error);
  }
};