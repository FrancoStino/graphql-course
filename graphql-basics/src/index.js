import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Scalar Types - String, int, float, boolean, ID

// Create a Yoga instance with a GraphQL schema
const yoga = createYoga({
    schema: createSchema({
        typeDefs: /* GraphQL */ `
            type Query {
                id: ID!
                name: String!
                age: Int!
                employed: Boolean!
                gpa: Float
            }
        `,
        resolvers: {
            Query: {
                id: () => 'abc123',
                name: () => 'Davide Ladisa',
                age: () => 30,
                employed: () => true,
                gpa: () => 3.01,
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
