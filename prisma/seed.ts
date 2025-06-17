import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Очистка данных перед сидированием
  console.log(`Deleting existing products...`);
  await prisma.product.deleteMany();
  console.log(`Deleting existing categories...`);
  await prisma.category.deleteMany();
  console.log(`Existing data deleted.`);

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
