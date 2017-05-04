module.exports=(sv,args,env)=>{
    if(!(
        typeof args.target=='number'&&
        typeof args.message=='string'
    ))
        return
    return sv.newMessage(
        env.currentUser.id,
        args.target,
        args.message
    )
}
