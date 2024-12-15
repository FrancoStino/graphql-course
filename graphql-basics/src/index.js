import myCurrentLocation, { getGreeting, message, name } from './myModule';

console.log(message);
console.log(name);
console.log(myCurrentLocation);
console.log(getGreeting('Jessica'));

// 1. Import add and subtract from math.js

import myAddFunction, { subtract } from './math';
console.log(myAddFunction(1, 2));
console.log(subtract(1, 2));
