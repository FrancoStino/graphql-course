// Questo codice implementa un server GraphQL usando GraphQL Yoga e Node.js

import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLError } from 'graphql';

// Scalar type - String, Boolean, Int, Float, ID

// Goal: Setup a Mutation for deleting a post

// 1. Define a mutation. It should take the post id. It should return the deleted post.
// 2. Define the resolver for the mutation.
//      - Check if the post exists, else throw an error
//      - Remove and return the post
//      - Remove all comments belonging to the post
// 3. Test your work by running query to delete a post. Verify post/comments are removed.

// Array di utenti con dati di esempio
let users = [
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
let posts = [
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
let comments = [
    {
        id: '102',
        text: 'This worked well for me. Thanks!',
        author: '1', // Riferimento all'id dell'utente autore
        post: '10', // Riferimento all'id del post associato
    },
    {
        id: '103',
        text: 'Glad you enjoyed it.',
        author: '1',
        post: '10',
    },
    {
        id: '104',
        text: 'This did no work.',
        author: '2',
        post: '11',
    },
    {
        id: '105',
        text: 'Nevermind. I got it to work.',
        author: '3',
        post: '12',
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
            # Type Mutation definisce i punti di ingresso per le operazioni di scrittura
            type Mutation {
                createUser(data: CreateUserInput): User! # Crea un nuovo utente
                deleteUser(id: ID!): User! # Elimina un utente
                createPost(data: CreatePostInput): Post! # Crea un nuovo post
                deletePost(id: ID!): Post! # Elimina un post
                createComment(data: CreateCommentInput): Comment! # Crea un nuovo commento
            }
            # Keyord input definisce un tipo di input per la creazione di un utente
            input CreateUserInput {
                name: String!
                email: String!
                age: Int
            }
            # Keyord input definisce un tipo di input per la creazione di un post
            input CreatePostInput {
                title: String!
                body: String!
                published: Boolean!
                author: ID!
            }
            # Keyord input definisce un tipo di input per la creazione di un commento
            input CreateCommentInput {
                text: String!
                author: ID!
                post: ID!
            }
            # Tipo User rappresenta un utente
            type User {
                id: ID!
                name: String!
                email: String!
                age: Int
                posts: [Post!]! # Relazione one-to-many con i post
                comments: [Comment!]! # Relazione one-to-many con i commenti
            }

            # Tipo Post rappresenta un articolo
            type Post {
                id: ID!
                title: String!
                body: String!
                published: Boolean!
                author: User! # Relazione many-to-one con l'utente
                comments: [Comment!]! # Relazione one-to-many con i commenti
            }
            type Comment {
                id: ID!
                text: String!
                author: User! # Relazione many-to-one con l'utente
                post: Post! # Relazione many-to-one con il post
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
            // Resolver per il tipo Mutation per gestire la creazione di un nuovo utente
            Mutation: {
                createUser(parent, args, ctx, info) {
                    const emailTaken = users.some((user) => user.email === args.data.email);
                    if (emailTaken) {
                        //Error handling
                        throw new GraphQLError('Email already in use');
                    }
                    const user = {
                        id: uuidv4(),
                        // name: args.name,
                        // email: args.email,
                        // age: args.age,
                        ...args.data,
                    };

                    users.push(user);
                    return user;

                    // console.log(args);
                },
                // Resolver per il tipo Mutation per gestire l'eliminazione di un utente
                deleteUser(parent, args, ctx, info) {
                    // 1. Trova l'indice dell'utente da eliminare nell'array degli utenti
                    const userIndex = users.findIndex((user) => user.id === args.id);

                    // 2. Se l'utente non viene trovato, lancia un errore
                    if (userIndex === -1) {
                        //Error handling
                        throw new GraphQLError('User not found');
                    }

                    // 3. Rimuove l'utente dall'array e lo memorizza
                    const deletedUsers = users.splice(userIndex, 1);

                    // 4. Filtra i post rimuovendo quelli dell'utente eliminato
                    posts = posts.filter((post) => {
                        const match = post.author === args.id;

                        // 5. Se trova un post dell'utente, rimuove anche tutti i commenti associati a quel post
                        if (match) {
                            comments = comments.filter((comment) => comment.post !== post.id);
                        }

                        // 6. Mantiene solo i post che non appartengono all'utente eliminato
                        return !match;
                    });

                    // 7. Rimuove tutti i commenti fatti dall'utente eliminato
                    comments = comments.filter((comment) => comment.author !== args.id);

                    // 8. Restituisce l'utente eliminato
                    return deletedUsers[0];
                },
                // Resolver per il tipo Mutation per gestire la creazione di un nuovo post
                createPost(parent, args, ctx, info) {
                    const userExists = users.some((user) => user.id === args.data.author);
                    if (!userExists) {
                        //Error handling
                        throw new GraphQLError('User not found');
                    }
                    const post = {
                        id: uuidv4(),
                        // title: args.title,
                        // body: args.body,
                        // published: args.published,
                        // author: args.author,
                        ...args.data,
                    };
                    posts.push(post);
                    return post;
                },
                // Resolver per il tipo Mutation per gestire l'eliminazione di un post
                deletePost(parent, args, ctx, info) {
                    // 1. Trova l'indice del post da eliminare nell'array dei post
                    const postIndex = posts.findIndex((post) => post.id === args.id);
                    // 2. Se il post non viene trovato, lancia un errore
                    if (postIndex === -1) {
                        //Error handling
                        throw new GraphQLError('Post not found');
                    }
                    // 3. Rimuove il post dall'array e lo memorizza
                    const deletedPost = posts.splice(postIndex, 1);
                    // 4. Filtra i commenti rimuovendo quelli del post eliminato
                    comments = comments.filter((comment) => comment.post !== args.id);
                    // 5. Restituisce il post eliminato
                    return deletedPost[0];
                },
                // Resolver per il tipo Mutation per gestire la creazione di un nuovo commento
                createComment(parent, args, ctx, info) {
                    const userExists = users.some((user) => user.id === args.data.author);
                    const postExists = posts.some(
                        (post) => post.id === args.data.post && post.published,
                    );

                    if (!userExists) {
                        //Error handling
                        throw new GraphQLError('User not found');
                    }

                    if (!postExists) {
                        //Error handling
                        throw new GraphQLError('Post not found');
                    }
                    const comment = {
                        id: uuidv4(),
                        // text: args.text,
                        // author: args.author,
                        // post: args.post,
                        ...args.data,
                    };
                    comments.push(comment);
                    return comment;
                },
            },
            // Resolver per il tipo Post per gestire la relazione con l'autore
            Post: {
                author(parent, args, ctx, info) {
                    return users.find((user) => {
                        return user.id === parent.author;
                    });
                },
                comments(parent, args, ctx, info) {
                    return comments.filter((comment) => {
                        return comment.post === parent.id;
                    });
                },
            },
            // Resolver per il tipo User per gestire la relazione con i post e commenti
            User: {
                posts(parent, args, ctx, info) {
                    return posts.filter((post) => {
                        return post.author === parent.id;
                    });
                },
                comments(parent, args, ctx, info) {
                    return comments.filter((comment) => {
                        return comment.author === parent.id;
                    });
                },
            },
            // Resolver per il tipo Comment per gestire la relazione con l'autore
            Comment: {
                author(parent, args, ctx, info) {
                    return users.find((user) => {
                        return user.id === parent.author;
                    });
                },
                post(parent, args, ctx, info) {
                    return posts.find((post) => {
                        return post.id === parent.post;
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
