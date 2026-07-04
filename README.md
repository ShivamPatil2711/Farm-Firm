# Farm-Firm

A platform that connects farmers and agricultural firms. Farmers can list their crops, receive purchase requests from firms, and manage their profile, while firms can browse available crops, send requests, and negotiate with quotations.

The project is built with Node.js on the backend, React on the frontend, and MongoDB as the database.

---

## Features

- Crop Listing: Farmers can list crops with name, price, quantity, grade, and crop images.
- Purchase Requests: Firms can browse listed crops and submit purchase requests.
- Request Management: Farmers can accept or reject incoming purchase requests.
- Open Requests: Firms can create open purchase requests that are visible to all users.
- Quotations: Firms and farmers can submit quotations on open requests to negotiate pricing and terms.
- Friend Connections: A friend system allows farmers and firms to send, accept, and reject connection requests.
- Profile Management: Farmers and firms have dedicated profiles displaying listed crops, connections, and request histories.
- SMS Notifications: The system sends SMS updates via Twilio when requests are accepted or rejected.
- Admin Panel: Admin users can monitor user registration and platform activity.
- Authentication: Secure authentication is handled via JSON Web Tokens (JWT) stored in HTTP-only cookies.

---

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT (JSON Web Tokens) stored in HttpOnly cookies |
| Image Uploads | Multer (stored in local filesystem) |
| SMS Notifications | Twilio API |
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Security | bcryptjs for password hashing |

---

## Project Structure

```
Farm-Firm/
├── Backend/
│   ├── controllers/   - Request handlers (auth, farmer, firm, crop, friend, quotation, admin)
│   ├── models/        - Database schemas (Farmer, Firm, Crop, Request, FirmRequest, FriendRequest, Quotation)
│   ├── routes/        - Express API route registration
│   ├── Uploads/       - Local directory for uploaded crop images
│   ├── servicesms.js  - Twilio integration helper script
│   ├── app.js         - Backend server setup and entry point
│   └── .env           - Environment configuration (not tracked in Git)
│
└── Frontend/
    └── vite-project/  - React application using Vite and Tailwind CSS
```

---

## Installation and Configuration

Follow these steps to run the application locally.

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v16 or higher recommended)
- MongoDB Community Server

---

### Step 1: Clone the Repository

Clone the project from GitHub and navigate to the project directory:

```bash
git clone https://github.com/ShivamPatil2711/Farm-Firm.git
cd Farm-Firm
```

---

### Step 2: Configure the Backend

1. Navigate to the Backend folder:
   ```bash
   cd Backend
   ```

2. Create a file named `.env` in the Backend directory and populate it with the following configuration:
   ```
   PORT=4003
   JWT_SECRET=your_jwt_secret_key_here
   MONGO_URI=mongodb://127.0.0.1:27017/farm-firm
   FRONTEND_URL=http://localhost:5173
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_sender_phone_number
   ```

3. Install backend dependencies and start the server:
   ```bash
   npm install
   npm start
   ```

The backend server will run on http://localhost:4003.

---

### Step 3: Configure the Frontend

1. Open a new terminal window and navigate to the Frontend project directory:
   ```bash
   cd Frontend/vite-project
   ```

2. Install frontend dependencies and run the development server:
   ```bash
   npm install
   npm run dev
   ```

The frontend development server will run on http://localhost:5173.

---

### Step 4: Ensure MongoDB is Running

MongoDB must be active for the backend to function.
- On Windows, MongoDB normally starts as a system service.
- If it is not running, start it using your service manager or run the daemon in a separate command prompt:
  ```bash
  mongod
  ```

---

## API Routes

### Authentication Routes

| Method | Endpoint | Description | Authentication Required |
|---|---|---|---|
| POST | /api/signup/:usertype | Create a new user account (usertype can be 'farmer' or 'firm') | No |
| POST | /api/login | Authenticate user and store session cookie | No |
| GET | /api/check-auth | Verify if the user session is active | No |
| POST | /api/logout | Clear user session cookie | Yes |
| GET | /api/profile | Retrieve profile data for the logged-in user | Yes |

### Crop Routes

| Method | Endpoint | Description | Authentication Required |
|---|---|---|---|
| GET | /api/crops | Get all available crops | No |
| GET | /api/crop-details/:cropId | Get detailed information for a specific crop | Yes |
| PUT | /api/crops/:cropId | Update crop specifications | Yes |
| DELETE | /api/crop/:cropId | Remove a crop listing | Yes |
| GET | /api/allrequests | Get all open crop requests | No |

### Farmer Routes

| Method | Endpoint | Description | Authentication Required |
|---|---|---|---|
| POST | /api/add-crop | List a new crop for sale | Yes (Farmer) |
| GET | /api/listed-crops | Get crop listings uploaded by the logged-in farmer | Yes (Farmer) |
| GET | /api/requested-crops | Get purchase requests on the farmer's crops | Yes (Farmer) |
| PATCH | /api/accept/:requestId | Accept a crop purchase request | Yes (Farmer) |
| PATCH | /api/reject/:requestId | Reject a crop purchase request | Yes (Farmer) |
| GET | /api/farmer/profile | Get farmer profile overview | Yes (Farmer) |
| PATCH | /api/requests/accept/:requestId | Accept an open request quotation | Yes (Farmer) |

### Firm Routes

| Method | Endpoint | Description | Authentication Required |
|---|---|---|---|
| POST | /api/crop-request/:cropId | Send a purchase request for a listed crop | Yes (Firm) |
| GET | /api/myrequests | Get all purchase requests sent by the firm | Yes (Firm) |
| GET | /api/firm/profile | Get firm profile overview | Yes (Firm) |
| GET | /api/farmers | Get list of all registered farmers | Yes (Firm) |
| POST | /api/add-request | Submit an open request for crops | Yes (Firm) |

### Friend System Routes

| Method | Endpoint | Description | Authentication Required |
|---|---|---|---|
| GET | /api/users | Get list of all users to make connections | Yes |
| GET | /api/friend-profile/:id | View the profile of a connection | Yes |
| POST | /api/friend-request | Send a friend connection request | Yes |
| GET | /api/friend-requests/:userId | Get pending connection requests for a user | Yes |
| POST | /api/friend-requests/accept/:reqId | Accept a connection request | Yes |
| POST | /api/friend-requests/reject/:reqId | Reject a connection request | Yes |

### Quotation Routes

| Method | Endpoint | Description | Authentication Required |
|---|---|---|---|
| GET | /api/quotation/:requestId | Get quotations submitted for a specific request | Yes |
| POST | /api/quotation | Submit a pricing quotation on an open request | Yes (Firm) |
| GET | /api/my-quotations | Get quotations submitted by the logged-in farmer | Yes (Farmer) |
| POST | /api/quotation/accept/:quotationId | Accept a quotation | Yes |
| POST | /api/quotation/reject/:quotationId | Reject a quotation | Yes |

### Admin Routes

| Method | Endpoint | Description | Authentication Required |
|---|---|---|---|
| GET | /api/admin | Retrieve platform user list | Yes (Admin) |

---

## User Workflows

### Farmers
- Registration: Register with name, phone number, and location details.
- Listing Crops: Add crop listings by specifying name, grade, total quantity, minimum order quantity, unit price, and uploading a cover image.
- Order Management: Receive notifications when a firm sends a purchase request. Accept or reject the request. Acceptance automatically updates inventory by deducting the ordered quantity.
- Negotiations: Browse open requests from firms and submit quotations with custom offers.

### Firms
- Registration: Register with company name, contact details, and location.
- Browsing: Search and browse crop listings posted by farmers.
- Purchase Requests: Send custom purchase requests specifying requested quantities for listed crops.
- Open Requests: List purchase requests for crop supplies. Farmers can bid on these requests by submitting quotations.
- Connections: Build networks by connecting with farmers through the friend system.

---

## Environment Variables Configuration

| Variable | Description |
|---|---|
| PORT | Port number for the backend server (default: 4003) |
| JWT_SECRET | Private key used for signing session tokens |
| MONGO_URI | Database connection string for MongoDB |
| FRONTEND_URL | Allowed origin URL for CORS requests |
| TWILIO_ACCOUNT_SID | Account identification token from Twilio console |
| TWILIO_AUTH_TOKEN | Authentication token from Twilio console |
| TWILIO_PHONE_NUMBER | Phone number assigned by Twilio to send SMS notifications |
