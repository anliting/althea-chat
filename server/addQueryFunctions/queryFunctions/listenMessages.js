module.exports=(sv,opt,env)=>{
    if(!(
        typeof opt.conversation=='number'&&
        typeof opt.after=='number'
    ))
        return
    if(!(await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )))
        return
    let a=sv.listenMessages(
        opt.conversation,
        opt.after,
        res=>{
            if(1<env.wsConnection.readyState)
                return sv.clearListenMessages(a)
            env.sendValue(res)
        },
    )
}
