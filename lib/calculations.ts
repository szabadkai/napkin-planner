export function calculateRevenue(price: number, customers: number): number {
  return price * customers;
}

export function calculateGrossProfit(
  revenue: number,
  grossMarginPercent: number
): number {
  return revenue * (grossMarginPercent / 100);
}

export function calculateNetProfit(
  grossProfit: number,
  fixedCosts: number
): number {
  return grossProfit - fixedCosts;
}

export function calculateBreakEvenCustomers(
  fixedCosts: number,
  price: number,
  grossMarginPercent: number
): number {
  return fixedCosts / (price * (grossMarginPercent / 100));
}

