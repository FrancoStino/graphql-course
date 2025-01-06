const Subscription = {
    comment: {
        subscribe(parent, { postId }, { db, pubsub }, info) {
            const foundPost = db.posts.find((post) => post.id === postId && post.published);
            if (!foundPost) {
                throw new Error('Post not found or is not published');
            }

            return pubsub.subscribe(`comment ${postId}`);
        },
    },
    post: {
        subscribe(parent, args, { pubsub }, info) {
            return pubsub.subscribe('post');
        },
    },
};
export default Subscription;
