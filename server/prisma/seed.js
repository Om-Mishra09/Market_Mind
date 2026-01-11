const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clear existing data (optional, but good for re-running)
  await prisma.products.deleteMany();

  // Create the sample products
  const products = [
    { name: 'iPhone 14 Pro', category: 'Phone', price: 1299.00, rating: 4.8, demand_index: 92, release_year: 2022 },
    { name: 'Samsung Galaxy S23', category: 'Phone', price: 1199.00, rating: 4.7, demand_index: 88, release_year: 2023 },
    { name: 'Dell XPS 15', category: 'Laptop', price: 1899.50, rating: 4.9, demand_index: 85, release_year: 2022 },
    { name: 'MacBook Pro M2', category: 'Laptop', price: 2499.00, rating: 4.9, demand_index: 95, release_year: 2022 },
    { name: 'Toyota Camry', category: 'Car', price: 25000.00, rating: 4.6, demand_index: 75, release_year: 2023 },
    { name: 'Honda Civic', category: 'Car', price: 23000.00, rating: 4.5, demand_index: 78, release_year: 2023 },
    { name: 'Nike Air Force 1', category: 'Fashion', price: 110.00, rating: 4.9, demand_index: 98, release_year: 2021 },
  ];

  await prisma.products.createMany({
    data: products,
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });