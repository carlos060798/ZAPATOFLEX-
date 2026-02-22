import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>ZAPATOFLEX</h3>
          <p>Tu destino para calzado premium. Comodidad, estilo y calidad en cada paso que das.</p>
        </div>
        <div className="footer-col">
          <h4>Tienda</h4>
          <ul>
            <li><Link href="/catalogo">Catálogo</Link></li>
            <li><Link href="/catalogo?categoriaId=1">Deportivos</Link></li>
            <li><Link href="/catalogo?categoriaId=2">Casuales</Link></li>
            <li><Link href="/catalogo?categoriaId=3">Formales</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Cuenta</h4>
          <ul>
            <li><Link href="/login">Iniciar Sesión</Link></li>
            <li><Link href="/registro">Registrarse</Link></li>
            <li><Link href="/pedidos">Mis Pedidos</Link></li>
            <li><Link href="/carrito">Carrito</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Soporte</h4>
          <ul>
            <li><a href="#">Contacto</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Envíos</a></li>
            <li><a href="#">Devoluciones</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 ZAPATOFLEX. Todos los derechos reservados.
      </div>
    </footer>
  );
}
