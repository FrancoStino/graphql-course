const Subscription = {
    count: {
        // Usato per Flessibilità nei metodi
        subscribe(parent, args, { pubsub }, info) {
            let count = 0;
            setInterval(() => {
                count++;
                pubsub.publish('count', {
                    count,
                });
            }, 1000);
            return pubsub.subscribe('count');
        },
    },
};
export default Subscription;
