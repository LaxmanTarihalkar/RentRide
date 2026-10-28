import { supabase } from '../config/supabase.js';
import { sendPickupReminder } from './emailService.js';

// Check for bookings that need pickup reminders (30 minutes before pickup)
export const checkAndSendPickupReminders = async () => {
  try {
    console.log('🔍 Checking for pickup reminders...');
    
    // Calculate the time 30 minutes from now
    const reminderTime = new Date();
    reminderTime.setMinutes(reminderTime.getMinutes() + 30);
    
    // Find bookings that need reminders
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users!inner(email, first_name, last_name)
      `)
      .eq('booking_status', 'confirmed')
      .gte('pickup_date', new Date().toISOString().split('T')[0]); // Only future bookings

    if (error) {
      console.error('Error fetching bookings for reminders:', error);
      console.log('💡 This might be because the database schema needs to be updated. Please run the DATABASE_UPDATE.sql script.');
      return;
    }

    if (!bookings || bookings.length === 0) {
      console.log('📭 No bookings found for reminder checking');
      return;
    }

    // Filter bookings that need reminders (30 minutes before pickup)
    const bookingsNeedingReminders = bookings.filter(booking => {
      // Skip if reminder already sent (if column exists)
      if (booking.reminder_email_sent === true) {
        return false;
      }

      // Calculate pickup time (use pickup_datetime if available, otherwise combine date and time)
      let pickupTime;
      if (booking.pickup_datetime) {
        pickupTime = new Date(booking.pickup_datetime);
      } else {
        // Fallback: combine date and time
        const timeStr = booking.pickup_time || '10:00:00';
        pickupTime = new Date(`${booking.pickup_date}T${timeStr}`);
      }

      // Check if pickup is within 30 minutes
      const timeDiff = pickupTime.getTime() - new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      return timeDiff > 0 && timeDiff <= thirtyMinutes;
    });

    if (bookingsNeedingReminders.length === 0) {
      console.log('📭 No pickup reminders to send at this time');
      return;
    }

    console.log(`📧 Found ${bookingsNeedingReminders.length} bookings needing pickup reminders`);

    // Send reminders for each booking
    for (const booking of bookingsNeedingReminders) {
      try {
        const user = booking.users;
        const emailResult = await sendPickupReminder(booking, user);
        
        if (emailResult.success) {
          // Mark reminder as sent (if column exists)
          try {
            await supabase
              .from('bookings')
              .update({ reminder_email_sent: true })
              .eq('id', booking.id);
          } catch (updateError) {
            console.log('Note: Could not update reminder_email_sent flag - database schema may need updating');
          }
          
          console.log(`✅ Pickup reminder sent for booking ${booking.id.slice(-8)}`);
        } else {
          console.error(`❌ Failed to send reminder for booking ${booking.id.slice(-8)}:`, emailResult.error);
        }
      } catch (error) {
        console.error(`❌ Error processing reminder for booking ${booking.id.slice(-8)}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error in checkAndSendPickupReminders:', error);
  }
};

// Start the reminder service (runs every 5 minutes) - DISABLED until schema is fully updated
export const startReminderService = () => {
  console.log('⏸️  Reminder service temporarily disabled - database schema updating');
  console.log('💡 To enable reminders, ensure database schema matches new column names');
  
  // Uncomment below when database schema is fully updated
  // console.log('🚀 Starting pickup reminder service...');
  // checkAndSendPickupReminders();
  // setInterval(checkAndSendPickupReminders, 5 * 60 * 1000);
  // console.log('⏰ Reminder service started - checking every 5 minutes');
};

// Manual trigger for testing
export const triggerRemindersNow = async () => {
  console.log('🔧 Manually triggering pickup reminders...');
  await checkAndSendPickupReminders();
};