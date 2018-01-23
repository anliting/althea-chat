module.exports=(sv,opt,env)=>{
    if(!(
        typeof opt=='object'&&
        opt&&
        typeof opt.target=='number'
    ))
        return
    return sv.getTwoMenConversation(
        env.currentUser.id,
        opt.target
    )
}
