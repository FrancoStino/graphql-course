// Questo codice implementa un server GraphQL usando GraphQL Yoga e Node.js

import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// Array di utenti con dati di esempio
const users = [
    {
        id: '1',
        name: 'Davide',
        email: 'davide@example.com',
        age: 27,
    },
    {
        id: '2',
        name: 'Michele',
        email: 'michele@example.com',
    },
    {
        id: '3',
        name: 'Tiziano',
        email: 'tiziano@example.com',
    },
];

// Array di post con dati di esempio
const posts = [
    {
        id: '10',
        title: 'GraphQL 101',
        body: 'This is how to use GraphQL...',
        published: true,
        author: '1', // Riferimento all'id dell'utente autore
    },
    {
        id: '11',
        title: 'GraphQL 201',
        body: 'This is an advanced GraphQL post...',
        published: false,
        author: '1',
    },
    {
        id: '12',
        title: 'Programming Music',
        body: '',
        published: false,
        author: '2',
    },
];

// Creazione dell'istanza GraphQL Yoga
const yoga = createYoga({
    schema: createSchema({
        // Definizione dello schema GraphQL con i tipi di dati
        typeDefs: /* GraphQL */ `
            # Query type definisce i punti di ingresso per le richieste di lettura
            type Query {
                users(query: String): [User!]! # Lista di utenti con filtro opzionale
                posts(query: String): [Post!]! # Lista di post con filtro opzionale
                me: User! # Utente corrente
                post: Post! # Post singolo
            }

            # Tipo User rappresenta un utente
            type User {
                id: ID!
                name: String!
                email: String!
                age: Int
                posts: [Post!]! # Relazione one-to-many con i post
            }

            # Tipo Post rappresenta un articolo
            type Post {
                id: ID!
                title: String!
                body: String!
                published: Boolean!
                author: User! # Relazione many-to-one con l'utente
            }
        `,
        // Implementazione dei resolver per gestire le query
        resolvers: {
            Query: {
                // Resolver per ottenere utenti con filtro opzionale sul nome
                users(parent, args, ctx, info) {
                    if (!args.query) {
                        return users;
                    }
                    return users.filter((user) => {
                        return user.name.toLowerCase().includes(args.query.toLowerCase());
                    });
                },
                // Resolver per ottenere post con filtro su titolo o corpo
                posts(parent, args, ctx, info) {
                    if (!args.query) {
                        return posts;
                    }
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
                // Resolver per ottenere l'utente corrente (hardcoded per esempio)
                me() {
                    return {
                        id: '123098',
                        name: 'Mike',
                        email: 'mike@example.com',
                    };
                },
                // Resolver per ottenere un post singolo (hardcoded per esempio)
                post() {
                    return {
                        id: '092',
                        title: 'GraphQL 101',
                        body: '',
                        published: false,
                    };
                },
            },
            // Resolver per il tipo Post per gestire la relazione con l'autore
            Post: {
                author(parent, args, ctx, info) {
                    return users.find((user) => {
                        return user.id === parent.author;
                    });
                },
            },
            // Resolver per il tipo User per gestire la relazione con i post
            User: {
                posts(parent, args, ctx, info) {
                    return posts.filter((post) => {
                        return post.author === parent.id;
                    });
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
