import React from 'react'

const redArrow = require('../images/red-arrow.png')
const greenArrow = require('../images/green-arrow.png')

const SOCKET_URL = 'wss://ws.blockchain.info/inv'
const ws = new WebSocket(SOCKET_URL)

class App extends React.Component {
  state={
    open: false,
    trans: []
  }

  componentDidMount() {
    ws.onopen = () =>
      this.setState({ open: true })
    ws.onmessage = (msg) => {
      this.updateTransState(JSON.parse(msg.data))
    }
  }

  roundToTwo = (num) => {    
    return +(Math.round(num + "e+2")  + "e-2")
  }

  randomNum = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }

  updateTransState = (data) => {
    let value = 0
    let dir = 'out' 
    if (data.x.out.length > 0) {
      value = this.roundToTwo(data.x.out[data.x.out.length -1].value / 100000000)
    } else {
      value = this.roundToTwo(data.x.inputs[0].prev_out.value / 100000000)
      dir = 'in'
    }
    
    if (value !== 0) {
      this.setState({
        trans: [ ...this.state.trans, { value, dir, left: (this.randomNum(0, 200) + 10) }]
      })
    }
  }

  startFeed = () => {
    const { open } = this.state
    if (open) {
      ws.send(JSON.stringify({
        op: 'unconfirmed_sub'
      }))
    } else {
      this.setState({ open: true })
      ws.onopen = () =>
        ws.send(JSON.stringify({
          op: 'unconfirmed_sub'
        }))
    }
  }

  stopFeed = () => {
    ws.send(JSON.stringify({
      op: 'unconfirmed_unsub'
    }))
    ws.close()
  }

  renderBubbles = () => {
    const trans = this.state.trans.map((tran, idx) => {
      return (
        <div className="transaction" key={idx} style={{ left: tran.left }}>
          <img src={tran.dir === 'in' ? greenArrow : redArrow} />
          {tran.value} BTC
        </div>
      )
    })
    return trans
  }

  render () {
    return (
      <div className='container'>
        <h1>Bitcoin Transaction Viewer</h1>
        <div className='controls-container'>
          <button onClick={this.startFeed}>Start</button>
          <button onClick={this.stopFeed}>Stop</button>
        </div>
        <div className="transactions-container">
          {this.state.trans.length > 0 && this.renderBubbles()}
        </div>
      </div>
    )
  }
}

export default App;
