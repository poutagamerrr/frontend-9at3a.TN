## 9at3a.TN Frontend (React/Redux/Vite)

### Setup
- **Install dependencies**: `npm install`

### Development
- **Run dev server**: `npm run dev`
  - Serves the React app on `http://localhost:3000`
  - Proxies `/api` requests to the backend at `http://localhost:5000`

### Build
- **Production build**: `npm run build`
- **Preview build**: `npm run preview`

This frontend implements:
- Public catalog pages, product detail, cart, checkout, and order history
- Authentication (customer + admin), VIP badge, and VIP pricing display
- Admin dashboard for managing products, users (VIP assignment), orders, and basic sales analytics.

