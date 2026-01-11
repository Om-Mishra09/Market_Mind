const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data import...');
  const productsToCreate = [];

  fs.createReadStream(path.join(__dirname, 'amazon.csv'))
    .pipe(csv())
    .on('data', (row) => {
      const priceString = row.discounted_price.replace('₹', '').replace(/,/g, '');
      const price = parseFloat(priceString);

      const rating = parseFloat(row.rating);

      const ratingCountString = row.rating_count ? row.rating_count.replace(/,/g, '') : '0';
      const rating_count = parseInt(ratingCountString, 10);
      
      const category = row.category.split('|')[0].trim();
      
      const name = row.product_name;

 
      if (name && !isNaN(price)) {
        productsToCreate.push({
          name: name,
          category: category,
          price: price,
          rating: isNaN(rating) ? null : rating,
          rating_count: isNaN(rating_count) ? null : rating_count,
        });
      }
    })
    .on('end', async () => {
      console.log(`...read ${productsToCreate.length} products from CSV.`);
      

      await prisma.products.deleteMany({});
      console.log('Cleared old products.');

      await prisma.products.createMany({
        data: productsToCreate,
        skipDuplicates: true,
      });

      console.log('Data import complete!');
    });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });