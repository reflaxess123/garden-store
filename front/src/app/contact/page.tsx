export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Контакты</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Свяжитесь с нами</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Адрес:</h3>
              <p>г. Москва, ул. Садовая, д. 123</p>
            </div>
            <div>
              <h3 className="font-medium">Телефон:</h3>
              <p>+7 (495) 123-45-67</p>
            </div>
            <div>
              <h3 className="font-medium">Email:</h3>
              <p>info@sadovnick.store</p>
            </div>
            <div>
              <h3 className="font-medium">Режим работы:</h3>
              <p>Пн-Пт: 9:00 - 18:00</p>
              <p>Сб-Вс: 10:00 - 16:00</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Напишите нам</h2>
          <p className="text-muted-foreground">
            Мы всегда готовы ответить на ваши вопросы и помочь с выбором
            товаров. Свяжитесь с нами любым удобным способом!
          </p>
        </div>
      </div>
    </div>
  );
}
