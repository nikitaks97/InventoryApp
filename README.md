# Inventory Management Application

A modern, full-stack Node.js web application for managing inventory items with a beautiful, responsive UI and comprehensive CI/CD pipeline.

[![CI/CD Pipeline](https://github.com/nikitaks97/inventoryapp/actions/workflows/ci-cd.yaml/badge.svg)](https://github.com/nikitaks97/inventoryapp/actions/workflows/ci-cd.yaml)

## 🚀 Features

### Core Functionality
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality for inventory items
- **Server-side Rendering**: Fast, SEO-friendly pages using EJS templating
- **Real-time Search**: Filter inventory items dynamically
- **Form Validation**: Client and server-side validation with user-friendly error messages
- **Responsive Design**: Modern UI with Bootstrap 5, FontAwesome icons, and custom CSS
- **Flash Messages**: User feedback for actions (success, error, warning)

### Technical Features
- **Dual Database Support**: NeDB (embedded) with optional MongoDB via `MONGO_URI`
- **RESTful API**: Clean API endpoints for all operations
- **Authentication Ready**: JWT-based auth system (in `/src` directory)
- **Interactive UI**: SweetAlert2 for beautiful confirmation dialogs
- **Auto-seeding**: Automatically populates database with sample data
- **Comprehensive Testing**: Unit tests, integration tests, and E2E tests
- **Error Handling**: Graceful error pages and proper HTTP status codes

### DevOps & Deployment
- **Docker Ready**: Multi-stage Docker build with automatic seeding
- **Kubernetes Support**: Complete K8s manifests for production deployment
- **CI/CD Pipeline**: GitHub Actions with SonarCloud quality checks
- **Container Registry**: Automated builds pushed to GitHub Container Registry

## 📋 Prerequisites

- **Node.js** v20 or higher
- **npm** (comes with Node.js)
- **Docker** (for containerization)
- **Git** (for version control)
- **kubectl** (for Kubernetes deployment - optional)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd inventoryapp
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Optional environment variables:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/inventory
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
```

### 4. Seed the Database (Optional)
```bash
node seed.js
```

### 5. Start the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Build and Run with Docker
```bash
# Build the Docker image
docker build -t inventoryapp:local .

# Run the container (includes auto-seeding)
docker run -p 3000:3000 inventoryapp:local
```

The Docker container automatically seeds the database with sample data on startup.

## ☸️ Kubernetes Deployment

Deploy to a Kubernetes cluster:

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

Access via: `http://inventory.local` (requires ingress controller)

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Test Coverage Report
Coverage reports are generated in the `coverage/` directory and include:
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing

## 📁 Project Structure

```
inventoryapp/
├── 📁 data/                    # Database files (NeDB)
├── 📁 db/                      # Database layer and models
├── 📁 k8s/                     # Kubernetes manifests
├── 📁 public/                  # Static assets (CSS, JS, fonts)
├── 📁 routes/                  # Express route handlers
├── 📁 src/                     # Additional API routes (auth, tasks)
├── 📁 tests/                   # Test suites
├── 📁 views/                   # EJS templates
│   ├── 📁 items/              # Item-specific views
│   ├── layout.ejs             # Main layout template
│   └── error.ejs              # Error page template
├── 📄 Dockerfile              # Container configuration
├── 📄 server.js               # Main application entry point
├── 📄 seed.js                 # Database seeding script
└── 📄 package.json            # Dependencies and scripts
```

## 🔧 API Endpoints

### Web Routes
- `GET /` - Redirect to items list
- `GET /items` - Display all inventory items
- `GET /items/new` - Show new item form
- `POST /items` - Create new item
- `GET /items/:id/edit` - Show edit form
- `POST /items/:id` - Update existing item
- `DELETE /items/:id` - Delete item (AJAX)

### API Routes (Optional)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/tasks` - List tasks (authenticated)
- `POST /api/tasks` - Create task (authenticated)

## 🎨 UI Components

### Item Cards
- **Hover Effects**: Smooth animations on item cards
- **Action Buttons**: Edit and delete with icons
- **Search Bar**: Real-time filtering
- **Floating Action Button**: Quick access to add new items

### Forms
- **Client-side Validation**: Instant feedback
- **Server-side Validation**: Secure data handling
- **Error States**: Clear error messaging
- **Loading States**: Visual feedback during operations

## 🔄 CI/CD Pipeline

The automated pipeline includes:

1. **Code Quality**: ESLint, Prettier, SonarCloud analysis
2. **Testing**: Automated test execution with coverage reporting
3. **Security**: Dependency vulnerability scanning
4. **Build**: Docker image creation and optimization
5. **Registry**: Push to GitHub Container Registry
6. **Deploy**: Kubernetes deployment to production

### Pipeline Triggers
- **Push to main**: Full pipeline execution
- **Pull Requests**: Quality checks and testing
- **Manual**: On-demand pipeline execution

## 📊 Monitoring & Quality

### Code Quality
- **SonarCloud**: Continuous code quality and security analysis
- **Test Coverage**: Minimum 80% coverage requirement
- **Quality Gates**: Automated quality checks

### Performance
- **Lightweight**: Optimized Docker images
- **Caching**: Efficient asset caching
- **Database**: Indexed queries for fast searches

## 🚀 Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start the application |
| `npm test` | Run all tests |
| `npm run test:coverage` | Generate coverage report |
| `node seed.js` | Seed database with sample data |
| `docker build -t inventoryapp .` | Build Docker image |
| `docker run -p 3000:3000 inventoryapp` | Run in container |
| `kubectl apply -f k8s/` | Deploy to Kubernetes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Community support via GitHub Discussions
- **Documentation**: Comprehensive docs in `/documentation.md`

---

**Built with ❤️ using Node.js, Express, EJS, and modern DevOps practices**
