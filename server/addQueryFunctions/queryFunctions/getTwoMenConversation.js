module.exports=(sv,args,env)=>{
    if(!(
        typeof args=='object'&&
        typeof args.target=='number'
    ))
        return
    return sv.getTwoMenConversation(
        env.currentUser.id,
        args.target
    )
}
