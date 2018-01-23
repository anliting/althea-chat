module.exports=async(sv,opt,env)=>{
    if(!(
        typeof opt=='object'&&
        opt&&
        typeof opt.conversation=='number'&&
        typeof opt.after=='number'&&
        typeof opt.before=='number'&&(
            !('last' in opt)||
            typeof opt.last=='number'
        )
    ))
        return
    opt.before||(opt.before=Infinity)
    if(!(await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )))
        return
    return sv.getMessages(
        opt.conversation,
        opt.after,
        opt.before,
        opt.last
    )
}
