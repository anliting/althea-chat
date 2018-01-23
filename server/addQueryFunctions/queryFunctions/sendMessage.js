module.exports=async(sv,opt,env)=>{
    if(!(
        typeof opt=='object'&&
        opt&&
        typeof opt.conversation=='number'&&
        typeof opt.message=='string'
    ))
        return
    if(!(await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )))
        return
    return sv.newMessage(
        env.currentUser.id,
        opt.conversation,
        opt.message
    )
}
