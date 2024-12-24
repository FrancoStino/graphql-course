// Questo codice implementa un server GraphQL usando GraphQL Yoga e Node.js

import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Array di utenti con dati di esempio
const users = [
    {
        id: '1',
        name: 'Davide',
        email: 'info@davideladisa.it',
        age: 28,
    },
    {
        id: '2',
        name: 'John',
        email: 'john@example.com',
        age: 30,
    },
    {
        id: '3',
        name: 'Jane',
        email: 'jane@example.com',
        age: 28,
    },
];

// Array di post con dati di esempio
const posts = [
    {
        id: '1',
        title: 'GraphQL',
        body: 'GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.',
        published: true,
        author: '1', // Riferimento all'id dell'autore
    },
    {
        id: '2',
        title: 'Node.js',
        body: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
        published: true,
        author: '1',
    },
    {
        id: '3',
        title: 'React',
        body: 'React is a JavaScript library for building user interfaces.',
        published: false,
        author: '2',
    },
];

// Creazione dell'istanza GraphQL Yoga
const yoga = createYoga({
    schema: createSchema({
        // Definizione dei tipi GraphQL
        typeDefs: /* GraphQL */ `
            type Query {
                posts(query: String): [Post!]! # Query per ottenere i post con filtro opzionale
                me: User! # Query per ottenere l'utente corrente
                post: Post! # Query per ottenere un post
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
                author: User! # Relazione con l'utente autore
            }
        `,
        // Implementazione dei resolver
        resolvers: {
            Query: {
                // Resolver per la query posts
                posts: (parent, args, ctx, info) => {
                    if (!args.query) {
                        return posts; // Ritorna tutti i post se non c'è query
                    }
                    // Filtra i post in base alla query
                    return posts.filter((post) => {
                        const isTitleMatch = post.title
                            .toLowerCase()
                            .includes(args.query.toLowerCase());
                        const isBodyMatch = post.body
                            .toLowerCase()
                            .includes(args.query.toLowerCase());
                        return isTitleMatch || isBodyMatch;
                    });
                },
                // Resolver per la query me
                me: () => {
                    return {
                        id: '7',
                        name: 'Davide',
                        email: 'info@davideladisa.it',
                        age: 28,
                    };
                },
            },
            // Resolver per il campo author del tipo Post
            Post: {
                author(parent, args, ctx, info) {
                    return users.find((user) => user.id === parent.author);
                },
            },
        },
    }),
});

// Creazione del server HTTP
const server = createServer(yoga);

// Avvio del server sulla porta 4000
server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql');
});
