export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Политика конфиденциальности</h1>

      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Данная политика конфиденциальности описывает, как мы собираем,
          используем и защищаем вашу персональную информацию.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Сбор информации</h2>
        <p className="mb-4">
          Мы собираем информацию, которую вы предоставляете нам при регистрации,
          оформлении заказов и использовании наших услуг:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Имя и контактная информация</li>
          <li>Адрес доставки</li>
          <li>Платежная информация</li>
          <li>История заказов</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">
          Использование информации
        </h2>
        <p className="mb-4">Мы используем собранную информацию для:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Обработки и выполнения заказов</li>
          <li>Связи с вами по вопросам заказов</li>
          <li>Улучшения наших услуг</li>
          <li>Отправки важных уведомлений</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Защита данных</h2>
        <p className="mb-4">
          Мы применяем соответствующие технические и организационные меры для
          защиты ваших персональных данных от несанкционированного доступа,
          изменения, раскрытия или уничтожения.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Ваши права</h2>
        <p className="mb-4">Вы имеете право:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Получать информацию о обработке ваших данных</li>
          <li>Исправлять неточные данные</li>
          <li>Удалять ваши данные</li>
          <li>Ограничивать обработку данных</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Контакты</h2>
        <p className="mb-4">
          Если у вас есть вопросы по поводу данной политики конфиденциальности,
          свяжитесь с нами:
        </p>
        <p className="mb-4">Email: privacy@sadovnick.store</p>

        <p className="text-sm text-gray-600 mt-8">
          Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
        </p>
      </div>
    </div>
  );
}
