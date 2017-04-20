module.exports=db=>{
    db.getConversations=
        require('./loadChatProperties/getConversations')
    db.getMessages=
        require('./loadChatProperties/getMessages')
    db.newMessage=
        require('./loadChatProperties/newMessage')
}
