import * as products from './products.json'

interface ProductInput {
  id?: string
  name: string
  priceInCents: number
  description?: string
  image?: string
  shopId?: string
  totalDiscountInCents?: number
  currency_id?: string
  [key: string]: unknown // For any additional properties
}

export default async function loadProducts(
  prisma: any, // Would ideally import PrismaClient type
  key: { id: string },
  currencyID: string
): Promise<ProductInput[]> {
  for (const product of products.default as ProductInput[]) {
    product.shopId = key.id
    product.totalDiscountInCents = 0
    delete product.shop_id
  }

  for await (const product of products.default as ProductInput[]) {
    product.currency_id
    await prisma.product.create({
      data: { ...product, currency: { connect: { id: currencyID } } },
    })
  }

  return await prisma.product.findMany()
}
