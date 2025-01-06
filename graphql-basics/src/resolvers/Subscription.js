// Goal: Create  a subscription for a new posts

// 1. Define "post" subscription. No arguments are necessary. Response should be a post object.
// 2. Setup the resolver for post. Since there are no args, a channel name like "post" is fine.
// 3. Modify the mutation for creating a post to publish the new post data.
//     - Only call pubsub.publish if the post had "published" set to true.
//     - Don't worry about updatePost or deletePost
// 4. Test your work.

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
