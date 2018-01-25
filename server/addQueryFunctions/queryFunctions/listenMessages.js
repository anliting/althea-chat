module.exports=async(sv,opt,env)=>{
    if(!(
        opt instanceof Object&&
        typeof opt.conversation=='number'&&
        await sv.userOwnConversation(
            env.currentUser,
            opt.conversation
        )&&
        !sv.hasListenOn(env)
    ))
        return
    let a=sv.listenMessages(
        env,
        opt.conversation,
        res=>{
            if(1<env.wsConnection.readyState)
                return sv.clearListenMessages(a)
            env.sendValue({
                function:'pushMessages',
                value:res,
            })
        },
    )
    env.sendValue({function:'listenStarted'})
}
