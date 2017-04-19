module.exports=(db,opt,env)=>
    env.althea.database.getConversations(
        env.currentUser.id
    )
