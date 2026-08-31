interface SidebarProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
}

export function Sidebar({ abaAtiva, setAbaAtiva }: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2>AssetControl</h2>

      <nav>
        <ul>
          <li>
            <a
              href="#"
              className={abaAtiva === "dashboard" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setAbaAtiva("dashboard");
              }}
            >
              Dashboard
            </a>
          </li>

          <li>
            <a
              href="#"
              className={abaAtiva === "equipamentos" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setAbaAtiva("equipamentos");
              }}
            >
              Equipamentos
            </a>
          </li>

          <li>
            <a
              href="#"
              className={abaAtiva === "impressoras" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setAbaAtiva("impressoras");
              }}
            >
              Impressoras
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}