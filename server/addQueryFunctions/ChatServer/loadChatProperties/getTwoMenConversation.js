async function getTwoMenConversation(a,b){
    if(b<a)
        [a,b]=[b,a]
    if(this._cache[a]&&this._cache[a][b])
        return this._cache[a][b]
    let rows=await selectTwoMenConversation(this._db,a,b)
    if(rows.length==0){
        await insertTwoMenConversation(this._db,a,b)
        rows=await selectTwoMenConversation(this._db,a,b)
    }
    let id=rows[0].conversation
    setCache.call(this,a,b,id)
    return id
}
function setCache(a,b,id){
    if(!(a in this._cache))
        this._cache[a]={}
    this._cache[a][b]=id
}
function selectTwoMenConversation(db,a,b){
    return db.query0(`
        select conversation from chat_twoMen where ?&&?
    `,[
        {userA:a},
        {userB:b},
    ])
}
function insertTwoMenConversation(db,a,b){
    return db.transactionDo(async cn=>{
        let conversationId=(await db.cnQuery0(cn,`
            insert into chat_conversation set type=0
        `)).insertId
        await db.cnQuery(cn,`
            insert into chat_twoMen set ?
        `,{
            userA:a,
            userB:b,
            conversation:conversationId,
        })
    })
}
module.exports=getTwoMenConversation
