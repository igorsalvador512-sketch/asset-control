import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Equipamentos from "./pages/Equipamentos";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipamentos" element={<Equipamentos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;