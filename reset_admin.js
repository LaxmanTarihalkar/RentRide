import bcrypt from 'bcryptjs';
import { supabase } from './server/config/supabase.js';

const resetAdminPassword = async () => {
  try {
    console.log('🔧 Resetting admin password...');
    
    const email = 'admin@rentride.com';
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Check if admin user exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for admin user:', checkError);
      process.exit(1);
    }

    if (existingAdmin) {
      console.log(`👤 Admin user found (ID: ${existingAdmin.id}). Updating password...`);
      
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ 
            password: hashedPassword,
            email_verified: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', existingAdmin.id)
        .select();

      if (updateError) {
        console.error('❌ Error updating admin password:', updateError);
        process.exit(1);
      }
      
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('👤 Admin user not found. Creating new admin user...');
      
      const { data, error: createError } = await supabase
        .from('users')
        .insert([{
          email: email,
          password: hashedPassword,
          first_name: 'Admin',
          last_name: 'User',
          email_verified: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creating admin user:', createError);
        process.exit(1);
      }
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log(`\n🎉 You can now login with:\nEmail: ${email}\nPassword: ${newPassword}`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
