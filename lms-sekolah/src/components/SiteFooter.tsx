export function SiteFooter() {
  return (
    <footer className="bg-lms-primary text-white mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display font-semibold text-xl italic">LMS Sekolah</p>
          <p className="mt-4 text-sm text-white/90">
            Learn Better. Create Together. Grow Every Day.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-3">Navigation</p>
          <ul className="space-y-2 text-sm text-white/90">
            <li>Home</li>
            <li>Features</li>
            <li>Classes</li>
            <li>About Us</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Support</p>
          <ul className="space-y-2 text-sm text-white/90">
            <li>FAQ</li>
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms &amp; Conditions</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Contact Us</p>
          <ul className="space-y-2 text-sm text-white/90">
            <li>support@cnclms.com</li>
            <li>+62 890 6767 2121</li>
            <li>Depok, Indonesia</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 py-6 text-center text-sm text-white/80">
        © 2026 LMS Sekolah. All Rights Reserved.
      </div>
    </footer>
  );
}
