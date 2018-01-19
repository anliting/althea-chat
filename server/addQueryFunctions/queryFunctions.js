module.exports={
    getConversations:  require('./queryFunctions/getConversations'),
    getMessages:       require('./queryFunctions/getMessages'),
    getTwoMenConversation:
                       require('./queryFunctions/getTwoMenConversation'),
    listenMessages:    require('./queryFunctions/listenMessages'),
    listenMessages_addRange:
                       require('./queryFunctions/listenMessages_addRange'),
    sendMessage:       require('./queryFunctions/sendMessage'),
}
