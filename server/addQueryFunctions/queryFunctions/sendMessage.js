module.exports=async(sv,opt,env)=>{
    opt instanceof Object&&
    typeof opt.conversation=='number'&&
    typeof opt.message=='string'&&
    await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )||0()
    return sv.newMessage(
        env.currentUser.id,
        opt.conversation,
        opt.message
    )
}
