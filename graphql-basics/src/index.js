import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Create a Yoga instance with a GraphQL schema
const yoga = createYoga({
    schema: createSchema({
        typeDefs: /* GraphQL */ `
            type Query {
                hello: String!
                name: String!
                location: String!
                bio: String!
            }
        `,
        resolvers: {
            Query: {
                // Resolver for the 'hello' field
                hello: () => 'This is my first query!',
                // Resolver for the 'name' field
                name: () => 'John Doe',
                // Resolver for the 'location' field
                location: () => 'New York',
                // Resolver for the 'bio' field
                bio: () => 'I am a software engineer',
            },
        },
    }),
});

// Create an HTTP server with the Yoga instance
const server = createServer(yoga);

// Start the server and listen on port 4000
server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
});
