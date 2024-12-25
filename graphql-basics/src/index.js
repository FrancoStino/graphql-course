// Questo codice implementa un server GraphQL usando GraphQL Yoga e Node.js

import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';

// 1. Set up a "Comment" type with id and text fields. Both are non-nullable - OK
// 2. Set up a "comments" array with 4 comments - OK
// 3. Set up a "comments" query with a  resolver that returns all comments - OK
// 4. Run a query to get all 4 comments with both id and text fields - OK

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

// Array di commenti con dati di esempio
const comments = [
    {
        id: '102',
        text: 'This worked well for me. Thanks!',
    },
    {
        id: '103',
        text: 'Glad you enjoyed it.',
    },
    {
        id: '104',
        text: 'This did no work.',
    },
    {
        id: '105',
        text: 'Nevermind. I got it to work.',
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
                comments: [Comment!]! # Lista di commenti
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
            type Comment {
                id: ID!
                text: String!
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
                // Resolver per ottenere tutti i commenti
                comments() {
                    return comments;
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
