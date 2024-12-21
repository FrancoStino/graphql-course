import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

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
                hello: () => 'This is my first query!',
                name: () => 'John Doe',
                location: () => 'New York',
                bio: () => 'I am a software engineer',
            },
        },
    }),
});

const server = createServer(yoga);

server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
});
