import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Anchor } from 'ual-anchor'
import { Ledger } from 'ual-ledger'
import { Scatter } from 'ual-scatter'
import { UALProvider, withUAL } from 'ual-reactjs-renderer'

const chains = [{
  chainId: '0db13ab9b321c37c0ba8481cb4681c2788b622c3abfd1f12f0e5353d44ba6e72',
  name: 'Block.one Testnet',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'api.testnet.eos.io',
    port: 443,
  }]
},{
  chainId: 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e',
  name: 'FIO (Testnet)',
  rpcEndpoints: [{
    protocol: 'https',
    host: 'fiotestnet.greymass.com',
    port: 443,
  }]
},{
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
}]

const getActionData = (actor, permission, chainId) => {
  // default data
  let data = {
    from: actor,
    to: 'teamgreymass',
    quantity: getTransactionAmount(chainId),
    memo: 'ual-anchor-demo'
  }
  switch (chainId) {
    case '0db13ab9b321c37c0ba8481cb4681c2788b622c3abfd1f12f0e5353d44ba6e72': {
      data = {
        from: actor,
        to: 'csxdbqrkklmm',
        quantity: getTransactionAmount(chainId),
        memo: 'ual-anchor-demo'
      }
      break
    }
    case 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e': {
      data = {
        payee_public_key: 'FIO6smr7ThQMWYBHzEvkzTZdxNNmUwxqh2VXdXZdDdzYHgakgqCeb',
        amount: getTransactionAmount(chainId),
        max_fee: 2000000000,
        actor,
        tpid: null,
      }
      break
    }
  }
  return data
}

const getContractData = (chainId) => {
  // default contract/action
  let account = 'eosio.token'
  let name = 'transfer'
  switch (chainId) {
    case 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e': {
      account = 'fio.token'
      name = 'trnsfiopubky'
      break
    }
  }
  return { account, name }
}

const getActions = (actor, permission, chainId) => {
  const { account, name } = getContractData(chainId)
  const data = getActionData(actor, permission, chainId)
  return {
    actions: [
      {
        account,
        name,
        authorization: [{ actor, permission }],
        data,
      }
    ],
  }
}

const getTransaction = async (activeUser, actor, permission, chainId) => {
  const { account, name } = getContractData(chainId)
  const data = getActionData(actor, permission, chainId)
  const actions = [{
    account,
    name,
    authorization: [{ actor, permission }],
    data,
  }]
  const info = await activeUser.rpc.get_info()
  const height = info.last_irreversible_block_num - 3
  const blockInfo = await activeUser.rpc.get_block(height)
  const timePlus = new Date().getTime() + (60 * 1000)
  const timeInISOString = (new Date(timePlus)).toISOString()
  const expiration = timeInISOString.substr(0, timeInISOString.length - 1)
  return {
    actions,
    context_free_actions: [],
    transaction_extensions: [],
    expiration,
    ref_block_num: blockInfo.block_num & 0xffff,
    ref_block_prefix: blockInfo.ref_block_prefix,
    max_cpu_usage_ms: 0,
    max_net_usage_words: 0,
    delay_sec: 0,
  }
}

const getTransactionAmount = (chainId) => {
  let symbol = 'EOS'
  let quantity = '0.0001'
  switch (chainId) {
    case '0db13ab9b321c37c0ba8481cb4681c2788b622c3abfd1f12f0e5353d44ba6e72': {
      symbol = 'TNT'
      break
    }
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
    case 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e': {
      return parseInt(0.00000001, 10)
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
      const { accountName, chainId } = activeUser
      let { requestPermission } = activeUser
      if (!requestPermission && activeUser.scatter) {
        requestPermission = activeUser.scatter.identity.accounts[0].authority
      }
      const demoActions = getActions(accountName, requestPermission, chainId)
      const result = await activeUser.signTransaction(demoActions, { expireSeconds: 120, blocksBehind: 3 })
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
      <button type='button' onClick={this.purchase} style={{ ...styles.button, ...styles.blueBG }}>
        <p style={styles.baseText}>{`Transfer 0.0001`}</p>
      </button>
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
    const search = window.location.search
    const params = new URLSearchParams(search)
    const chainId = params.get('chain')
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
    const anchor = new Anchor([chain], {
      // Required: The name of the app requesting a session
      appName: 'ual-anchor-demo',
      // Optional: define your own endpoint or eosjs JsonRpc client
      // rpc: new JsonRpc('https://jungle.greymass.com'),
      // Optional: define API for session management, defaults to cb.anchor.link
      service: 'https://cb.anchor.link'
    })
    const ledger = new Ledger([chain])
    const scatter = new Scatter([chain], { appName: 'ual-anchor-demo' })
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
          authenticators={[anchor, ledger, scatter]}
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
    justifyContent: 'top',
    height: '100vh',
    marginTop: '10vh',
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
    marginBottom: '2em',
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
