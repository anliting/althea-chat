module.exports=userOwnConversation
async function userOwnConversation(user,conversation){
    let rows=await this._db.query0(`
        select count(*)
        from chat_userRoom
        where ?&&?
    `,[
        {user},
        {room:conversation},
    ])
    return rows[0]['count(*)']
}
