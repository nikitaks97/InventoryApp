# Inventory App Documentation

## Introduction

The Inventory App is a Node.js-based application designed to help users manage and track inventory items efficiently. It features RESTful APIs, user authentication, and a web interface for easy interaction. The app is containerized using Docker and supports deployment to Kubernetes clusters. CI/CD is implemented using GitHub Actions and SonarCloud for automated testing, code quality, and deployment.

---

## Prerequisites
- Node.js (v20 recommended)
- npm (comes with Node.js)
- Docker (for containerization)
- Git (for version control)

---

## Running the App Locally

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd InventoryApp-main
```

### 2. Install Dependencies
```sh
npm ci
```

### 3. Set Environment Variables
Create a `.env` file in the root directory (if required) and set any necessary environment variables, such as:
```
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 4. Run the Application
```sh
npm start
```
The app will start on the default port (usually 3000). Visit `http://localhost:3000` in your browser.

---

## Testing the Application

### 1. Run Unit and Integration Tests
```sh
npm test
```
This will execute all tests in the `src/tests/` and `tests/` directories.

### 2. Generate Code Coverage
```sh
npm test  --coverage
```
The coverage report will be available in the `coverage/` directory.

---

## Building and Running with Docker

### 1. Build the Docker Image
```sh
docker build -t inventoryapp:local .
```

### 2. Run the Docker Container
```sh
docker run -p 3000:3000 inventoryapp:local
```
The app will be accessible at `http://localhost:3000`.

---

## Important Commands
| Command                                 | Description                                 |
|-----------------------------------------|---------------------------------------------|
| `npm ci`                                | Install dependencies (clean install)         |
| `npm start`                             | Start the application                       |
| `npm test`                              | Run all tests                               |
| `npm test -- --coverage`                | Run tests with coverage report              |
| `docker build -t inventoryapp:local .`  | Build Docker image                          |
| `docker run -p 3000:3000 inventoryapp:local` | Run app in Docker container            |

---

## CI/CD Pipeline Overview

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yaml` and includes the following stages:

1. **Checkout Code**: Retrieves the latest code from the repository.
2. **Set Up Node.js**: Configures the Node.js environment.
3. **Install Dependencies**: Installs all required npm packages.
4. **Run Tests with Coverage**: Executes tests and generates a coverage report.
5. **SonarCloud Scan**: Analyzes code quality and security using SonarCloud.
6. **Quality Gate Check**: Ensures code meets quality standards.
7. **Build Docker Image**: Builds a Docker image for the app.
8. **Push Docker Image**: Pushes the image to GitHub Container Registry (GHCR).
9. **Set npm Version**: Updates the npm package version based on the GitHub run number.
10. **Publish npm Package**: (Optional) Publishes the npm package to GitHub Packages.
11. **Upload Artifacts**: Uploads build artifacts for later use.
12. **Deploy to Kubernetes**: Applies Kubernetes manifests to deploy the app.

This pipeline ensures code quality, automates testing, and streamlines deployment to production environments.

---

## Support
For any issues or questions, please open an issue in the repository or contact the maintainer.
