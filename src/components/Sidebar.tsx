import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>AssetControl</h2>

      <nav>
        <ul>
          <li>
            <Link to="/" className="sidebar-link">🏠 Dashboard</Link>
          </li>
          <li>
            <Link to="/equipamentos" className="sidebar-link">💻 Equipamentos</Link>
          </li>
          <li>
            <span className="sidebar-link disabled">🔧 Manutenções</span>
          </li>
          <li>
            <span className="sidebar-link disabled">📊 Relatórios</span>
          </li>
          <li>
            <span className="sidebar-link disabled">⚙ Configurações</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;