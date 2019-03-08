import * as _ from 'lodash'
import jsonFile from 'write-json-file'
import * as path from 'path'

const debugFilePath = path.resolve(__dirname, '../../debug')

class chatMonitor {
    public agent
    private openConversations

    constructor(agent, openConversations) {
        this.agent = agent;
        this.openConversations = openConversations
    }

    public ConversationChange = async (data) => {
        const changes = _.get(data, 'changes', [])
        changes.map(async (change) => {
            const type = _.get(change, 'type', 'typeUnknown')
            const result = _.get(change, 'result', {})
            const convId = _.get(result, 'convId', 'convIdUnknown')
            const convDetails = _.get(result, 'conversationDetails', 'convIdUnknown')
            const isConversationOpen = this.getParticipantInfo(convDetails, this.agent.agentId)
            if ((type === 'UPSERT')) {
                //const consumerID = change.result.conversationDetails.participants.filter(participant => participant.role === 'CONSUMER')[0].id
                //console.log(consumerID)
                /*
                this.agent.getUserProfile(consumerID, (data) => {
                    console.log(data)
                })*/
                this.agent.getUserProfile(change.result.conversationDetails.participants.filter(p => p.role === 'CONSUMER')[0].id, (error, userProfileData) => console.log(userProfileData))
                if (isConversationOpen === undefined) {
                    console.log('xxxxxx')
                    try {
                        jsonFile(`${debugFilePath}/${convId}.json`, convDetails)
                    }
                    catch (e) {
                        console.log(e);
                    }
                    this.openConversations[convId] = result
                    this.agent.updateConversationField({
                        'conversationId': convId,
                        'conversationField': [{
                            'field': 'ParticipantsChange',
                            'type': 'ADD',
                            'role': 'MANAGER'
                        }]
                    }, () => {
                        this.agent.publishEvent({
                            dialogId: convId,
                            event: {
                                type: 'ContentEvent',
                                contentType: 'text/plain',
                                message: 'Hi there, my name is Hippobotamus. Have a wonderful day. I\'m just here testing.'
                            }
                        }, () => {
                            this.agent.unsubscribeExConversations()
                        });
                    });
                }
            } else if (type === 'DELETE') {
                delete this.openConversations[convId];
                console.log(`conversation ${convId} was closed`);
            }
        })
    }

    private getParticipantInfo = (convDetails, participantId) => {
        return convDetails.participants.filter(p => p.id === participantId)[0];
    }

    private test = (conversationId) => {
        this.agent.updateConversationField({
            'conversationId': conversationId,
            'conversationField': [{
                'field': 'ParticipantsChange',
                'type': 'ADD',
                'role': 'MANAGER'
            }]
        }, () => {
            this.agent.publishEvent({
                dialogId: conversationId,
                event: {
                    type: 'ContentEvent',
                    contentType: 'text/plain',
                    message: 'welcome from bot'
                }
            });
        });
    }

}

export default chatMonitor
