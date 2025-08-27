# PostThread: A Full-Stack Discussion Platform

![PostThread Banner](https://placehold.co/1200x300/1a202c/ffffff?text=PostThread&font=raleway)

**PostThread** is a modern, full-stack, and highly scalable discussion application built with a focus on backend performance, clean architecture, and a seamless user experience. Inspired by platforms like Twitter and Threads, it allows users to create posts, engage in deeply nested conversations, and receive real-time notifications. The entire application is containerized with Docker for consistent development and production environments and is deployed using a modern CI/CD workflow with Vercel and Render.

**Live Demo:** [**https://comment-app-murex.vercel.app/**](https://comment-app-murex.vercel.app/)

---

## ✨ Core Features

- **Secure User Authentication:** JWT-based authentication for user registration and login, with hashed passwords using `bcryptjs`.
- **Post & Reply System:** Users can create top-level posts and reply to any post or comment, creating deeply nested conversation threads.
- **Time-Limited Editing:** Users have a 15-minute window to edit their posts and comments after creation, preventing abuse.
- **Soft Deletes & Restore:** A 15-minute grace period allows users to restore their deleted posts or comments.
- **Real-Time Notifications:** Users receive notifications when another user replies to their post or comment. A real-time badge indicates unread notifications.
- **Robust Validation:** The backend uses `class-validator` to ensure all incoming data is secure and well-formed.
- **Scalable Architecture:** Built with a modular backend and a performant frontend, designed to handle heavy loads.
- **Automated Cleanup:** A scheduled background job (`@nestjs/schedule`) runs daily to permanently remove posts that were soft-deleted more than 30 days ago, ensuring database health.

---

## 🏗️ System Architecture

This project utilizes a modern, decoupled, and scalable architecture. The frontend is hosted on Vercel for optimal performance and global delivery, while the backend and database are managed by Render for reliability and ease of maintenance.

```mermaid
graph TD
    A[User's Browser] -->|HTTPS| B(Next.js Frontend on Vercel);
    B -->|REST API Calls| C(NestJS Backend on Render);
    C -->|TCP/IP| D(Managed PostgreSQL on Render);

    subgraph "Development Environment (Local)"
        E[docker-compose up] --> F{Frontend Container};
        E --> G{Backend Container};
        E --> H{PostgreSQL Container};
        F --> G;
        G --> H;
    end

    style B fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#e0234e,stroke:#fff,stroke-width:2px,color:#fff
    style D fill:#336791,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🛠️ Tech Stack

This project is built with a modern and powerful set of technologies, chosen for performance, scalability, and developer experience.

| Category       | Technology                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**   | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **Backend**    | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![TypeORM](https://img.shields.io/badge/TypeORM-E0234E?style=for-the-badge) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)                                             |
| **Deployment** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)                                                                                                                                      |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Docker** and **Docker Compose** must be installed on your machine.
- A code editor like **VS Code**.

### Local Development Setup

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Set up Backend Environment Variables:**
    Navigate to the `backend` directory and create a `.env` file. Copy the contents of `.env.example` (if you have one) or add the following:

    ```env
    # backend/.env
    DATABASE_HOST=db
    DATABASE_PORT=5432
    DATABASE_USERNAME=user
    DATABASE_PASSWORD=password
    DATABASE_NAME=nestjs_comments_db
    JWT_SECRET=a-very-strong-secret-for-local-development
    PORT=3000
    ```

3.  **Set up Frontend Environment Variables:**
    Navigate to the `frontend` directory and create a `.env.local` file with the following content:

    ```env
    # frontend/.env.local
    NEXT_PUBLIC_API_URL=http://localhost:3000
    ```

4.  **Build and Run with Docker Compose:**
    From the **root directory** of the project, run the following command:

    ```sh
    docker-compose up --build
    ```

    This command will build the Docker images for both the frontend and backend and start all the necessary containers.

5.  **Access the Application:**
    - Frontend: [http://localhost](http://localhost)
    - Backend API: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment

This application is deployed using a modern CI/CD pipeline:

- **Frontend (Next.js):** Deployed on **Vercel**. Vercel is connected to the `main` branch of the GitHub repository. Every push to `main` automatically triggers a new build and deployment.
- **Backend (NestJS) & Database (PostgreSQL):** Deployed on **Render**. The backend is deployed as a Dockerized Web Service, and the database is a managed PostgreSQL instance. This setup ensures a clear separation of concerns and leverages the strengths of each platform.

---

## 📜 API Endpoints Overview

<details>
<summary><strong>Click to expand API Endpoints</strong></summary>

| Method   | Endpoint                  | Description                                   | Protected |
| :------- | :------------------------ | :-------------------------------------------- | :-------- |
| `POST`   | `/auth/register`          | Register a new user.                          | No        |
| `POST`   | `/auth/login`             | Log in an existing user, returns JWT.         | No        |
| `GET`    | `/comments`               | Get all top-level posts.                      | No        |
| `GET`    | `/comments?parentId=:id`  | Get all replies for a specific post/comment.  | No        |
| `GET`    | `/comments/:id`           | Get a single post or comment by its ID.       | No        |
| `POST`   | `/comments`               | Create a new post or reply.                   | Yes       |
| `PATCH`  | `/comments/:id`           | Edit a post or comment.                       | Yes       |
| `DELETE` | `/comments/:id`           | Soft delete a post or comment.                | Yes       |
| `POST`   | `/comments/:id/restore`   | Restore a soft-deleted post or comment.       | Yes       |
| `GET`    | `/notifications/all`      | Get all notifications for the logged-in user. | Yes       |
| `GET`    | `/notifications/unread`   | Get unread notifications for the user.        | Yes       |
| `POST`   | `/notifications/:id/read` | Mark a notification as read.                  | Yes       |

</details>

---

## 👤 Author

**DARSHAN S**

- GitHub: [@darshan0106](https://github.com/darshan0106)
- LinkedIn: [linkedin.com/in/Darshan Sivakumar](https://www.linkedin.com/in/darshan-sivakumar-a45503225)

Feel free to reach out if you have any questions or feedback!
