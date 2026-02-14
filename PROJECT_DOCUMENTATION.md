# ComplaintHub

## Basic Details

**Team Name:** [Your Team Name]

**Team Members:**
- Member 1: [Name] - [College]
- Member 2: [Name] - [College]

**Hosted Project Link:** [Add your hosted link here]

---

## Project Description

ComplaintHub is a web application for colleges where students can raise complaints and managers can view, sort, and manage them. Students can add attachments, set priority, edit or withdraw pending complaints. Managers get a dashboard with filters, status updates, and a "good response" indicator when no new complaints come in for a week.

---

## The Problem Statement

Students often have no easy way to submit complaints to college management. Paper forms get lost, emails go unchecked, and there is no way to track if a complaint was seen or resolved. Managers also struggle to organize and prioritize complaints from many students.

---

## The Solution

ComplaintHub provides a single platform where students log in, raise complaints with details and attachments, and track their status. Managers log in to see all complaints, filter by category or status, update status (pending, in progress, resolved, rejected), and remove invalid ones. The app uses role-based login so each user sees only what they need.

---

## Technical Details

### Technologies Used

**Languages:** JavaScript

**Frameworks:** React 18 (frontend), Express.js (backend)

**Libraries:** React Router, Axios, Tailwind CSS, Mongoose, bcryptjs, jsonwebtoken, multer, cors, dotenv

**Tools:** VS Code, Git, Node.js, MongoDB Atlas, Vite

---

## Features

1. **Common Login** – Students and managers use one login page; the app redirects based on role.
2. **Raise Complaints** – Students create complaints with title, description, category, priority, and file attachments.
3. **Track Complaints** – Students see all their complaints and current status (pending, in progress, resolved, rejected).
4. **Edit & Withdraw** – Students can edit or withdraw complaints only when status is pending.
5. **Manager Dashboard** – Managers view all complaints in a table, filter by status/category/priority, and sort by date or priority.
6. **Status & Priority** – Managers change complaint status and priority; students can set priority when creating.
7. **2+ Days Pending Reminder** – Complaints pending for 2 or more days show a reminder badge.
8. **Good Response** – Manager dashboard shows a message when no new complaints were raised in the past week.
9. **Withdrawn Hidden** – Withdrawn complaints are hidden by default; managers can toggle to show them.
10. **File Attachments** – Students can attach images (jpg, png, gif, webp) and documents (pdf, doc, docx).

---

## Implementation

### Installation

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Run

**Backend:**
```bash
cd backend
npm run dev
```
(Runs on http://localhost:5000)

**Frontend:**
```bash
cd frontend
npm run dev
```
(Runs on http://localhost:3000)

**Note:** Create a `.env` file in the backend folder with `MONGO_URI` and `JWT_SECRET` before running.

---

## Project Documentation

### Screenshots

Add at least 3 screenshots with captions:

1. **Login Page** – Shows the ComplaintHub login and register form.
2. **Student Dashboard** – Shows student's complaints list with raise, edit, and withdraw options.
3. **Manager Dashboard** – Shows all complaints in a table with filters and status updates.

---

## Diagrams

### System Architecture

```
[Browser] --> [React Frontend :3000]
                    |
                    | API calls
                    v
[Express Backend :5000] --> [MongoDB Atlas]
     |
     | Auth (JWT)
     v
[Users & Complaints Collections]
```

**Components:**
- **Frontend:** React with Tailwind CSS, React Router, Axios
- **Backend:** Node.js + Express, JWT auth, Multer for file uploads
- **Database:** MongoDB (Users, Complaints)
- **Data flow:** User logs in → gets JWT → sends JWT with each API request → backend validates and returns data

### Application Workflow

1. User opens app → sees Login page
2. User registers or logs in → JWT stored
3. **Student:** Redirected to Student Dashboard → can raise, edit, withdraw complaints
4. **Manager:** Redirected to Manager Dashboard → can view, filter, update status, remove complaints
5. Complaints stored in MongoDB; attachments stored in backend `uploads` folder

---

## API Documentation

**Base URL:** `http://localhost:5000/api` (or your hosted backend URL)

### Auth Endpoints

**POST /api/auth/register**
- Registers a new user (student or manager)
- Request: `{ name, email, password, role }` (role: "student" or "manager")
- Response: `{ token, user: { id, name, email, role } }`

**POST /api/auth/login**
- Logs in a user
- Request: `{ email, password }`
- Response: `{ token, user: { id, name, email, role } }`

**GET /api/auth/me**
- Returns current user (requires Bearer token in header)

### Complaint Endpoints

**GET /api/complaints**
- Lists complaints (students see own; managers see all). Withdrawn excluded unless `?showWithdrawn=true`
- Query params: `sort` (date_asc, status, priority), `status`, `category`, `priority`
- Requires: Bearer token

**POST /api/complaints**
- Creates a complaint (students only). Use `multipart/form-data` for attachments.
- Body: `title`, `description`, `category`, `priority`, `attachments` (files)
- Requires: Bearer token (student)

**PATCH /api/complaints/:id**
- Managers: update `status` and/or `priority`. Body: `{ status, priority }`
- Students: update complaint (only when pending). Body: multipart with `title`, `description`, `category`, `priority`, `attachments`
- Requires: Bearer token

**POST /api/complaints/:id/withdraw**
- Withdraws a pending complaint (students only)
- Requires: Bearer token (student)

**DELETE /api/complaints/:id**
- Deletes a complaint (managers only)
- Requires: Bearer token (manager)
