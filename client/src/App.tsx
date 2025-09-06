import { Router, Route } from 'wouter';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Router>
        <Route path="/" component={Dashboard} />
      </Router>
    </div>
  );
}

export default App;