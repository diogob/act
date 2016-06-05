import main, { spring } from '../../animation'
import styles from './styles.css'
import value from '../../processes/value'
import position from '../../processes/position'
import TraversableAnimationHistory from '../../animation/internals/TraversableAnimationHistory'

let currentSpring
const start = (payload, history) => {
  history.push({type: 'dest', payload})
  currentSpring && currentSpring.stop()

  currentSpring = spring(
    (payload) => history.push({type: 'step', payload}),
    () => console.log('FINISHED')
  )
}

const go = (payload, history) => {
  history.go(payload)
}

let interval
const replay = (payload, history) => {
  let i = 0
  history.go(i++)

  interval && clearInterval(interval)
  interval = setInterval(() => {
    if (i === history.length) return clearInterval(interval)
    history.go(i++)
  }, 1000 / 60)
}

const rewind = (payload, history) => {
  let i = history.length
  history.go(i--)

  interval && clearInterval(interval)
  interval = setInterval(() => {
    if (i === 0) return clearInterval(interval)
    history.go(i--)
  }, 1000 / 60)
}

const view = ({ current }, history) => (
  ['main', [
    ['button', {click: replay}, 'Replay'],
    ['button', {click: rewind}, 'Rewind'],
    ['br'],
    0,
    ['input', {
      style: {width: 100 + history.length},
      input: [go, value],
      type: 'range',
      min: 0,
      value: String(history.present),
      max: history.length,
      step: 1
    }],
    history.length,
    ['br'],
    history.present,
    ['div', { class: [styles, 'box'], click: [start, position] }, 'click in the box'],
    ['div', { class: [styles, 'dot'], style: { left: current[0], top: current[1] } }]
  ]]
)

const reducer = (state = { dest: [0, 0], current: [0, 0] }, { type, payload }) => {
  switch (type) {
    case 'dest':
      return { ...state, dest: payload, previous: state.current }
    case 'step':
      const { previous: [x, y], dest: [x2, y2] } = state
      return { ...state, current: [x + (payload * (x2 - x)), y + (payload * (y2 - y))] }
    default:
      return state
  }
}

main(view, { reducer, historyClass: TraversableAnimationHistory })