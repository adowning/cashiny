import * as products from './products.json'

interface ProductInput {
  id?: string
  title: string
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
  // Map products to conform to ProductInput interface
  // const _products = JSON.parse(JSON.stringify(products))
  // console.log(products[0])
  //@ts-ignore
  const mappedProducts: ProductInput[] = (products.default as any[]).map((product) => ({
    ...product,
    title: product.title ?? product.title, // Map 'title' to 'name' if 'name' is missing
    url: product.image ?? product.url, // Map 'url' to 'image' if 'image' is missing
    // shopId: key,
    operator: {
      connect: {
        id: key.id,
      },
    },
    totalDiscountInCents: 0,
    currency: {
      connect: {
        id: currencyID,
      },
    },
  }))

  for await (const product of mappedProducts) {
    await prisma.product.create({
      data: { ...product, currency: { connect: { id: currencyID } } },
    })
  }

  return await prisma.product.findMany()
}
