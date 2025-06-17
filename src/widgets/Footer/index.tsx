import Link from "next/link";
// import Image from 'next/image'; // Удаляем импорт Image, если не используется

const Footer = () => {
  return (
    <footer className="bg-background text-foreground p-4 mt-8 shadow-md border-t">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left space-y-4 md:space-y-0">
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="text-xl font-bold text-foreground">
            Garden Store
          </Link>
          {/* Удаляем Image компонент */}
          {/* <Image
            src="/next.svg"
            alt="Garden Store Logo"
            width={100}
            height={25}
            priority
          /> */}
          <p className="text-sm mt-2">
            &copy; {new Date().getFullYear()} Garden Store v1.
          </p>
          <p className="text-sm">Все права защищены.</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
          <Link href="/about" className="hover:underline">
            О магазине
          </Link>
          <Link href="/contact" className="hover:underline">
            Контакты
          </Link>
          <Link href="/privacy" className="hover:underline">
            Политика конфиденциальности
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
