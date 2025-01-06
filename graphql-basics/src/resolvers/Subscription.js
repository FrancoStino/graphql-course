const Subscription = {
    count: {
        // Usato per Flessibilità nei metodi
        // subscribe(parent, args, { pubsub }, info) {
        //     let count = 0;
        //     setInterval(() => {
        //         count++;
        //         pubsub.publish('count', {
        //             count,
        //         });
        //     }, 1000);
        //     return pubsub.subscribe('count');
        // },
    },
    comment: {
        subscribe(parent, { postId }, { db, pubsub }, info) {
            const post = db.posts.find((post) => post.id === postId && post.published);
            if (!post) {
                throw new GraphQLError('Post not found or is not published');
            }
            return pubsub.asyncIterator(`comment ${postId}`);
        },
    },
};
export default Subscription;
