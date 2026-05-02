import Link from "next/link";

const Footer = () => (
  <footer className="mt-auto w-full border-t border-border bg-card/40 px-5 py-6 backdrop-blur-sm lg:px-8">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-xs font-medium text-muted-foreground">© 2026 BT-Barber</p>
      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
        <Link href="/termos" className="hover:text-foreground">
          Termos
        </Link>
        <Link href="/privacidade" className="hover:text-foreground">
          Privacidade
        </Link>
        <Link href="/cancelamento" className="hover:text-foreground">
          Cancelamento
        </Link>
      </nav>
      <p className="text-xs font-medium text-muted-foreground">Alpha 0.1.0</p>
    </div>
  </footer>
);

export default Footer;
