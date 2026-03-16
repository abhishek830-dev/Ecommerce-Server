/**
 * First approach
 * Find pair using brute force
 *
 * Input: [-3, 1, 3, 4, -1] (Two loops)
 * Step 1 - Hold - 3
 * Step 1.1 - Run another loop & check the following
 * Step 1.2 - -3 + 1 => -2, is -2 === 5 ? = No
 * Step 1.3 - -3 +3 => 0 => No
 * Step 1.4 - -3 + 4 = 1 => No
 * Step 1.5 - -3 + -1 => -4 => No
 * Step 2 - Now hold 1
 * Step 2.1 - 1 + 3 => 4 => No
 * Step 2.2 - 1 + 4 => 5 => Yes
 */

/**
 * Second approach
 * Input: [-3, 1, 3, 4, -1]
 * Initilise a register i.e. obj, map , hashmap 
 * Step 1 - Get -3 & subtract with k => -3 - 5 - (-3) => 8 -> No => {-3}
 * Step 2 - Get 1 & subtract with k => 5-1 => 4 => No => {-3, 1}
 * Step 3 - Get 3 & subtract with k => 5 - 3 => 2  => No => {-3, 1, 3}
 * Step 4 - Get 4 & subtract with k => 5 - 4 => 1 => Yes => [1,4]

 */
