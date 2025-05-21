import * as products from './products.json';

export default async function loadProducts(prisma, key, currencyID) {
  for (var product of products.default) {
    product.shopId = key.id; // 'cmaq8ugkl004fmjykfj4zotcy'; // shop.id;
    product.totalDiscountInCents = 0;
    delete product.shop_id;
  }
  for await (const product of products.default) {
    product.currency_id;
    await prisma.product.create({
      data: { ...product, currency: { connect: { id: currencyID } } },
    });
  }
  return await prisma.product.findMany();
}
