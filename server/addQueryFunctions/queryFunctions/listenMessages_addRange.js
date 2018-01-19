module.exports=async(sv,opt,env)=>{
    if(!(
        typeof opt.conversation=='number'&&
        await sv.userOwnConversation(
            env.currentUser,
            opt.conversation
        )
    ))
        return
}
