# GoGet

GoGet is a web application that connects people who need help (food, medicine, clothes, or emergency support) with donors who can provide it. Requests can be created through a web form or by sending a simple SMS, so people without internet access can still ask for help.

## Features

- **User accounts:** registration and login with role-based access (requesters, donors, admins)
- **Create requests:** submit a help request through the web form
- **SMS requests:** send a text message to create a request without internet access (via Twilio)
- **Browse requests:** donors can view open requests
- **Dashboards:** separate Donor and Admin dashboards
- **SMS confirmations:** automatic confirmation message sent back to the requester

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React, Vite                    |
| Backend  | Node.js, Express               |
| Database | MongoDB                        |
| SMS      | Twilio                         |
| Auth     | JWT                            |

## Project Structure

```
GoGet/
├── backend/
│   ├── controllers/     # Admin, auth and request logic
│   ├── middleware/      # Authentication middleware
│   ├── models/          # User, Request, Donation (Mongoose models)
│   ├── routes/          # API routes
│   └── server.js        # Server entry point
└── frontend/
    └── src/
        ├── context/     # AuthContext
        └── pages/       # Home, LoginRegister, CreateRequest,
                         # ViewRequests, DonorDashboard, AdminDashboard
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string
- A [Twilio](https://www.twilio.com/) account (only needed for SMS features)

### 1. Clone the repository

```bash
git clone https://github.com/ShajithaFareen/GoGet.git
cd GoGet
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```
MONGODB_URI=mongodb://127.0.0.1:27017/goget
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Twilio Configuration (for SMS features)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_REQUEST_NUMBER=+0987654321
```

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

Start the server:

```bash
node server.js
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at the URL shown in the terminal (usually `http://localhost:5173`).

## SMS Requests (Twilio)

Users can create a request by sending an SMS in this format:

```
HELP <CATEGORY> <DESCRIPTION> <LOCATION>
```

**Examples**

- `HELP FOOD 3 PEOPLE CHENNAI`
- `HELP MEDICAL MEDICINE DELHI`
- `HELP CLOTHES WINTER CLOTHES MUMBAI`

**Categories**

| Keyword | Category  |
| ------- | --------- |
| FOOD    | Food      |
| MED     | Medical   |
| CLOTH   | Clothes   |
| Other   | Emergency |

SMS requests are marked **High urgency** by default, and the sender receives a confirmation SMS.

**Webhook configuration**

1. In the Twilio Console, go to **Phone Numbers** and select your number.
2. Under **Messaging**, set the webhook URL to `https://yourdomain.com/api/twilio/webhook`.
   For local development with ngrok, use `https://your-ngrok-url.ngrok.io/api/twilio/webhook`.
3. Set the method to `POST`.

## API Endpoints

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| POST   | `/api/auth/register`   | Register a new user                            |
| POST   | `/api/auth/login`      | Log in                                         |
| POST   | `/api/requests`        | Create a request (web form or Twilio SMS)      |
| GET    | `/api/requests`        | Get requests (filtered by user role)           |
| POST   | `/api/twilio/webhook`  | Twilio SMS webhook (no authentication required)|

More details are in [`backend/README.md`](backend/README.md).

## Author

**Shajitha Fareen**
GitHub: [@ShajithaFareen](https://github.com/ShajithaFareen)
