module.exports=async(sv,opt,env)=>{
    opt instanceof Object&&
    typeof opt.conversation=='number'&&
    await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )&&
    !sv.hasListenOn(env)||0()
    let a=sv.listenMessages(
        env,
        opt.conversation,
        res=>{
            if(1<env.wsConnection.readyState)
                return
            env.sendValue({
                function:'pushMessages',
                value:res,
            })
        },
    )
    env.wsConnection.on('close',()=>{
        sv.clearListenMessages(a)
    })
    env.sendValue({function:'listenStarted'})
}
