import { BonusItem as DepositBonusConfig } from '@cashflow/types' // Assuming BonusItem from shared/interface/bonus.ts

/**
 * Calculates the bonus amount for a given deposit amount based on a list of bonus configurations.
 * It applies the first matching bonus rule found in the configuration list.
 *
 * @param depositAmount The amount of the deposit.
 * @param bonusConfigs An array of bonus configuration objects.
 * @returns The calculated bonus amount. Returns 0 if no matching bonus rule is found.
 */
export function calculateBonus(
  depositAmount: number,
  bonusConfigs: DepositBonusConfig[] // Using the imported interface for type safety
): number {
  // Ensure depositAmount is a positive number
  if (typeof depositAmount !== 'number' || depositAmount <= 0) {
    console.warn('calculateBonus: Invalid deposit amount provided:', depositAmount)
    return 0
  }

  // Ensure bonusConfigs is an array
  if (!Array.isArray(bonusConfigs)) {
    console.warn(
      'calculateBonus: Invalid bonus configurations provided. Expected an array.',
      bonusConfigs
    )
    return 0
  }

  // Iterate through the bonus configurations to find the first matching rule
  for (const bonusConfig of bonusConfigs) {
    // Validate required properties for a bonus rule
    if (
      typeof bonusConfig.type !== 'number' ||
      typeof bonusConfig.min !== 'number' ||
      // Check for max or rate based on type
      (bonusConfig.type === 0 &&
        typeof bonusConfig.max !== 'number' &&
        typeof bonusConfig.award !== 'number') ||
      (bonusConfig.type === 1 &&
        typeof bonusConfig.max !== 'number' &&
        typeof bonusConfig.rate !== 'number')
    ) {
      console.warn('calculateBonus: Skipping invalid bonus configuration entry:', bonusConfig)
      continue // Skip this entry and check the next one
    }

    const minAmount = bonusConfig.min
    const maxAmount = bonusConfig.max === 0 ? Infinity : bonusConfig.max // Treat max 0 as no maximum

    // Check if the deposit amount falls within the current bonus rule's range
    if (depositAmount >= minAmount && depositAmount <= maxAmount) {
      // Apply the bonus based on the type
      if (bonusConfig.type === 0) {
        // Type 0: Fixed amount bonus
        // Ensure bonusConfig.award is a number for this type
        if (typeof bonusConfig.award === 'number') {
          console.log(`Applied fixed bonus: ${bonusConfig.award} for deposit ${depositAmount}`)
          return bonusConfig.award
        } else {
          console.warn(
            "calculateBonus: Bonus config type 0 is missing 'award' property or it's not a number:",
            bonusConfig
          )
          return 0 // Invalid config for this type, return 0 bonus
        }
      } else if (bonusConfig.type === 1) {
        // Type 1: Percentage bonus
        // Ensure bonusConfig.rate is a number for this type
        if (typeof bonusConfig.rate === 'number') {
          const calculatedBonus = depositAmount * bonusConfig.rate
          console.log(
            `Applied percentage bonus: ${bonusConfig.rate * 100}% (${calculatedBonus}) for deposit ${depositAmount}`
          )
          return calculatedBonus
        } else {
          console.warn(
            "calculateBonus: Bonus config type 1 is missing 'rate' property or it's not a number:",
            bonusConfig
          )
          return 0 // Invalid config for this type, return 0 bonus
        }
      } else {
        // Unknown bonus type
        console.warn('calculateBonus: Encountered unknown bonus type:', bonusConfig.type)
        return 0 // Unknown type, return 0 bonus
      }
    }
  }

  // If no matching bonus rule is found
  console.log(`No matching bonus rule found for deposit amount: ${depositAmount}`)
  return 0
}

// Example Usage (for testing)
/*
const sampleBonusConfigs: DepositBonusConfig[] = [
    { type: 0, min: 100, max: 500, award: 50, status: 1, now: '0', max: '0', ended_at: 0, created_at: 0, gain_amount: '0', currency: 'USD', receive: 0, wager: 0, rate: 0, deposit: '0', id: 0, children: null }, // Fixed bonus of 50 for deposits between 100 and 500
    { type: 1, min: 501, max: 0, rate: 0.1, status: 1, now: '0', max: '0', ended_at: 0, created_at: 0, gain_amount: '0', currency: 'USD', receive: 0, wager: 0, rate: 0.1, deposit: '0', id: 0, children: null }, // 10% bonus for deposits over 500 (max 0 means no max)
    // Add other bonus rules as needed
];

console.log("Bonus for 50:", calculateBonus(50, sampleBonusConfigs)); // Expected: 0
console.log("Bonus for 150:", calculateBonus(150, sampleBonusConfigs)); // Expected: 50
console.log("Bonus for 600:", calculateBonus(600, sampleBonusConfigs)); // Expected: 60 (600 * 0.1)
console.log("Bonus for 1000:", calculateBonus(1000, sampleBonusConfigs)); // Expected: 100 (1000 * 0.1)
console.log("Bonus for 0:", calculateBonus(0, sampleBonusConfigs)); // Expected: 0 (Invalid input)
console.log("Bonus for -100:", calculateBonus(-100, sampleBonusConfigs)); // Expected: 0 (Invalid input)
console.log("Bonus for 250:", calculateBonus(250, [])); // Expected: 0 (Empty config)
*/
