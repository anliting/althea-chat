module.exports=async(sv,args,env)=>{
    if(!(
        typeof args.conversation=='number'&&
        typeof args.message=='string'
    ))
        return
    if(!(await sv.userOwnConversation(
        env.currentUser,
        args.conversation
    )))
        return
    return sv.newMessage(
        env.currentUser.id,
        args.conversation,
        args.message
    )
}
