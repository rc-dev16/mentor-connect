<div align="center">

# 🎓 Mentor Connect
### Bridging the Gap Between Ambition and Guidance

![Banner](https://via.placeholder.com/1200x400?text=Mentor+Connect+Platform)

<br/>

**A modern, full-stack mentorship management platform connecting educational institutions.**  
*Built for seamless interaction, role-based security, and academic growth.*

<p align="center">
  <a href="#-features-breakdown">Key Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api-reference">API Docs</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" />
</p>

</div>

---

## 🎯 Overview

**Mentor Connect** is a comprehensive mentor–mentee ERP platform designed for academic institutions.  
It replaces fragmented spreadsheets, emails, and manual processes with a centralized, secure system.

### Key capabilities include:
- 🔒 **Controlled Access:** Invite-only authentication using Clerk (no public signup).
- 📅 **Meeting Management:** General mentor meetings and 1-on-1 personal sessions.
- 📊 **Academic Reporting:** Attendance, session summaries, and semester-level reports.
- 📂 **Resource Sharing:** Centralized upload and access to study materials.

The platform is deployed using a **three-tier architecture** on Railway:
Frontend, Backend, and Database as independent services.

---

## ✨ Features Breakdown

<table align="center">
  <tr>
    <td align="center" width="50%">
        <h3>👨‍🏫 For Mentors</h3>
    </td>
    <td align="center" width="50%">
        <h3>👨‍🎓 For Mentees</h3>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <ul>
        <li><strong>🎛 Dashboard:</strong> Overview of mentees and pending actions.</li>
        <li><strong>👥 Mentee Profiles:</strong> View assigned students and their details.</li>
        <li><strong>📅 General Meetings:</strong> Schedule and record group mentoring sessions.</li>
        <li><strong>✅ Session Requests:</strong> Approve or reject 1-on-1 requests.</li>
        <li><strong>📤 Resources:</strong> Upload PDFs, documents, and links.</li>
        <li><strong>📈 Reports:</strong> Generate whole-group and individual reports.</li>
        <li><strong>⚙️ Settings:</strong> Manage availability and profile info.</li>
      </ul>
    </td>
    <td valign="top">
      <ul>
        <li><strong>👀 Dashboard:</strong> View mentor details and upcoming meetings.</li>
        <li><strong>🤝 Personal Sessions:</strong> Request 1-on-1 mentoring.</li>
        <li><strong>📚 Resources:</strong> Access shared study material.</li>
        <li><strong>🔔 Notifications:</strong> Get updates on meetings and approvals.</li>
        <li><strong>📝 History:</strong> View notes from past sessions.</li>
        <li><strong>👤 Profile:</strong> Update personal information.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠 Tech Stack

### 🎨 Frontend
| Technology | Purpose |
|---------|--------|
| React 18 + Vite | UI framework & build tool |
| TypeScript | Type safety |
| Tailwind CSS + shadcn/ui | UI styling |
| TanStack Query | Server state management |
| Clerk React SDK | Authentication |
| Recharts | Charts & analytics |

### ⚙️ Backend
| Technology | Purpose |
|---------|--------|
| Node.js | Runtime |
| Express.js | REST API |
| PostgreSQL | Relational database |
| Prisma ORM | DB access layer |
| Clerk Node SDK | Auth verification |
| Multer | File uploads |
| PDFKit | Report generation |
| Helmet + CORS | Security |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Git

### Installation

```bash
git clone https://github.com/rc-dev16/mentor-connect.git
cd mentor-connect
```

```bash
npm install
cd backend
npm install
cd ..
```

### Environment Variables

#### Frontend (`.env.local`)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:5001/api
VITE_CLERK_JWT_TEMPLATE=backend
```

#### Backend (`backend/config.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mentorconnect
PORT=5001
NODE_ENV=development
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_AUD=backend
```

---

## 🏃 Running Locally

```bash
cd backend
npm run dev
```

```bash
npm run dev
```

Frontend → [http://localhost:8080](http://localhost:8080)
Backend → [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 📂 Project Structure

```
mentor-connect/
├── backend/
│   ├── src/routes/
│   ├── src/controllers/
│   ├── src/middleware/
│   └── uploads/
├── src/
│   ├── mentor/
│   ├── mentee/
│   ├── components/
│   └── services/
├── database/
└── public/
```

---

## 📡 API Reference

| Method | Endpoint              | Description          | Access |
| ------ | --------------------- | -------------------- | ------ |
| GET    | /api/users/profile    | Current user profile | All    |
| GET    | /api/users/my-mentor  | Assigned mentor      | Mentee |
| GET    | /api/meetings         | List meetings        | All    |
| POST   | /api/meetings         | Create meeting       | Mentor |
| POST   | /api/session-requests | Request 1-on-1       | Mentee |
| POST   | /api/resources        | Upload resource      | Mentor |
| GET    | /api/notifications    | Notifications        | All    |

---

## 🌐 Deployment (Railway)

* **Database:** PostgreSQL service
* **Backend:** Express API service
* **Frontend:** Next.js service
* **Auth:** Clerk (invite-only, no public signup)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and open PR

---

<div align="center">

**Built with ❤️ for Academic Mentorship**

License: MIT

</div>
