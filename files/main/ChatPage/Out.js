function Out(){
    this.set=new Set
}
Out.prototype.in=function(doc){
    this.set.add(doc)
    if(this._forEach)
        this._forEach.in(doc)
}
Out.prototype.out=function(doc){
    this.set.delete(doc)
    if(this._forEach)
        this._forEach.out(doc)
}
Out.prototype.forEach=function(doc){
    if(this._forEach)
        this.set.forEach(this._forEach.out)
    this._forEach=doc
    if(this._forEach)
        this.set.forEach(this._forEach.in)
}
export default Out
