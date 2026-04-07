# Smart-ID Frontend

> React frontend for the Smart-ID Healthcare Platform

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 7** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Project Structure

```
frontend/
├── src/
│   ├── auth/           # Authentication context
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── layouts/        # Page layouts
│   ├── pages/          # Page components
│   ├── routes/         # Route configurations
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
└── tailwind.config.js # Tailwind configuration
```

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://your-backend-api.com
```

## Features

### Role-Based Dashboards

| Role | Dashboard | Features |
|------|-----------|----------|
| Admin | `/admin` | User management, system monitoring |
| Hospital | `/hospital` | Patient registration, clinical notes |
| Doctor | `/doctor` | Patient history, treatment records |
| Medical Shop | `/medical-shop` | Prescription viewing |
| Patient | `/patient` | Personal records, consent management |

### Authentication

- JWT-based authentication
- Automatic token refresh
- Session timeout (15 minutes)
- Protected routes

### Theme

- Light and dark mode
- Role-specific theme persistence
- System preference detection

### Offline Support

- IndexedDB for offline data
- Pending scan sync
- Network status indicator

## Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in appropriate layout or `App.jsx`
3. Add navigation link in sidebar/header
4. Add API service if needed

### Adding New Components

1. Create component in `src/components/`
2. Use Tailwind CSS for styling
3. Support dark mode with `dark:` prefix

### API Integration

API services are in `src/services/`:

```javascript
import api from './services/api';

// Make authenticated request
const response = await api.get('/endpoint');

// Public request (no auth)
const response = await api.post('/auth/login', data);
```

## Performance

### Bundle Optimization

- Code splitting with React.lazy()
- Component memoization
- Debounced event handlers
- Lazy image loading

## Testing

### Manual Testing

1. Patient registration flow
2. Hospital login and dashboard
3. NFC card scanning (requires hardware)
4. OTP verification
5. Nominee OTP (when emergency contact configured)
6. Fingerprint verification (requires hardware)
7. Emergency override
8. Dark mode toggle
9. Session timeout

## Build

```bash
# Development build
npm run build

# Preview production build locally
npm run preview -- --host 0.0.0.0 --port 4173
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI library |
| react-dom | ^19.2.0 | React DOM |
| react-router-dom | ^7.13.0 | Routing |
| axios | ^1.13.4 | HTTP client |
| react-hot-toast | ^2.6.0 | Notifications |
| jwt-decode | ^4.0.0 | JWT parsing |
| idb | ^8.0.3 | IndexedDB wrapper |

## License

MIT
