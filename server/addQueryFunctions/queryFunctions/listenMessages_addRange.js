module.exports=async(sv,opt,env)=>{
    if(!(
        typeof opt.conversation=='number'&&
        typeof opt.start=='number'&&
        typeof opt.end=='number'&&
        typeof opt.first=='number'&&
        typeof opt.last=='number'&&
        await sv.userOwnConversation(
            env.currentUser,
            opt.conversation
        )
    ))
        return
}
