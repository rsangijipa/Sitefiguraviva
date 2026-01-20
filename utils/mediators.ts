
// This utility replaces the old hardcoded mediators.ts
// It provides a fallback for getting mediator details.

export const getMediatorDetails = (mediator: any) => {
    // If mediator is already an object with details, return it
    if (typeof mediator === 'object' && mediator !== null && mediator.name) {
        return mediator;
    }

    // If mediator is a string (name), return a basic object
    if (typeof mediator === 'string') {
        return {
            name: mediator,
            role: 'Mediadora',
            image: '', // Placeholder or specific logic could go here
            bio: ''
        };
    }

    return null;
};
