module.exports=(opt,env)=>
    env.althea.database.getConversations(
        env.currentUser.id
    )
