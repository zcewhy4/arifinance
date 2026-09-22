const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_EXPENSE_CATEGORIES = [
  'Bensin',
  'Makan',
  'Minuman',
  'ShopeeFood',
  'Parkir',
  'Transportasi',
  'Kebutuhan Kuliah',
  'Nongkrong',
  'Belanja',
  'Lainnya',
];

const DEFAULT_INCOME_CATEGORIES = [
  'Uang Saku',
  'Gaji',
  'Freelance',
  'Lainnya',
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@arifinance.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@arifinance.com',
      password: hashedPassword,
    },
  });

  console.log(`✅ User created: ${user.email}`);

  // Create default expense categories (check if already exist first)
  const existingCategories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  let expenseCategories = [];
  let incomeCategories = [];

  if (existingCategories.length === 0) {
    for (const name of DEFAULT_EXPENSE_CATEGORIES) {
      const cat = await prisma.category.create({
        data: {
          userId: user.id,
          name,
          type: 'expense',
        },
      });
      expenseCategories.push(cat);
    }

    for (const name of DEFAULT_INCOME_CATEGORIES) {
      const cat = await prisma.category.create({
        data: {
          userId: user.id,
          name,
          type: 'income',
        },
      });
      incomeCategories.push(cat);
    }
    console.log('✅ Default categories created');
  } else {
    expenseCategories = existingCategories.filter(c => c.type === 'expense');
    incomeCategories = existingCategories.filter(c => c.type === 'income');
    console.log('✅ Categories already exist, skipping...');
  }

  // Check if demo data exists
  const existingIncomes = await prisma.income.count({ where: { userId: user.id } });
  const existingExpenses = await prisma.expense.count({ where: { userId: user.id } });

  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (existingIncomes === 0) {
    // Create demo income data
    await prisma.income.createMany({
      data: [
        {
          userId: user.id,
          amount: 500000,
          source: 'Uang Saku Bulanan',
          date: new Date(today.getFullYear(), today.getMonth(), 1),
          note: 'Uang saku dari orang tua',
        },
        {
          userId: user.id,
          amount: 350000,
          source: 'Freelance Design',
          date: new Date(today.getFullYear(), today.getMonth(), 5),
          note: 'Desain logo untuk klien',
        },
        {
          userId: user.id,
          amount: 200000,
          source: 'Uang Saku Tambahan',
          date: new Date(today.getFullYear(), today.getMonth(), 10),
          note: null,
        },
        {
          userId: user.id,
          amount: 150000,
          source: 'Jual Buku Bekas',
          date: new Date(today.getFullYear(), today.getMonth(), 12),
          note: 'Buku kuliah semester lalu',
        },
      ],
    });
    console.log('✅ Demo income data created');
  } else {
    console.log('✅ Income data already exists, skipping...');
  }

  if (existingExpenses === 0 && expenseCategories.length > 0) {
    const getCatId = (name) => {
      const cat = expenseCategories.find(c => c.name === name);
      return cat ? cat.id : expenseCategories[0].id;
    };

    await prisma.expense.createMany({
      data: [
        {
          userId: user.id,
          categoryId: getCatId('Bensin'),
          amount: 15000,
          paymentMethod: 'Cash',
          description: 'Bensin motor',
          date: new Date(today.getFullYear(), today.getMonth(), 2),
          note: null,
        },
        {
          userId: user.id,
          categoryId: getCatId('Makan'),
          amount: 12000,
          paymentMethod: 'Cash',
          description: 'Makan siang di kantin',
          date: new Date(today.getFullYear(), today.getMonth(), 3),
          note: null,
        },
        {
          userId: user.id,
          categoryId: getCatId('Parkir'),
          amount: 2000,
          paymentMethod: 'Cash',
          description: 'Parkir kampus',
          date: new Date(today.getFullYear(), today.getMonth(), 3),
          note: null,
        },
        {
          userId: user.id,
          categoryId: getCatId('ShopeeFood'),
          amount: 20000,
          paymentMethod: 'E-Wallet',
          description: 'Order makanan ShopeeFood',
          date: new Date(today.getFullYear(), today.getMonth(), 7),
          note: null,
        },
        {
          userId: user.id,
          categoryId: getCatId('Kebutuhan Kuliah'),
          amount: 35000,
          paymentMethod: 'Cash',
          description: 'Print tugas dan beli ATK',
          date: new Date(today.getFullYear(), today.getMonth(), 8),
          note: null,
        },
        {
          userId: user.id,
          categoryId: getCatId('Nongkrong'),
          amount: 25000,
          paymentMethod: 'QRIS',
          description: 'Kopi dan snack bareng teman',
          date: new Date(today.getFullYear(), today.getMonth(), 11),
          note: null,
        },
        {
          userId: user.id,
          categoryId: getCatId('Transportasi'),
          amount: 8000,
          paymentMethod: 'E-Wallet',
          description: 'Naik angkot pulang kampus',
          date: new Date(today.getFullYear(), today.getMonth(), 13),
          note: null,
        },
      ],
    });
    console.log('✅ Demo expense data created');
  } else {
    console.log('✅ Expense data already exists, skipping...');
  }

  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('📧 Demo Account:');
  console.log('   Email: demo@arifinance.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
