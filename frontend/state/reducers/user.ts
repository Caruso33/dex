const userTypes = {
  ADD_WALLET: "ADD_WALLET",
  REMOVE_WALLET: "REMOVE_WALLET",
  ADD_CHAIN: "ADD_CHAIN",
  REMOVE_CHAIN: "REMOVE_CHAIN",
  ADD_BALANCES: "ADD_BALANCES",
  UPDATE_BALANCES: "UPDATE_BALANCES",
}

interface UserState {
  user: {
    account: Record<string, any>
    chain: Record<string, any>
    balances: Record<string, any>
  }
}

interface UserAction {
  data: any
  type: string
}

const userReducer = (state: UserState, action: UserAction) => {
  const { data, type } = action

  switch (type) {
    case userTypes.ADD_WALLET: {
      return {
        ...state,
        user: { ...state.user, account: { ...state.user.account, ...data } },
      }
    }

    case userTypes.REMOVE_WALLET: {
      return {
        ...state,
        user: { ...state.user, account: {} },
      }
    }

    case userTypes.ADD_CHAIN: {
      return {
        ...state,
        user: { ...state.user, chain: { ...state.user.chain, ...data } },
      }
    }

    case userTypes.REMOVE_CHAIN: {
      return {
        ...state,
        user: { ...state.user, chain: {} },
      }
    }

    case userTypes.ADD_BALANCES: {
      return {
        ...state,
        user: {
          ...state.user,
          balances: {
            ...state.user.balances,
            ...data,
          },
        },
      }
    }

    case userTypes.UPDATE_BALANCES: {
      return {
        ...state,
        user: {
          ...state.user,
          account: {
            ...state.user.account,
          },
        },
      }
    }

    default:
      return state
  }
}

export { userReducer as default, userTypes }
