import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { GRAPH_NODE, GRAPH_NODE_BLOCK, HEALTH_CLIENT, REFERRAL_CLIENT } from 'constants/graphs'

export const client = new ApolloClient({
  link: new HttpLink({
    uri: GRAPH_NODE,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: HEALTH_CLIENT,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const v1Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const stakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/way2rach/talisman',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPH_NODE_BLOCK,
  }),
  cache: new InMemoryCache(),
})

export const referralClient = new ApolloClient({
  link: new HttpLink({
    uri: REFERRAL_CLIENT
  }),
  cache: new InMemoryCache(),
})
