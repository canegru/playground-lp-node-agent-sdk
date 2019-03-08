import { Agent } from 'node-agent-sdk'
import * as dotenv from 'dotenv'
import * as util from 'util'
import chatMonitor from './chatMonitor'

dotenv.config()

class AgentConnector {
    private agent: Agent
    private getClock: Object
    private chatMonitor: chatMonitor
    private openConversations

    constructor() {
        this.agent = new Agent({
            accountId: process.env.ACCOUNT_ID,
            username: process.env.ACCOUNT_USERNAME,
            password: process.env.ACCOUNT_PASSWORD
        })
        this.openConversations = []
    }
    // ANCHOR  start : entry
    public start(): void {
        this.whenConnected()
        this.conversationChangeNotify()
        this.whenDisconnected()
        this.chatMonitor = new chatMonitor(this.agent, this.openConversations);
    }

    // ANCHOR  whenConnected : called by start
    private whenConnected = async () => {
        this.agent.on('connected', async () => {
            this.agentState('ONLINE')
            this.subscribeConversations('OPEN')
            this.keepConnectionAlive()
        });
    }

    // ANCHOR  whenDisconnected : called by start
    private whenDisconnected = async () => {
        this.agent.on('closed', async () => {
            this.keepConnectionAlive(false)
        });
    }

    // ANCHOR  conversationChangeNotify : called by start
    private conversationChangeNotify = async () => {
        this.agent.on('cqm.ExConversationChangeNotification', (callbackReturn) => this.chatMonitor.ConversationChange(callbackReturn))
    }

    // ANCHOR  agentState
    private agentState(state = 'ONLINE'): void {
        this.agent.setAgentState({
            'availability': state
        })
    }

    // ANCHOR subscribeConversations
    private subscribeConversations(type = 'OPEN'): void {
        this.agent.subscribeExConversations({
            'convState': [type]
        })
    }

    // ANCHOR keepConnectionAlive
    private keepConnectionAlive(state = true): void {
        if (state) {
            this.agent._pingClock = setInterval(this.agent.getClock, 30000);
        } else {
            clearInterval(this.agent._pingClock);
        }
    }

}

export default new AgentConnector()

