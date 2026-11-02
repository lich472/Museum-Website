# Regional Museum Website

A full-stack web application for a regional museum that allows visitors to explore exhibitions and collections, discover events, plan their visit, make bookings, and manage memberships. Staff can manage museum content through an administration dashboard.

## Features

### Visitor Features
- Browse exhibitions and collection items.
- Explore museum events and event details.
- View visitor information, opening hours, and accessibility facilities.
- Make bookings for museum events.
- Manage memberships.
- Receive booking confirmation emails.
- Get personalised recommendations.

### Staff Features
- Access the administration dashboard.
- Manage exhibitions, events, and collection items.
- Update visitor information, including opening hours and accessibility details.
- Manage museum content through the administrative interface.

## Technologies Used

**Frontend**
- React
- Vite
- JavaScript / TypeScript
- CSS

**Backend**
- Node.js
- Express
- TypeScript
- MongoDB
- Redis (where configured)

**External Services**
- Resend for booking confirmation emails
- Render for deployment

## Installation and Setup

### Prerequisites

Make sure you have installed:
- Node.js and npm
- Git
- MongoDB access and the required environment variables

### 1. Clone the Repositories

Clone repositories.

```bash
git clone https://github.com/lich472/Museum-Website.git
```

### 2. Install Backend Dependencies

Open a terminal and navigate to the backend repository:

```bash
cd ./backend
npm install
```

Create a `.env` file in the backend directory and configure the environment variables required by the application. See the Environment Variables section below.

### 3. Start the Backend

In the backend directory, run:

```bash
npm run dev
```

The backend runs at:

http://localhost:5001

On startup, the application initialises demo data, including exhibitions, events, collection items, visitor information, and test accounts, according to the project's seed-data setup.

**Important:** If your seed process resets existing data, use a development database rather than a database containing important information.

### 4. Install Frontend Dependencies

Open another terminal and navigate to the frontend repository:

```bash
cd ..
cd ./frontend
npm install
```

Configure the frontend environment variables if required.

### 5. Start the Frontend

In a separate terminal, run:

```bash
npm run dev
```

The Vite development server runs at:

http://localhost:5173

Open the URL in your browser to access the website.

The frontend development server proxies `/api` requests to the backend. Make sure the proxy configuration points to `http://localhost:5001`.

## Demo Test Accounts

The following accounts are provided for demonstration and testing purposes.

| Role | Email | Password |
|---|---|---|
| Visitor | `visitor@gmail.com` | `Password1234` |
| Staff (Admin) | `admin@gmail.com` | `Password1234` |

These are demo credentials only. Do not use them for a production deployment.

## Booking Confirmation Emails

The application uses [Resend](https://resend.com/) to send booking confirmation emails.

Due to the restrictions of the free Resend plan and the current email configuration, booking confirmation emails are sent only to the project owner's email address:

`nguyenthanhlich18052003@gmail.com`

If you want to test email delivery using your own email address, create a Resend account, configure your sender details as required by Resend, and replace the project's `RESEND_API_KEY` with your own API key.

Keep API keys and other secrets in your backend `.env` file. Never commit them to GitHub.

## Environment Variables

Configure the required variables in your local environment files. The exact variable names should match those used by the application.

### Backend

Typical configuration includes:

```env
PORT=5001
MONGODB_URI=<your-mongodb-connection-string>
RESEND_API_KEY=<your-resend-api-key>
```

Add any other variables required by your backend, such as authentication secrets or Redis connection settings.

### Frontend

If the frontend needs to connect directly to a separately deployed backend, configure its API base URL. For local development, use the Vite proxy configuration if the project is set up for it.

For example:

```env
VITE_API_URL=<your-backend-api-url>/api
```

Do not add the example value above unless your frontend code reads `VITE_API_URL`.

## Troubleshooting

### Booking confirmation emails are not received
- Check that `RESEND_API_KEY` is configured correctly.
- Check the sender configuration in Resend.
- Confirm that the recipient is permitted by your current Resend account configuration.

### Demo accounts or sample data are missing
- Check the backend startup logs for errors.
- Confirm that the database connection is working.
- Check that the seed-data setup runs successfully when the backend starts.

## Project Structure

The project is maintained in separate frontend and backend repositories.

```text
regional-museum/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── lib/
│   └── server.ts
└── frontend/
    ├── src/
    ├── public/
    └── package.json
```

*The structure above is illustrative. Your actual directory structure may differ.*

## Deployment

The application is deployed using Render.

- **Frontend:** https://museum-website-frontend.onrender.com
- **Backend API base URL:** https://museum-website.onrender.com/api

The frontend must use the correct backend API URL when the two services are deployed separately.

## Notes

- The demo accounts are intended for testing only.
- Configure your own environment variables before running the application.
- Never commit `.env` files, database credentials, API keys, or authentication secrets.
