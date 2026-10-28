# RentRide — Multi-Vehicle Rental Platform

RentRide is a web-based platform designed to help users discover, explore, and book rental vehicles. It provides vehicle browsing, booking management, user authentication, and vehicle owner management.

## Features

- Browse and explore available vehicles
- Vehicle booking and booking management
- User authentication and profile management
- Vehicle owner and vehicle management
- Admin panel for platform administration
- Vehicle availability tracking
- Interactive maps
- Email notifications for bookings
- Payment integration using Razorpay
- Supabase database integration
- Multi-language support

*Only retain features that are implemented and working in your project.*

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

**Backend and Services**
- Node.js
- Supabase
- Razorpay
- Email integration

*Verify the backend technologies against your actual project configuration.*

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/LaxmanTarihalkar/RentRide.git
   ```

2. Navigate to the project directory:

   ```bash
   cd RentRide
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure your environment variables using `.env.example`. Never commit real credentials or secret keys.

5. Start the development server:

   ```bash
   npm run dev
   ```

## Environment Variables

Configure the environment variables required by your application. Refer to `.env.example` for the variable names and setup instructions.

Do not publish API secrets, database passwords, access tokens, or private user data.

## Project Structure

- `src/` — Frontend source code
- `public/` — Static assets
- `server/` — Server-side code, if applicable
- `scripts/` — Utility and maintenance scripts
- `supabase` and SQL files — Database setup and schema, where applicable

## Future Improvements

Potential improvements include enhanced booking workflows, mobile support, and additional vehicle management capabilities.

## License

A license can be added once the project's distribution and reuse terms have been decided.
