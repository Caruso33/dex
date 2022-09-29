interface AppState {
  user: {
    account: {}
    chain: {}
    balances: {}
  }
  contracts: {}
  events: {
    makeOrders: []
    cancelOrders: []
    trades: []
    deposits: []
    withdrawals: []
  }
}

const initialState = {
  user: {
    account: {},
    chain: {},
    balances: {},
  },
  contracts: {},
  events: {
    makeOrders: [],
    cancelOrders: [],
    trades: [],
    deposits: [],
    withdrawals: [],
  },
}

export { initialState as default, type AppState }
