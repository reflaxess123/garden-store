export default function AdminHome() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
      <p className="text-lg mb-4">
        Добро пожаловать в административную панель. Здесь вы можете управлять
        категориями, продуктами и заказами.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/admin/categories"
          className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <h2 className="text-xl font-semibold mb-2">Управление категориями</h2>
          <p className="text-gray-600">
            Добавляйте, редактируйте и удаляйте категории товаров.
          </p>
        </a>
        <a
          href="/admin/products"
          className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <h2 className="text-xl font-semibold mb-2">Управление продуктами</h2>
          <p className="text-gray-600">
            Редактируйте информацию о товарах, добавляйте новые.
          </p>
        </a>
        <a
          href="/admin/orders"
          className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <h2 className="text-xl font-semibold mb-2">Управление заказами</h2>
          <p className="text-gray-600">
            Просматривайте и управляйте заказами покупателей.
          </p>
        </a>
      </div>
    </div>
  );
}
