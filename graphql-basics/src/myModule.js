// Default export - Has no name. You can only have one.

const message = 'Hello from myModule';

const name = 'John';

const location = 'New York';

const getGreeting = (name) => {
    return 'Welcome to the course ' + name;
};

export { message, name, getGreeting, location as default };
