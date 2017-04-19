module.exports=getMessages
async function getMessages(userA,userB,after,before,last){
    let rows=await this.query0(`
        select
            id,
            timestamp,
            fromUser,
            message
        from chat_message
        where (?&&?||?&&?) && ?<=id ${
            before<Infinity?
                ` && id < ${before} `
            :
                ''
        }
        ${
            last!=undefined?
                ` order by id desc limit ${last} `
            :
                ''
        }
    `,[
        {fromUser:userA},
        {toUser:userB},
        {fromUser:userB},
        {toUser:userA},
        after
    ])
    return rows.map(row=>({
        id:row.id,
        timestamp:row.timestamp,
        fromUser:row.fromUser,
        message:row.message,
    }))
}
