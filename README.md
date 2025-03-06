# File Upload App

## Description
The **File Upload App** is a **SvelteKit-based** application designed for secure file uploads and management. It supports both **local storage** and **object storage** using **MinIO**, allowing users to efficiently upload, manage, preview, and delete files. The application is built with a robust **PostgreSQL + Prisma ORM** backend and leverages **Docker** for easy deployment.

---

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

You can set up the project **with Docker** for easy deployment or **manually** without Docker.

---

### 1. **Using Docker (Recommended)**
If you want to quickly set up the app with Docker, follow these steps:

#### Prerequisites:
Ensure you have the following installed:
- **[Docker](https://www.docker.com/get-started)**
- **[Docker Compose](https://docs.docker.com/compose/install/)**

#### Clone the Repository
```sh
git clone https://github.com/Zedef89/file-upload-app.git
cd file-upload-app

Build & Run Containers

docker-compose up --build

This will start:
	•	SvelteKit app on http://localhost:5173
	•	PostgreSQL on port 5432
	•	MinIO on ports 9000 (API) and 9090 (console)

Docker handles environment variables:

The .env file and database migrations are automatically handled by Docker through the Docker Compose configuration. There’s no need to manually create the .env file or run migrations.

Once everything is up and running, you should be able to use the app on http://localhost:5173.

⸻

2. Without Docker (Manual Setup)

If you prefer to set up the app manually without Docker, follow these steps:

Prerequisites:

Ensure you have the following installed:
	•	Node.js (v18+)
	•	PostgreSQL: Follow the installation guide based on your system.
	•	MinIO: Follow the installation guide based on your system.
	•	Prisma CLI: Install Prisma globally or as a dev dependency in your project.
To install Prisma globally:

npm install -g prisma

Or, you can install it as a dev dependency:

npm install --save-dev prisma



Step 1: Clone the Repository

git clone https://github.com/Zedef89/file-upload-app.git
cd file-upload-app

Step 2: Install Dependencies

Install the required Node.js dependencies:

npm install

Step 3: Set up PostgreSQL
	1.	Install PostgreSQL: If you don’t have PostgreSQL installed, follow the instructions on the official website.
	2.	Start PostgreSQL:
	•	Make sure PostgreSQL is running on port 5432.
	•	Create a new database named file_uploads:

CREATE DATABASE file_uploads;


	•	You can do this via a PostgreSQL client like psql or a GUI tool like pgAdmin.

	3.	Create PostgreSQL User:
	•	If you haven’t already, create a new user with appropriate privileges (replace password with a strong password):

CREATE USER postgres WITH PASSWORD 'password';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE file_uploads TO postgres;



Step 4: Set up MinIO
	1.	Install MinIO: If you don’t have MinIO installed, follow the instructions on the official website.
	2.	Start MinIO:
	•	Run MinIO on port 9000 using this command:

minio server /data --console-address ":9090"


	3.	Create a Bucket in MinIO:
	•	Access the MinIO console by navigating to http://localhost:9090 and log in using the default credentials (admin / password).
	•	Create a new bucket called uploads for storing files.

Step 5: Set up Prisma
	1.	Generate Prisma Client:
	•	First, ensure the Prisma schema is correctly configured. In the root of the project, you’ll find a prisma/schema.prisma file that defines the database schema. If necessary, adjust this schema to reflect your database configuration.
	2.	Set up the Prisma Environment:
	•	In your .env file (or directly in the Prisma schema), set the following values to configure PostgreSQL:

DATABASE_URL="postgresql://postgres:password@localhost:5432/file_uploads"
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password
MINIO_BUCKET_NAME=uploads


	3.	Run Prisma Migrations:
	•	To set up the database schema, run:

npx prisma migrate deploy



Step 6: Start the Development Server

Once you have everything set up (PostgreSQL, MinIO, and Prisma), start the development server:

npm run dev

This will start the SvelteKit app on http://localhost:5173.

Now the app is ready to use!

⸻

API Endpoints

The API endpoints remain the same whether you’re running the app with Docker or manually.

Upload a File

POST /api/upload
	•	Request Body: Multipart Form Data
	•	Fields:
	•	file: File to upload
	•	title: File title
	•	description: File description
	•	category: File category
	•	language: Language associated with file
	•	provider: Source provider
	•	roles: User roles
	•	Response:

{
  "message": "Upload successful",
  "upload": { "id": "1234", "filePath": "http://localhost:9000/uploads/file.pdf" }
}

Get Uploaded Files

GET /api/uploads
	•	Response:

[ { "id": "1234", "title": "Example File", "filePath": "http://localhost:9000/uploads/file.pdf" } ]

Get a Specific File

GET /api/uploads/:id
	•	Retrieves a file’s metadata and URL.

Delete a File

DELETE /api/uploads/:id
	•	Deletes the file from MinIO/local storage and database.

⸻

Frontend Functionality
	•	Search & Filter: Users can search uploaded files.
	•	Preview Files: Image, video, and PDF previews.
	•	Delete Files: Users can remove uploaded files.
	•	Notifications: Displays success and error messages.

⸻

File Storage Mechanism
	•	Local Storage: Files are saved in ./static/uploads/
	•	MinIO: Files are uploaded to an object storage bucket if available.
	•	Database: Prisma stores metadata linking files to local or MinIO paths.

⸻

Deployment

For production deployment, use:

docker-compose -f docker-compose.prod.yml up --build -d

Modify docker-compose.prod.yml to fit your production environment.

⸻

License

MIT License © 2025 Nicola Mele

⸻

Contributions

Feel free to open issues and contribute via pull requests!

⸻

Contact

For any inquiries, contact me at mele.nicola943@gmail.com.

⸻

Note on Docker vs Manual Setup:
	•	With Docker: All dependencies (PostgreSQL, MinIO, and SvelteKit app) are containerized for easy deployment. Just run docker-compose up --build to have everything set up automatically.
	•	Without Docker: You need to manually set up PostgreSQL and MinIO, and run the app locally by installing the necessary dependencies.

⸻

Explanation of the Prisma Setup:
	1.	Prisma handles the database migrations and ORM logic. Once you have PostgreSQL running, the command npx prisma migrate deploy will apply the necessary migrations for setting up the database schema and tables.
	2.	PostgreSQL Configuration: The DATABASE_URL in the .env file or Prisma schema points to the local PostgreSQL database. Adjust the credentials and database name as necessary.

⸻

Important Notes:
	•	Without Docker, the user must set up PostgreSQL and MinIO manually, configure the .env file, and run the Prisma migrations.
	•	With Docker, the database and MinIO are automatically set up and configured via Docker Compose, so you don’t need to manually install them.

⸻

