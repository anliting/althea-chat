module.exports=(db,args,env)=>{
    if(!(
        typeof args=='object'&&
        typeof args.target=='number'
    ))
        return
    return db.getTwoMenConversation(
        env.currentUser.id,
        args.target
    )
}
