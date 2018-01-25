module.exports=(sv,opt,env)=>{
    if(!(
        opt instanceof Object&&
        typeof opt.target=='number'
    ))
        return
    return sv.getTwoMenConversation(
        env.currentUser.id,
        opt.target
    )
}
