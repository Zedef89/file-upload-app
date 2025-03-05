# File Upload App

## Description
File Upload App is a **SvelteKit-based** application designed for secure file uploads and management. It supports both **local storage** and **object storage** using MinIO, allowing users to efficiently upload, manage, preview, and delete files. The application is built with a robust **PostgreSQL + Prisma ORM** backend and leverages **Docker** for easy deployment.

## Features
- **File Upload**: Save files both locally and in MinIO.
- **File Management**: List, preview, and delete uploaded files.
- **Database Integration**: Uses **PostgreSQL** and **Prisma ORM** for structured metadata storage.
- **MinIO Object Storage**: Supports scalable cloud-like storage.
- **Dockerized Setup**: Fully containerized with **Docker Compose** for easy deployment.
- **User-Friendly UI**: Built with **Svelte** for a fast and responsive frontend.

---

## Tech Stack
- **Frontend**: SvelteKit
- **Backend**: Node.js with SvelteKit API routes
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Storage**: MinIO & Local Storage
- **Containerization**: Docker & Docker Compose

---

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Clone the Repository
```sh
git clone https://github.com/Zedef89/file-upload-app.git
cd file-upload-app
```

### Install Dependencies
```sh
npm install
```

### Start the Development Server
```sh
npm run dev
```

This will start the **SvelteKit app** on `http://localhost:5173`.

---

## Running with Docker

### Build & Run Containers
```sh
docker-compose up --build
```
This will start:
- **SvelteKit app** on `http://localhost:5173`
- **PostgreSQL** on port `5432`
- **MinIO** on ports `9000` (API) and `9090` (console)

### Environment Variables
Create a `.env` file in the root directory with the following:
```env
DATABASE_URL="postgresql://admin:password@localhost:5432/file_uploads"
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password
MINIO_BUCKET_NAME=uploads
```

### Prisma Migrations
To set up the database schema, run:
```sh
npx prisma migrate deploy
```

---

## API Endpoints

### Upload a File
**POST** `/api/upload`
- **Request Body**: Multipart Form Data
- **Fields**:
  - `file`: File to upload
  - `title`: File title
  - `description`: File description
  - `category`: File category
  - `language`: Language associated with file
  - `provider`: Source provider
  - `roles`: User roles
- **Response**:
```json
{
  "message": "Upload successful",
  "upload": { "id": "1234", "filePath": "http://localhost:9000/uploads/file.pdf" }
}
```

### Get Uploaded Files
**GET** `/api/uploads`
- **Response**:
```json
[ { "id": "1234", "title": "Example File", "filePath": "http://localhost:9000/uploads/file.pdf" } ]
```

### Get a Specific File
**GET** `/api/uploads/:id`
- Retrieves a file’s metadata and URL.

### Delete a File
**DELETE** `/api/uploads/:id`
- Deletes the file from MinIO/local storage and database.

---

## Frontend Functionality
- **Search & Filter**: Users can search uploaded files.
- **Preview Files**: Image, video, and PDF previews.
- **Delete Files**: Users can remove uploaded files.
- **Notifications**: Displays success and error messages.

---

## File Storage Mechanism
- **Local Storage**: Files are saved in `./static/uploads/`
- **MinIO**: Files are uploaded to an object storage bucket if available.
- **Database**: Prisma stores metadata linking files to local or MinIO paths.

---

## Deployment
For production deployment, use:
```sh
docker-compose -f docker-compose.prod.yml up --build -d
```
Modify `docker-compose.prod.yml` to fit your production environment.

---

## License
MIT License © 2025 Nicola Mele

---

## Contributions
Feel free to open issues and contribute via pull requests!

---

## Contact
For any inquiries, contact me at mele.nicola943@gmail.com.

