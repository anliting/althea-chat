module.exports=async(sv,opt,env)=>{
    if(!(
        typeof opt.conversation=='number'&&
        typeof opt.after=='number'&&
        await sv.userOwnConversation(
            env.currentUser,
            opt.conversation
        )
    ))
        return
    let a=sv.listenMessages(
        env,
        opt.conversation,
        res=>{
            if(1<env.wsConnection.readyState)
                return sv.clearListenMessages(a)
            env.sendValue(res)
        },
    )
    sv.addListenRange(env,{
        start:opt.after,
        end:Infinity,
    })
}
