async function getTwoMenConversation(a,b){
    if(b<a)
        [a,b]=[b,a]
    if(this._cache[a]&&this._cache[a][b])
        return this._cache[a][b]
    let rows
    while(
        rows=await selectTwoMenConversation(this._db,a,b),
        rows.length==0
    )
        await insertTwoMenConversation(this._db,a,b)
    let id=rows[0].conversation
    if(!(a in this._cache))
        this._cache[a]={}
    this._cache[a][b]=id
    return id
}
function selectTwoMenConversation(db,a,b){
    return db.query0(`
        select conversation from chat_twoMen where ?&&?
    `,[
        {userA:a},
        {userB:b},
    ])
}
async function insertTwoMenConversation(db,a,b){
    await db.transactionDo(async cn=>{
        let conversationId=(await db.cnQuery0(cn,`
            insert into chat_conversation set type=0
        `)).insertId
        if(a!=b)
            await Promise.all([
                insertUserRoom(db,cn,a,conversationId),
                insertUserRoom(db,cn,b,conversationId),
            ])
        else
            await insertUserRoom(db,cn,a,conversationId)
        await db.cnQuery(cn,`
            insert into chat_twoMen set ?
        `,{
            userA:a,
            userB:b,
            conversation:conversationId,
        })
    })
}
async function insertUserRoom(db,cn,user,room){
    await db.cnQuery(cn,`
        insert into chat_userRoom set ?
    `,{user,room})
}
module.exports=getTwoMenConversation
