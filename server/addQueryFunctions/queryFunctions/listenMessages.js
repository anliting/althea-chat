module.exports=async(sv,opt,env)=>{
    if(!(
        typeof opt.conversation=='number'&&
        typeof opt.after=='number'&&(
            !('last' in opt)||
            typeof opt.last=='number'
        )
    ))
        return
    if(!(await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )))
        return
    return sv.getMessages(
        opt.conversation,
        opt.after,
        Infinity,
        opt.last
    )
}
