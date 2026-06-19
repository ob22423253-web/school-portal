// Root component. Delegates routing to AppRoutes so this file stays tiny.

import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return <AppRoutes />;
}
