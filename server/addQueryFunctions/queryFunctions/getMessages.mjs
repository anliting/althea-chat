export default async(sv,opt,env)=>{
    opt instanceof Object&&
    typeof opt.conversation=='number'&&
    typeof opt.after=='number'&&
    typeof opt.before=='number'&&(
        !('last' in opt)||
        typeof opt.last=='number'
    )||0()
    opt.before||(opt.before=Infinity)
    await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )||0()
    return sv.getMessages(
        opt.conversation,
        opt.after,
        opt.before,
        opt.last
    )
}
