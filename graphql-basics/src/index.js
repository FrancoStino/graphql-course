import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Scalar Types - String, int, float, boolean, ID

// Demo user data
const users = [
    {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        age: 25,
    },
    {
        id: '2',
        name: 'Jane',
        email: 'jane@example.com',
    },
    {
        id: '3',
        name: 'Bob',
        email: 'bob@example.com',
        age: 35,
    },
];
const yoga = createYoga({
    schema: createSchema({
        typeDefs: /* GraphQL */ `
            type Query {
                users(query: String): [User!]!
                me: User!
                post: Post!
            }
            type User {
                id: ID!
                name: String!
                email: String!
                age: Int
            }
            type Post {
                id: ID!
                title: String!
                body: String!
                published: Boolean!
            }
        `,
        resolvers: {
            Query: {
                users(parent, args, context, info) {
                    if (!args.query) {
                        return users;
                    }

                    return users.filter((user) => {
                        return user.name.toLowerCase().includes(args.query.toLowerCase());
                    });
                },
                me: () => {
                    return {
                        id: '7',
                        name: 'Davide',
                        email: 'info@davideladisa.it',
                        age: 28,
                    };
                },
                post() {
                    return {
                        id: '1',
                        title: 'Hello World',
                        body: 'This is a post',
                        published: true,
                    };
                },
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
