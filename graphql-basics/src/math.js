// 1. Define add function that takes two arguments and adds them up
// 2. Define subtract function that takes two arguments and subtracts them
// 3. Set up add as default export
// 4. Set up subtract as a named export
// 5. Import add and subtract into index.js
// 6. Use both functions and print the results from each

const add = (a, b) => {
    return a + b;
};
const subtract = (a, b) => {
    return a - b;
};
export { add as default, subtract };
