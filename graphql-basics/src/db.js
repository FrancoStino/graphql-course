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

const db = {
    users,
    posts,
    comments,
};

export { db as default };
