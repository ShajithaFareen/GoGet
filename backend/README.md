# Go Get Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/goget
   PORT=5000
   JWT_SECRET=your_jwt_secret_here

   # Twilio Configuration (for SMS features)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_FROM_NUMBER=+1234567890  # Your Twilio phone number
   TWILIO_REQUEST_NUMBER=+0987654321 # Phone number for receiving SMS requests
   ```

3. Start the server:
   ```bash
   node server.js
   ```

## Twilio SMS Setup

### For Outbound SMS (Web Form)
The app can send SMS notifications when requests are created via the web form.

### For Inbound SMS (Mobile Requests)
Users can send SMS directly to create requests without internet access.

#### SMS Format:
```
HELP <CATEGORY> <DESCRIPTION> <LOCATION>
```

#### Examples:
- `HELP FOOD 3 PEOPLE CHENNAI`
- `HELP MEDICAL MEDICINE DELHI`
- `HELP CLOTHES WINTER CLOTHES MUMBAI`

#### Twilio Webhook Configuration:
1. In your Twilio Console, go to Phone Numbers
2. Select your phone number
3. Under "Messaging", set the webhook URL to:
   ```
   https://yourdomain.com/api/twilio/webhook
   ```
   Or for local development with ngrok:
   ```
   https://your-ngrok-url.ngrok.io/api/twilio/webhook
   ```
4. Set the method to `POST`

#### Categories:
- FOOD (Food)
- MED (Medical)
- CLOTH (Clothes)
- Anything else defaults to Emergency

The system will automatically:
- Parse the SMS
- Create a request in the database
- Send a confirmation SMS back to the user
- Mark SMS requests as High urgency by default

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/requests` - Create request (web form or Twilio SMS)
- `GET /api/requests` - Get requests (filtered by role)
- `POST /api/twilio/webhook` - Twilio SMS webhook (no auth required)