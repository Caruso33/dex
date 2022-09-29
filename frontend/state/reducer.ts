import initialState from "./initialState"
import contractsReducer, { contractTypes } from "./reducers/contracts"
import userReducer, { userTypes } from "./reducers/user"
import eventsReducer, { eventTypes } from "./reducers/events"

const combineReducers = (reducers: object) => {
  return (state: object, action: () => {}) => {
    return Object.keys(reducers).reduce((acc, prop) => {
      return {
        ...acc,
        ...reducers[prop]({ [prop]: acc[prop] }, action),
      }
    }, state)
  }
}

const appReducers = combineReducers({
  user: userReducer,
  contracts: contractsReducer,
  events: eventsReducer,
})

const actionTypes = {
  ...userTypes,
  ...contractTypes,
  ...eventTypes,
}

export { initialState, combineReducers, appReducers, actionTypes }
