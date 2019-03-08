

const ConversationChange = (agent, notificationBody) => {
    this.agent = agent
    if (Object.prototype.hasOwnProperty.call(notificationBody, 'changes')) {
        const { changes } = notificationBody
        console.log(notificationBody.changes.length)
        console.log('===============================')
        changes.map((change) => {
            const { type, result } = change
            console.log(change.result.conversationDetails.participants)
        })
    }
}

export default ConversationChange