function DecalarativeSet(){
    this.set=new Set
}
DecalarativeSet.prototype.in=function(doc){
    this.set.add(doc)
    if(this._forEach)
        this._forEach.in(doc)
}
DecalarativeSet.prototype.out=function(doc){
    this.set.delete(doc)
    if(this._forEach)
        this._forEach.out(doc)
}
DecalarativeSet.prototype.forEach=function(doc){
    if(this._forEach)
        this.set.forEach(this._forEach.out)
    this._forEach=doc
    if(this._forEach)
        this.set.forEach(this._forEach.in)
}
export default DecalarativeSet
