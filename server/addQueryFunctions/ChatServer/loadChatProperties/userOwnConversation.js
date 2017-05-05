module.exports=userOwnConversation
async function userOwnConversation(user,conversation){
    let rows=await this._db.query0(`
        select count(*) from chat_twoMen
        where (?||?)&&?
    `,[
        {userA:user.id},
        {userB:user.id},
        {conversation},
    ])
    return rows[0]['count(*)']
}
