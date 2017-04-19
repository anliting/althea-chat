module.exports=(db,args,env)=>{
    if(!(
        typeof args.target=='number'&&
        typeof args.message=='string'
    ))
        return
    return db.newMessage(
        env.currentUser.id,
        args.target,
        args.message
    )
}
