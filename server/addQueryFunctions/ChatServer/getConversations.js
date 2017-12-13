module.exports=getConversations
async function getConversations(uid){
    let rows=await this._db.query0(`
        (
            select userA
            from chat_twoMen
            where userB=?
        ) union (
            select userB
            from chat_twoMen
            where userA=?
        )
    `,[
        uid,
        uid,
    ])
    return rows.map(e=>e.userA)
}
