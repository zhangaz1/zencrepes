import React from 'react';

import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context';


const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = Meteor.user().services.github.accessToken;
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
});

const link = new HttpLink({ uri: 'https://api.github.com/graphql' });
const cache = new InMemoryCache().restore(window.__APOLLO_STATE__);

const client = new ApolloClient({
    link: authLink.concat(link),
    cache: cache,
});

export default (
    ({ children }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
    )
);
