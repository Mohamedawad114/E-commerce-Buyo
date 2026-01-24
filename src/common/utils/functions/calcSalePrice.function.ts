export function calcSalePrice(originalprice: number, discountPercent: number) {
  return Math.round(originalprice - originalprice * (discountPercent / 100));
}
