/*
  Warnings:

  - You are about to drop the column `demand_index` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `release_year` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `demand_index`,
    DROP COLUMN `release_year`,
    ADD COLUMN `rating_count` INTEGER NULL,
    MODIFY `name` VARCHAR(1000) NOT NULL,
    MODIFY `category` VARCHAR(255) NOT NULL,
    MODIFY `price` DOUBLE NOT NULL;
