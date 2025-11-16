let str = "and(add(mul(add(10, 1), mul(y, add(1, add(21, 1)))), add(x, mul(y, 2))), mul(15, add(16, 1)))"

console.log(str.match(/(add)\s*\(\s*([0-9])\s*,\s*([0-9])\)/mg))