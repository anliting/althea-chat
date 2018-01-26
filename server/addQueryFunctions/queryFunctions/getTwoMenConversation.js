module.exports=(sv,opt,env)=>{
    opt instanceof Object&&
    typeof opt.target=='number'||0()
    return sv.getTwoMenConversation(
        env.currentUser.id,
        opt.target
    )
}
