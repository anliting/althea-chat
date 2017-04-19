module.exports=getConversations
async function getConversations(uid){
    let rows=await this.query0(`
        (
            select fromUser
            from chat_message
            where toUser=?
        ) union (
            select toUser
            from chat_message
            where fromUser=?
        )
    `,[
        uid,
        uid,
    ])
    return rows.map(e=>e.fromUser)
}
