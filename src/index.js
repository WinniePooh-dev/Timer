import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';


const createStore = (reducer, initialState) => {
  let currentState = initialState
  const listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => listeners.push(listener)

  return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) =>
  Component => {
    class WrappedComponent extends React.Component {
      render() {
        return (
          <Component
            {...this.props}
            {...mapStateToProps(this.context.store.getState(), this.props)}
            {...mapDispatchToProps(this.context.store.dispatch, this.props)}
          />
        )
      }

      componentDidMount() {
        this.context.store.subscribe(this.handleChange)
      }

      componentDidUpdate() {
        this.context.store.subscribe(this.handleChange)
      }

      handleChange = () => {
        this.forceUpdate()
      }
    }

    WrappedComponent.contextTypes = {
      store: PropTypes.object,
    }

    return WrappedComponent
  }

class Provider extends React.Component {
  getChildContext() {
    return {
      store: this.props.store,
    }
  }
  
  render() {
    return React.Children.only(this.props.children)
  }
}

Provider.childContextTypes = {
  store: PropTypes.object,
}

// APP

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL'

// action creators
const changeInterval = value => ({
  type: CHANGE_INTERVAL,
  payload: value,
})


// reducers
const reducer = (state, action) => {
  switch(action.type) {
    case CHANGE_INTERVAL:
      return state += action.payload
    default:
      return {}
  }
}

// components

class IntervalComponent extends React.Component {
  render() {
    return (
      <div>
        <span>Интервал обновления секундомера: {this.props.currentInterval} сек.</span>
        <span>
          <button onClick={() => this.props.changeInterval(-1)}>-</button>
          <button onClick={() => this.props.changeInterval(1)}>+</button>
        </span>
      </div>
    )
  }
}

const Interval = connect(state => ({
  currentInterval: state,
}),
dispatch => ({
  changeInterval: value => dispatch(changeInterval(value)),
}))(IntervalComponent)

class TimerComponent extends React.Component {
  state = {
    currentTime: 0,
    start: false
  }

  render() {
    return (
      <div>
        <Interval />
        <div>
          Секундомер: {this.state.currentTime} сек.
        </div>
        <div>
          <button disabled={this.state.start} onClick={this.handleStart}>Старт</button>
          <button onClick={this.handleStop}>Стоп</button>
        </div>
      </div>
    )
  }

  handleStart = () => {
    const delay = Math.abs(this.props.currentInterval)*1000
    this.setState({
      start: true
    })
    this.initCount = setTimeout(() => this.setState({
      currentTime: this.state.currentTime + this.props.currentInterval,
    }), delay)
    this.counter = setTimeout(this.handleStart, delay)
  }
  
  handleStop = () => {
      clearTimeout(this.initCount)
      clearTimeout(this.counter)
    this.setState({ currentTime: 0, start: false })
  }
}

const Timer = connect(state => ({
  currentInterval: state,
}), () => {})(TimerComponent)

// init
ReactDOM.render(
  <Provider store={createStore(reducer, 1)}>
    <Timer />
  </Provider>,
  document.getElementById('app')
)
