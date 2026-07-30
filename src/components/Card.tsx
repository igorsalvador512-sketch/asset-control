interface CardProps {
  titulo: string;
  valor: string | number;
  cor?: string;
}

function Card({ titulo, valor, cor = "#3b82f6" }: CardProps) {
  return (
    <div className="card" style={{ borderLeftColor: cor }}>
      <p className="card-titulo">{titulo}</p>
      <h3 className="card-valor">{valor}</h3>
    </div>
  );
}

export default Card;