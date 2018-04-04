export default{
    0:async db=>{
        await Promise.all([
            db.query(`
                create table chat_conversation (
                    id int not null auto_increment,
                    primary key (id)
                )
            `),
            db.query(`
                create table chat_message (
                    id int not null auto_increment,
                    timestamp timestamp not null default current_timestamp,
                    fromUser int not null,
                    toUser int not null,
                    message text not null,
                    primary key (id)
                )
            `),
        ])
        return 2
    },
    1:async db=>{
        await Promise.all([
            db.query(`
                rename table message to chat_message
            `),
            db.query(`
                create table chat_conversation (
                    id int not null auto_increment,
                    primary key (id)
                )
            `),
        ])
        return 2
    },
    2:async db=>{
        await db.query(`
            alter table chat_conversation
            add column type int not null
        `)
        await db.query(`
            alter table chat_message
            add column conversation int not null
        `)
        await db.query(`
            create table chat_twoMen (
                userA int not null,
                userB int not null,
                conversation int not null,
                unique key (userA,userB)
            )
        `)
        {
            let twoMen={}
            let rows=await db.query0(`
                select distinct fromUser,toUser from chat_message
            `)
            await Promise.all(rows.map(async r=>{
                let a=r.fromUser,b=r.toUser
                if(b<a)
                    [a,b]=[b,a]
                if(twoMen[a]&&twoMen[a][b])
                    return
                if(!twoMen[a])
                    twoMen[a]={}
                twoMen[a][b]=1
                let id=(await db.query0(`
                    insert into chat_conversation set type=0
                `)).insertId
                await db.query(`
                    insert into chat_twoMen set ?
                `,{
                    userA:a,
                    userB:b,
                    conversation:id,
                })
                await db.query(`
                    update chat_message set ? where ?&&?||?&&?
                `,[
                    {conversation:id},
                    {fromUser:a},
                    {toUser:b},
                    {fromUser:b},
                    {toUser:a},
                ])
            }))
        }
        await db.query(`
            alter table chat_message
            drop column toUser
        `)
        return 3
    },
    3:async db=>{
        await db.query(`
            create table chat_userRoom (
                user int not null,
                room int not null,
                unique key (user,room)
            )
        `)
        {
            let res=await db.query0(`
                select userA,userB,conversation from chat_twoMen
            `)
            await Promise.all(res.map(async row=>{
                await insertUserRoom(db,row.userA,row.conversation)
                if(row.userA!=row.userB)
                    await insertUserRoom(db,row.userB,row.conversation)
            }))
        }
        return 4
        async function insertUserRoom(db,user,room){
            await db.query(`
                insert into chat_userRoom set ?
            `,{user,room})
        }
    },
}
