module.exports=async(sv,opt,session)=>{
    if(!(
        typeof opt=='object'&&
        opt&&
        sv.hasListenOn(session)
    ))
        return
    let range={
        start:  opt.start===~~opt.start?opt.start:0,
        end:    opt.end===~~opt.end?opt.end:Infinity,
    }
    if(opt.first===~~opt.first&&0<=opt.first)
        range.first=opt.first
    else if(opt.last===~~opt.last&&0<=opt.last)
        range.last=opt.last
    sv.addListenRange(session,range)
}
