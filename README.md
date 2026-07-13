<div align="center">

# 🎓 Mentor Connect
### Bridging the Gap Between Ambition and Guidance

<br/>

**A modern, full-stack mentorship management platform connecting educational institutions.**  
*Built for seamless interaction, role-based security, and academic growth.*

🌐 **Live Application:** [mentor-connect.up.railway.app](https://mentor-connect.up.railway.app)

<p align="center">
  <a href="#-features-breakdown">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-documentation">Docs</a>
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
| React Router | Role-based routing |
| Clerk React SDK | Authentication |

### ⚙️ Backend
| Technology | Purpose |
|---------|--------|
| Node.js | Runtime |
| Express.js | REST API |
| PostgreSQL | Relational database |
| `pg` + SQL | Data access |
| Clerk Express SDK | Auth verification |
| Multer | File uploads |
| PDFKit | Report generation |
| Helmet + CORS | Security |

---

## 🚀 Getting Started

**Prerequisites:** Node.js 20+, PostgreSQL 15+, Clerk keys.

```bash
git clone https://github.com/rc-dev16/mentor-connect.git
cd mentor-connect
npm install && cd backend && npm install && cd ..
```

Set `VITE_CLERK_PUBLISHABLE_KEY` + `VITE_API_BASE_URL` in `.env.local`, and Clerk + `DATABASE_URL` in `backend/config.env` (see [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) §9).

```bash
psql "$DATABASE_URL" -f database/schema.sql
cd backend && npm run dev   # API → :5001
npm run dev                 # App → :8080
```

---

## 📖 Documentation

Full architecture, auth, database seeding, API modules, and testing:  
**[docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md)**

---

## 🌐 Deployment (Railway)

**Live:** [https://mentor-connect.up.railway.app](https://mentor-connect.up.railway.app)

* **Database** · **Backend (Express)** · **Frontend (Vite)** · **Auth (Clerk, invite-only)**

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch  
3. Commit, push, and open a PR  

---

<div align="center">

**Built with ❤️ for Academic Mentorship**

</div>
