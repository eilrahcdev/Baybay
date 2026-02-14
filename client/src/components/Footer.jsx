export default function Footer() {
  return (
    <footer className="bg-[#1E1B1A] text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="w-12 h-12 mb-6 rounded-full border-2 border-white flex items-center justify-center bg-[#7C3A2E]">
              <span className="font-display font-bold text-white text-xs">BAYBAY</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering Pangasinan&apos;s local artisans by bringing their stories and crafts to the world.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-4 text-orange-200">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a className="hover:text-white transition" href="#shows">All Products</a></li>
              <li><a className="hover:text-white transition" href="#shows">Food &amp; Delicacies</a></li>
              <li><a className="hover:text-white transition" href="#shows">Pottery &amp; Crafts</a></li>
              <li><a className="hover:text-white transition" href="#heritage">Weaving</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-4 text-orange-200">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a className="hover:text-white transition" href="#about">About Us</a></li>
              <li><a className="hover:text-white transition" href="#team">Our Team</a></li>
              <li><a className="hover:text-white transition" href="#home">Contact</a></li>
              <li><a className="hover:text-white transition" href="#home">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-4 text-orange-200">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get updates on new artisans and products.
            </p>
            <form
              className="flex"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="newsletter-email">Email</label>
              <input
                id="newsletter-email"
                className="bg-gray-800 border border-gray-700 text-white rounded-l-md px-4 py-2 w-full focus:ring-1 focus:ring-[#7C3A2E] text-sm"
                placeholder="Email Address"
                type="email"
              />
              <button
                type="submit"
                className="bg-[#7C3A2E] hover:bg-[#5e2b22] px-4 py-2 rounded-r-md transition"
                aria-label="Subscribe"
              >
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} BAYBAY. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a className="hover:text-white transition" href="#home">Facebook</a>
            <a className="hover:text-white transition" href="#home">Instagram</a>
            <a className="hover:text-white transition" href="#home">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
