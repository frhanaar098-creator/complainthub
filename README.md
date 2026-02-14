# ComplaintHub

A full-stack web application for students to raise college complaints and managers to review, sort, update status, and remove them.

## Tech Stack

- **Frontend:** React 18, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Auth:** JWT

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update:

```
PORT=5000
MONGO_URI=mongodb+srv://frhanaar098_db_user:YOUR_PASSWORD@cluster0.ungznq2.mongodb.net/complaints_db
JWT_SECRET=your_secret_key
```

Replace `YOUR_PASSWORD` with your MongoDB Atlas password.

Start the backend:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000` and proxies `/api` to the backend.

## Features

### Common Login
- Register as Student or Manager
- Login with email/password
- Role-based redirect: students → `/student/dashboard`, managers → `/manager/dashboard`

### Student Module
- Raise complaints (title, description, category)
- Track all own complaints and their status
- Categories: Infrastructure, Academics, Hostel, Library, Cafeteria, Sports & Recreation, Transportation, Security, Fees & Finance, Laboratory, WiFi & Internet, Cleanliness, Faculty & Staff, Administration, Exam & Evaluation, Others

### Manager Module
- View all complaints in a table
- Sort by date or status
- Filter by status and category
- Change complaint status (pending, in_progress, resolved, rejected)
- Remove complaints (with confirmation)

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | No | - | Register (student or manager) |
| POST | /api/auth/login | No | - | Login |
| GET | /api/complaints | Yes | Both | List complaints |
| POST | /api/complaints | Yes | Student | Create complaint |
| PATCH | /api/complaints/:id | Yes | Manager | Update status |
| DELETE | /api/complaints/:id | Yes | Manager | Delete complaint |
