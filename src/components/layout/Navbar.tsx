const LINKS = ['About', 'Services', 'Projects', 'Contact'];

export function Navbar() {
  return (
    <nav className="relative z-20 flex justify-between px-6 pt-6 md:px-10 md:pt-8">
      {LINKS.map((name) => (
        <a
          key={name}
          href={`#${name.toLowerCase()}`}
          className="font-heading text-sm font-medium uppercase tracking-wider text-cocoa transition-opacity duration-200 hover:opacity-70 md:text-lg"
        >
          {name}
        </a>
      ))}
    </nav>
  );
}
