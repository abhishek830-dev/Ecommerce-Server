/**
 * We need to reverse a no
 * For ex - 1234 -> 4321
 * Step 1 - Divide the no & get the remainder -> 1234 % 10 -> 4
 * Step 1.1 -> 0
 * Step 1.2 -> 0*10 + 4 -> 4 (123)
 * Step 1.3 -> 4*10 + 3 -> 43 (12)
 * Step 1.4 -> 43*10 + 2 -> 432 (1)
 * Step 1.5 -> 432*10 + 1 -> 4321 (0)
 * Step 2 - Keep a reverse variable to store results & initialise it with 0 -> rev = 0
 */
