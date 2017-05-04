module.exports={
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
            alter table chat_conversation add column type int not null
        `)
        await db.query(`
            alter table chat_message add column conversation int not null
        `)
        await db.query(`
            create table chat_twoMen (
                userA int not null,
                userB int not null,
                conversation int not null,
                unique key (userA,userB)
            )
        `)
        return 3
    },
}
