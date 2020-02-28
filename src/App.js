import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Anchor } from 'ual-anchor'
import { UALProvider, withUAL } from 'ual-reactjs-renderer'

const chains = [{
  chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  name: 'Jungle 2 (Testnet)',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'jungle.greymass.com',
    port: 443,
  }]
},{
  chainId: '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840',
  name: 'Jungle 3 (Testnet)',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'jungle3.greymass.com',
    port: 443,
  }]
},{
  chainId: 'f11d5128e07177823924a07df63bf59fbd07e52c44bc77d16acc1c6e9d22d37b',
  name: 'Lynx (Testnet)',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'lynxtestnet.greymass.com',
    port: 443,
  }]
},{
  chainId: '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
  name: 'Telos (Testnet)',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'testnet.eos.miami',
    port: 443,
  }]
},{
  chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
  name: 'WAX (Testnet)',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'waxtestnet.greymass.com',
    port: 443,
  }]
}];

const getTransaction = (account, chainId) => {
  return {
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{ actor: account, permission: 'active' }],
      data: {
        from: account,
        to: 'teamgreymass',
        quantity: getTransactionAmount(chainId),
        memo: 'ual-anchor-demo'
      },
    }],
  }
}

const getTransactionAmount = (chainId) => {
  let symbol = 'EOS'
  let quantity = '0.0001'
  switch (chainId) {
    case 'f11d5128e07177823924a07df63bf59fbd07e52c44bc77d16acc1c6e9d22d37b': {
      symbol = 'LNX'
      quantity = '0.00000001'
      break
    }
    case '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f': {
      symbol = 'TLOS'
      break
    }
    case 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12': {
      symbol = 'WAX'
      quantity = '0.00000001'
      break
    }
  }
  return `${quantity} ${symbol}`
}

class TestApp extends Component {
  static propTypes = {
    ual: PropTypes.shape({
      activeUser: PropTypes.object,
      activeAuthenticator: PropTypes.object,
      logout: PropTypes.func,
      showModal: PropTypes.func,
    }).isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      chainId: props.chainId,
      message: '',
    }
  }

  purchase = async () => {
    const { ual: { activeUser } } = this.props
    try {
      const accountName = await activeUser.getAccountName()
      const demoTransaction = getTransaction(accountName, await activeUser.getChainId())
      const result = await activeUser.signTransaction(demoTransaction, { expireSeconds: 120, blocksBehind: 3 })
      this.setState({
        message: `Transfer Successful!`,
      }, () => {
        setTimeout(this.resetMessage, 5000)
      })
      console.info('SUCCESS:', result)
    } catch (e) {
      console.error('ERROR:', e)
    }
  }

  resetMessage = () => this.setState({ message: '' })

  renderLoggedInView = () => (
    <>
      {!!this.state.message
        && (
          <div style={styles.announcementBar}>
            <p style={styles.baseText}>{this.state.message}</p>
          </div>
        )
      }
      <table>
        <tbody>
          <tr>
            <td style={styles.td}>Blockchain</td>
            <td style={styles.td}>{this.props.ual.chains[0].name}</td>
          </tr>
          <tr>
            <td style={styles.td}>Account</td>
            <td style={styles.td}>{this.props.ual.activeUser.accountName}</td>
          </tr>
          <tr>
            <td style={styles.td}>Permission</td>
            <td style={styles.td}>{this.props.ual.activeUser.requestPermission}</td>
          </tr>
        </tbody>
      </table>
      <p>Actions:</p>
      <button type='button' onClick={this.purchase} style={{ ...styles.button, ...styles.blueBG }}>
        <p style={styles.baseText}>{`Transfer 0.0001`}</p>
      </button>
      <button type='button' onClick={this.props.ual.logout} style={styles.logout}>
        <p>Logout</p>
      </button>
    </>
  )

  renderLoginButton = () => (
    <button type='button' onClick={this.props.ual.showModal} style={styles.button}>
      <p style={{buttonText: styles.buttonText, baseText: styles.baseText}}>Login using {this.props.ual.chains[0].name}</p>
    </button>
  )

  render() {
    const { ual: { activeUser } } = this.props
    return (activeUser) ? this.renderLoggedInView() : this.renderLoginButton()
  }
}

class UALWrapper extends Component {
  constructor(props) {
    super(props)
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const chainId = params.get('chain');
    this.state = {
      chainId: chainId || chains[0].chainId
    }
  }
  setChain = (event) => this.setState({ chainId: event.target.value })
  render () {
    const { chainId } = this.state
    const { available } = this.props
    const [ chain ] = available.filter((c) => c.chainId === chainId)
    if (!chain) {
      return (
        <div>Invalid Chain ID</div>
      )
    }
    const anchor = new Anchor([chain], { appName: 'ual-anchor-demo' })
    return (
      <div style={styles.container}>
        <p>
          <select
            defaultValue={chainId}
            onChange={this.setChain}
            style={styles.select}
          >
            {chains.map((chain) => (
              <option
                key={chain.chainId}
                value={chain.chainId}
              >
                {chain.name}
              </option>
            ))}
          </select>
        </p>
        <UALProvider
          appName='Anchor + Authenticator Test App'
          authenticators={[anchor]}
          chains={[chain]}
          key={chain.chainId}
        >
          <TestAppConsumer />
        </UALProvider>
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    flexDirection: 'column',
  },
  button: {
    padding: '10px 60px',
    backgroundColor: '#EA2E2E',
    textAlign: 'center',
    borderRadius: 5,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  select: {
    textAlign: 'center',
    borderRadius: 5,
    fontSize: 24,
    fontWeight: 'bold',
    width: '200px',
  },
  logout: {
    marginTop: 20,
  },
  baseText: {
    color: '#fff',
    fontSize: 18,
  },
  blueBG: {
    backgroundColor: '#447DD8',
  },
  announcementBar: {
    width: '100%',
    padding: '10px 50px 10px 20px',
    textAlign: 'center',
    backgroundColor: '#3de13d',
    top: 0,
    position: 'absolute',
    alignItems: 'center',
  },
}

const TestAppConsumer = withUAL(TestApp)

const App = () => (
  <UALWrapper available={chains} />
)

export default App
