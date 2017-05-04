module.exports=newMessage
function newMessage(fromUser,toUser,message){
    return this._db.query0(`
        insert into chat_message set ?
    `,{
        fromUser,
        toUser,
        message
    }).then(a=>a.insertId)
}
