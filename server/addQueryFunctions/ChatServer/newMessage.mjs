async function newMessage(fromUser,conversation,message){
    return(await this._db.query0(`
        insert into chat_message set ?
    `,{
        fromUser,
        conversation,
        message
    })).insertId
}
export default newMessage
