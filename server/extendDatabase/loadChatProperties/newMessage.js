module.exports=newMessage
function newMessage(fromUser,toUser,message){
    return this.query0(`
        insert into chat_message set ?
    `,{
        fromUser,
        toUser,
        message
    }).then(a=>a.insertId)
}
