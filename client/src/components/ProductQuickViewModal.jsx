export default function ProductQuickViewModal({ product, onClose }) {
  if (!product) return null;

  const price = Number(product.price || 0).toFixed(0);

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product quick view"
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white overflow-hidden shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <div className="h-72 md:h-full bg-gray-100">
            <img
              src={product.image_url}
              alt={product.name || "Product"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-gray-900">
                  {product.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {product.category || "Delicacy"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-gray-200 grid place-items-center hover:border-[#7C3A2E] hover:text-[#7C3A2E] transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">
              {product.description || "Handcrafted with love and tradition."}
            </p>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-2xl font-bold text-[#7C3A2E]">Php {price}</p>

              <button
                type="button"
                className="bg-[#7C3A2E] hover:bg-[#5e2b22] text-white px-5 py-3 rounded-full font-bold transition"
              >
                Add to Cart
              </button>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
              Tip: connect this button later to your cart/checkout flow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
