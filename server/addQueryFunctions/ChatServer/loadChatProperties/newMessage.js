module.exports=newMessage
function newMessage(fromUser,conversation,message){
    return this._db.query0(`
        insert into chat_message set ?
    `,{
        fromUser,
        conversation,
        message
    }).then(a=>a.insertId)
}
