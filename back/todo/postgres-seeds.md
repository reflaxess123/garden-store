### Данные для сидирования из `prisma/seed.ts`

```typescript
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Очистка данных перед сидированием
  console.log(`Deleting existing order items...`);
  await prisma.orderItem.deleteMany();
  console.log(`Deleting existing orders...`);
  await prisma.order.deleteMany();
  console.log(`Deleting existing carts...`);
  await prisma.cartItem.deleteMany();
  console.log(`Deleting existing favourites...`);
  await prisma.favourite.deleteMany();
  console.log(`Deleting existing products...`);
  await prisma.product.deleteMany();
  console.log(`Deleting existing categories...`);
  await prisma.category.deleteMany();
  console.log(`Deleting existing profiles...`);
  await prisma.profile.deleteMany();
  console.log(`Existing data deleted.`);

  // Создание тестовых пользователей (профилей)
  const user1 = await prisma.profile.create({
    data: {
      id: "28ad2b7d-02d6-4f84-b1c3-1ee26e6b4b58", // Ваш реальный ID администратора
      fullName: "John Doe",
      isAdmin: true,
    },
  });

  // const user2 = await prisma.profile.create({
  //   data: {
  //     id: "5a9c0c1b-2b4a-4a2a-8b1a-2c3d4e5f6a7b", // Произвольный валидный UUID для второго пользователя
  //     fullName: "Jane Smith",
  //     isAdmin: false,
  //   },
  // });

  console.log(`Created users: ${user1.fullName}`);

  // Создание категорий
  const categoryShovels = await prisma.category.upsert({
    where: { slug: "shovels" },
    update: {},
    create: {
      name: "Лопаты",
      slug: "shovels",
      description: "Разнообразные лопаты для любых садовых работ",
      imageUrl: "/images/shovels_category.jpg",
    },
  });

  const categorySeeds = await prisma.category.upsert({
    where: { slug: "seeds" },
    update: {},
    create: {
      name: "Семена",
      slug: "seeds",
      description: "Высококачественные семена для богатого урожая",
      imageUrl: "/images/seeds_category.jpg",
    },
  });

  const categoryPots = await prisma.category.upsert({
    where: { slug: "pots" },
    update: {},
    create: {
      name: "Горшки и кашпо",
      slug: "pots",
      description: "Красивые и функциональные горшки для ваших растений",
      imageUrl: "/images/pots_category.jpg",
    },
  });

  console.log(
    `Created categories: ${categoryShovels.name}, ${categorySeeds.name}, ${categoryPots.name}`
  );

  // Добавление настоящих продуктов
  const realProducts = [
    // Лопаты
    {
      name: "Лопата штыковая Fiskars",
      slug: "fiskars-shovel",
      description: "Высокопрочная штыковая лопата для копки земли.",
      price: 2500.0,
      categoryId: categoryShovels.id,
      imageUrl: "/images/fiskars_shovel.jpg",
      characteristics: {
        material: "Закаленная сталь",
        length: "120 см",
      },
    },
    {
      name: "Лопата совковая Palisad",
      slug: "palisad-scoop-shovel",
      description: "Совковая лопата для сыпучих материалов.",
      price: 1200.0,
      categoryId: categoryShovels.id,
      imageUrl: "/images/folding_shovel.jpg",
      characteristics: {
        material: "Углеродистая сталь",
        width: "25 см",
      },
    },
    // Семена
    {
      name: "Семена Томатов 'Черный Принц'",
      slug: "tomato-black-prince",
      description: "Раннеспелые, крупные, сладкие плоды.",
      price: 150.0,
      categoryId: categorySeeds.id,
      imageUrl: "/images/sunflower_seeds.jpg",
      characteristics: {
        variety: "Индетерминантный",
        yield: "5 кг/куст",
      },
    },
    {
      name: "Семена Огурцов 'Зозуля'",
      slug: "cucumber-zozulya",
      description: "Партенокарпический гибрид, без горечи.",
      price: 120.0,
      categoryId: categorySeeds.id,
      imageUrl: "/images/sunflower_seeds.jpg",
      characteristics: {
        variety: "Самоопыляемый",
        ripening: "40-45 дней",
      },
    },
    // Горшки
    {
      name: "Горшок керамический для цветов ⌀20см",
      slug: "ceramic-pot-20cm",
      description: "Классический керамический горшок для комнатных растений.",
      price: 450.0,
      categoryId: categoryPots.id,
      imageUrl: "/images/ceramic_pot.jpg",
      characteristics: {
        material: "Керамика",
        diameter: "20 см",
        color: "Терракотовый",
      },
    },
    {
      name: "Кашпо пластиковое подвесное ⌀25см",
      slug: "hanging-plastic-pot-25cm",
      description: "Легкое пластиковое кашпо для подвесных композиций.",
      price: 300.0,
      categoryId: categoryPots.id,
      imageUrl: "/images/hanging_pot.jpg",
      characteristics: {
        material: "Пластик",
        diameter: "25 см",
      },
    },
  ];

  for (const productData of realProducts) {
    await prisma.product.create({
      data: {
        ...productData,
        characteristics: productData.characteristics || {},
      },
    });
  }
  console.log(`Created ${realProducts.length} real products.`);

  // Создание дополнительных случайных продуктов
  const categories = [categoryShovels, categorySeeds, categoryPots];
  const imagePaths = [
    "/images/ceramic_pot.jpg",
    "/images/fiskars_shovel.jpg",
    "/images/folding_shovel.jpg",
    "/images/hanging_pot.jpg",
    "/images/peat_pots.jpg",
    "/images/sunflower_seeds.jpg",
    "/images/truper_drain.jpg",
  ];

  const numberOfAdditionalProducts = 150; // Желаемое количество дополнительных продуктов

  for (let i = 0; i < numberOfAdditionalProducts; i++) {
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomImage =
      imagePaths[Math.floor(Math.random() * imagePaths.length)];
    const productName = `Случайный продукт ${i + 1} (${randomCategory.name})`;
    const productSlug = `random-product-${i + 1}-${randomCategory.slug}`;
    const productDescription = `Описание случайного продукта ${i + 1}.`;
    const productPrice = parseFloat((Math.random() * 1000 + 100).toFixed(2)); // Цена от 100 до 1100

    await prisma.product.create({
      data: {
        name: productName,
        slug: productSlug,
        description: productDescription,
        price: productPrice,
        categoryId: randomCategory.id,
        imageUrl: randomImage,
        characteristics: {
          weight: `${(Math.random() * 5 + 0.1).toFixed(1)} кг`,
        },
      },
    });
  }

  console.log(
    `Created ${numberOfAdditionalProducts} additional random products.`
  );

  // Получаем все созданные продукты для генерации заказов
  const allProducts = await prisma.product.findMany();
  if (allProducts.length === 0) {
    console.warn(
      "No products found to create orders. Please ensure products are seeded first."
    );
    return;
  }

  // Создание случайных заказов
  const numberOfOrders = 50; // Количество случайных заказов
  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const users = [user1];

  for (let i = 0; i < numberOfOrders; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    let totalAmount = 0;
    const numberOfOrderItems = Math.floor(Math.random() * 3) + 1; // От 1 до 3 товаров в заказе

    for (let j = 0; j < numberOfOrderItems; j++) {
      const randomProduct =
        allProducts[Math.floor(Math.random() * allProducts.length)];
      const quantity = Math.floor(Math.random() * 5) + 1; // От 1 до 5 единиц каждого товара
      const priceSnapshot = randomProduct.price.toNumber(); // Цена продукта на момент заказа
      orderItems.push({
        productId: randomProduct.id,
        quantity,
        priceSnapshot,
        name: randomProduct.name,
        imageUrl: randomProduct.imageUrl,
      });
      totalAmount += priceSnapshot * quantity;

      // Увеличиваем счетчик timesOrdered для продукта
      await prisma.product.update({
        where: { id: randomProduct.id },
        data: { timesOrdered: { increment: quantity } },
      });
    }

    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    await prisma.order.create({
      data: {
        userId: randomUser.id,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: randomStatus,
        fullName: randomUser.fullName || "Guest User",
        email: `user${i}@example.com`, // Для тестовых пользователей используем фиктивный email
        address: `Улица ${i + 1}, Дом ${(i % 10) + 1}`,
        city: `Город ${(i % 5) + 1}`,
        postalCode: `12345${i % 10}`,
        phone: `+7999${1000000 + i}`,
        orderItems: {
          create: orderItems,
        },
      },
    });
  }
  console.log(`Created ${numberOfOrders} random orders.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
