function StyleManager(){
    this._style=[]
}
StyleManager.prototype.insert=function(content){
    let s={content}
    if(this._forEach)
        s.rollback=this._forEach(s.content)
    this._style.push(s)
    return this._style.length-1
}
StyleManager.prototype.remove=function(id){
    let s=this._style[id]
    if(this._forEach)
        s.rollback()
    this._style.splice(id,1)
}
Object.defineProperty(StyleManager.prototype,'forEach',{set(forEach){
    this._forEach=forEach
    this._style.map(forEach?
        s=>s.rollback=forEach(s.content)
    :
        s=>s.rollback()
    )
},get(){
    return this._forEach
}})
StyleManager
