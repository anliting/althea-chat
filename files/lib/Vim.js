/*© An-Li Ting (anliting.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/function EventEmmiter(){
    this._listeners={};
}
EventEmmiter.prototype._keyExist=function(key){
    return key in this._listeners
};
EventEmmiter.prototype._ensureKeyExist=function(key){
    if(!(key in this._listeners))
        this._listeners[key]=new Map;
};
EventEmmiter.prototype.emit=function(key,event){
    if(!this._keyExist(key))
        return
    for(let[listener,doc]of[...this._listeners[key].entries()]){
        if(doc.once)
            this.off(key,listener);
        listener(event);
    }
};
EventEmmiter.prototype.off=function(key,listener){
    if(!this._keyExist(key))
        return
    this._listeners[key].delete(listener);
};
EventEmmiter.prototype.on=function(key,listener){
    this._ensureKeyExist(key);
    this._listeners[key].set(listener,{once:false});
};
EventEmmiter.prototype.once=function(key,listener){
    this._ensureKeyExist(key);
    this._listeners[key].set(listener,{once:true});
};

var _welcomeText = `\
                     Web Vim

Thanks Bram Moolenaar et al. for the original Vim!

             type :q<Enter> to exit            
`;

var lc = s=>{
    let
        l=s.split('\n').length-1,
        c=s.length;
    return `${l}L, ${c}C`
};

function _write(){
    let p=this._registers['%'];
    this.write&&this.write(p);
    return `${p?`"${p}"`:'[Event-Only]'} ${lc(this._text)} written`
}

function _edit(p){
    let read=this.read(p);
    this._registers['%']=p;
    if(read==undefined){
        this.text='';
        return `"${p}" [New File]`
    }else{
        this.text=read;
        return `"${p}" ${lc(read)}`
    }
}

function Cursor(set,get){
    this._position=0;
    Object.defineProperty(this,'string',{set,get});
}
Object.defineProperty(Cursor.prototype,'backspace',{get(){
    if(this._position<1)
        return
    this.string=
        this.string.substring(0,this._position-1)+
        this.string.substring(this._position);
    this._position--;
}});
Object.defineProperty(Cursor.prototype,'delete',{get(){
    if(this._position==this.string.length)
        return
    this.string=
        this.string.substring(0,this._position)+
        this.string.substring(this._position+1);
}});
Object.defineProperty(Cursor.prototype,'end',{get(){
    this._position=this.string.length;
}});
Object.defineProperty(Cursor.prototype,'home',{get(){
    this._position=0;
}});
Object.defineProperty(Cursor.prototype,'position',{set(v){
    this._position=Math.min(this.string.length,Math.max(0,v));
},get(){
    return this._position
}});

var _mode = {
    set(val){
        this._viewChanged.mode=true;
        this._modeData={};
        let abs=this._cursor.abs;
        if(val=='insert'){
            this._welcomeText=undefined;
        }
        if(val=='visual'){
            this._modeData.cursor=this._cursor.abs;
            this._welcomeText=undefined;
        }
        if(val=='cmdline'){
            this._modeData.inputBuffer='';
            this._modeData.cursor=new Cursor(v=>
                this._modeData.inputBuffer=v
            ,()=>
                this._modeData.inputBuffer
            );
        }
        this._values.mode=val;
        if(abs)
            this._cursor.moveTo(abs);
    },get(){
        return this._values.mode
    }
};

var _text = {
    set(val){
        let set=val=>{
            if(typeof val=='string'){
                this._values.text=val;
            }else if(typeof val=='object'){
                let txt=this._values.text;
                if(val.function=='insert')
                    this._values.text=
                        txt.substring(0,val.position)+
                        val.string+
                        txt.substring(val.position);
                else if(val.function=='delete')
                    this._values.text=
                        txt.substring(0,val.start)+
                        txt.substring(val.end);
                else if(val.function=='replace'){
                    this._text={
                        function:'delete',
                        start:val.start,
                        end:val.end,
                    };
                    this._text={
                        function:'insert',
                        position:val.start,
                        string:val.string,
                    };
                    return
                }
            }
            this._viewChanged.text=this._viewChanged.text||[];
            this._viewChanged.text.push(val);
        };
        set(val);
        if(/[^\n]$/.test(this._values.text))set({
            function:'insert',
            position:this._values.text.length,
            string:'\n',
        });
    },get(){
        return this._values.text
    }
};

var loadBase = o=>{
    o._quit=function(){
        this.emit('quit');
    };
    Object.defineProperty(o,'_trueText',{set(val){
        if(this._text=='')
            this._text='\n';
        this._text=val;
    },get(){
        return this._values.text||'\n'
    }});
    o._ui=function(){
        this._uis.forEach(ui=>
            ui._updateByVim(this._viewChanged)
        );
        this._viewChanged={};
    };
    o._read=function(path){
        return this.read&&this.read(path)
    };
    Object.defineProperty(o,'_mode',_mode);
    Object.defineProperty(o,'_text',_text);
    o._write=_write;
    o._edit=_edit;
    o._welcomeText=_welcomeText;
    o._setOption=function(key,value){
        this._options[key]=value;
        this._viewChanged.options=this._viewChanged.options||{};
        this._viewChanged.options[key]=null;
    };
    o._setRegister=function(key,value){
        this._registers[key]=value;
        if(key=='+')
            this.copy&&this.copy(value.string);
    };
    Object.defineProperty(o,'_mainUi',{get(){
        if(!this._values._mainUi){
            this._values._mainUi=this.ui;
            this._values._mainUi.width=80;
            this._values._mainUi.height=24;
        }
        return this._values._mainUi
    }});
};

var docs = {
    a:{
        acceptable:true
    },
    ac:{
        acceptable:true,
        complete:true,
    },
    acc:{
        acceptable:true,
        complete:true,
        changed:true,
    }
};

function A(vim){
    vim._mode='insert';
    vim._trueCursor.moveToEOL();
    return docs.ac
}
function B(vim,cmd,arg){
    return {
        function:'B',
        count:arg,
    }
}
function D(vim,cmd,arg){
    return {
        function:'D',
        count:arg||1,
        register:'"',
    }
}
function E(vim,cmd,arg){
    return {
        function:'E',
        count:arg,
    }
}
function G(vim,cmd,arg){
    return {
        function:'G',
        count:arg,
    }
}
function I(vim,cmd,arg){
    vim._mode='insert';
    vim._trueCursor.moveTo(vim._trueCursor.lineStart);
    return docs.ac
}
function O(vim,cmd,arg){
    return {function:'O'}
}
function P(vim,cmd,arg){
    return {
        function:'P',
        count:arg||1,
        register:'"',
    }
}
function W(vim,cmd,arg){
    return {
        function:'W',
        count:arg,
    }
}
function X(vim,cmd,arg){
    return {
        function:'X',
        count:arg||1,
        register:'"'
    }
}
function a(vim,cmd,arg){
    return {function:'a'}
}
function b(vim,cmd,arg){
    return {
        function:'b',
        count:arg,
    }
}
function d(vim,cmd,arg){
    if(cmd=='')
        return docs.a
    if(cmd=='d')
        return {
            function:'dd',
            count:arg||1,
            register:'"',
        }
}
function e(vim,cmd,arg){
    return {
        function:'e',
        count:arg,
    }
}
function g(vim,cmd,arg){
    if(cmd=='')
        return docs.a
    if(cmd=='g')
        return {
            function:'gg',
            count:arg,
        }
}
function h(vim,cmd,arg){
    return {
        function:'h',
        count:arg,
    }
}
function i(vim,cmd,arg){
    vim._mode='insert';
    return docs.ac
}
function j(vim,cmd,arg){
    return {
        function:'j',
        count:arg,
    }
}
function k(vim,cmd,arg){
    return {
        function:'k',
        count:arg,
    }
}
function l(vim,cmd,arg){
    return {
        function:'l',
        count:arg,
    }
}
function n(vim,cmd,arg){
    //vim.gotoNextMatch()
    return docs.ac
}
function o(vim,cmd,arg){
    return {function:'o'}
}
function p(vim,cmd,arg){
    return {
        function:'p',
        count:arg||1,
        register:'"',
    }
}
function r(vim,cmd,arg){
    if(cmd=='')
        return docs.a
    if(vim._text){
        let c=vim._trueCursor.abs;
        vim._text=vim._text.substring(0,c)+cmd+vim._text.substring(c+1);
    }
    return docs.acc
}
function u(vim,cmd,arg){
    let s=vim._undoBranchManager.gotoPrevious();
    if(s!=undefined)
        vim._text=s;
    return docs.ac
}
function v(vim,cmd,arg){
    let c=vim._trueCursor.abs;
    vim._mode='visual';
    vim._trueCursor.moveTo(c);
    return docs.ac
}
function w(vim,cmd,arg){
    return {
        function:'w',
        count:arg,
    }
}
function x(vim,cmd,arg){
    return {
        function:'x',
        count:arg||1,
        register:'"'
    }
}
function y(vim,cmd,arg){
    if(cmd=='')
        return docs.a
    if(cmd=='y')
        return {
            function:'yy',
            count:arg||1,
            register:'"',
        }
}
var letters = {A,B,D,E,G,I,O,P,W,X,a,b,d,e,g,h,i,j,k,l,n,o,p,r,u,v,w,x,y};

function shift(vim,s,e,count){
    let cursor=Object.create(vim._trueCursor);
    for(;s!=e;s++){
        cursor.r=s;
        let
            a=cursor.lineStart,
            b=cursor.lineEnd,
            m=vim._trueText.substring(a,b).match(/^([\t ]*)([\S\s]*)/);
        vim._text={
            function:'replace',
            start:a,
            end:b,
            string:padding(vim._options,count(m[1]))+m[2],
        };
    }
}
function padding(o,n){
    let
        a=Math.floor(n/o.tabstop),
        b=n-a*o.tabstop;
    return (
        o.expandtab?' '.repeat(o.tabstop):'\t'
    ).repeat(a)+' '.repeat(b)
}
function countPadding(vim,s){
    return count(s,'\t')*vim._options.tabstop+count(s,' ')
    function count(s,c){
        return s.split(c).length-1
    }
}
function left(vim,s,e){
    shift(vim,s,e,m=>Math.max(0,countPadding(vim,m)-vim._options.shiftwidth));
}
function right(vim,s,e){
    shift(vim,s,e,m=>countPadding(vim,m)+vim._options.shiftwidth);
}
var shift$1 = {
    left,
    right
};

function lt(vim,cmd,arg){
    if(cmd=='')
        return docs.a
    if(cmd=='<'){
        arg||(arg=1);
        shift$1.left(vim,vim._trueCursor.r,vim._trueCursor.r+arg);
        return docs.acc
    }
}
function gt(vim,cmd,arg){
    if(cmd=='')
        return docs.a
    if(cmd=='>'){
        arg||(arg=1);
        shift$1.right(vim,vim._trueCursor.r,vim._trueCursor.r+arg);
        return docs.acc
    }
}
function dot(vim,cmd,arg){
    return docs.ac
}
function colon(vim){
    vim._mode='cmdline';
    vim._modeData.inputBuffer=':';
    vim._modeData.cursor.position=1;
    return docs.a
}
function slash(vim){
    vim._mode='cmdline';
    vim._modeData.inputBuffer='/';
    vim._modeData.cursor.position=1;
    return docs.a
}
function caret(vim){
    vim._trueCursor.moveTo(vim._trueCursor.lineStart);
    return docs.ac
}
function dollarSign(vim){
    vim._trueCursor.moveTo(Math.max(
        vim._trueCursor.lineStart,
        vim._trueCursor.lineEnd-2
    ));
    return docs.ac
}
function ctrl(vim,cmd){
    if(cmd=='')
        return docs.a
    if(cmd=='r'){
        if(vim._undoBranchManager.current.next!=undefined){
            vim._undoBranchManager.current=
                vim._undoBranchManager.current.next;
            vim._text=vim._undoBranchManager.current.text;
        }
        return docs.ac
    }
}
function quotationMark(vim,cmd,arg){
    if(cmd=='')
        return docs.a
    let register=cmd[0];
    cmd=cmd.substring(1);
    if(cmd=='')
        return docs.a
    let count=arg||1;
    if(cmd=='P')
        return {function:'P',register,count}
    if(cmd=='p')
        return {function:'p',register,count}
    if(cmd=='d'||cmd=='y')
        return docs.a
    if(cmd=='dd')
        return {function:'dd',register,count}
    if(cmd=='yy')
        return {function:'yy',register,count}
}
let commands=Object.assign({
    '<':lt,
    '>':gt,
    '.':dot,
    ':':colon,
    '/':slash,
    '^':caret,
    '$':dollarSign,
    '"':quotationMark,
},letters);
commands[String.fromCharCode(17)]=ctrl;

var ascii = {
    bs:     String.fromCharCode(0x08),
    cr:     String.fromCharCode(0x0d),
    esc:    String.fromCharCode(0x1b),
    del:    String.fromCharCode(0x7f),
};

function yank(vim,r,m,s){
    vim._setRegister(r,{mode:m,string:s});
}
function put(vim,c,s){
    vim._trueText={
        function:'insert',
        position:c,
        string:s,
    };
}
function putCharacterwise(vim,c,s){
    put(vim,c,s);
    vim._trueCursor.moveTo(c+s.length-1);
}
function putLinewise(vim,c,s){
    put(vim,c,s);
    vim._trueCursor.moveTo(c);
}
function delete_(vim,a,b){
    vim._trueText={
        function:'delete',
        start:a,
        end:b,
    };
}
function deleteCharacterwise(vim,r,a,b){
    yank(vim,r,'string',vim._trueText.substring(a,b));
    delete_(vim,a,b);
    vim._trueCursor.moveTo(a);
}
function deleteLinewise(vim,r,a,b){
    yank(vim,r,'line',vim._trueText.substring(a,b));
    delete_(vim,a,b);
}
var functions = {
    yank,
    putCharacterwise,
    putLinewise,
    deleteCharacterwise,
    deleteLinewise,
};

function B$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveToPreviousGeneralWordBegin();
    return docs.ac
}
function E$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveToNextGeneralWordEnd();
    return docs.ac
}
function W$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveToNextGeneralWordBegin();
    return docs.ac
}
function b$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveToPreviousWordBegin();
    return docs.ac
}
function e$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveToNextWordEnd();
    return docs.ac
}
function h$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveLeft();
    return docs.ac
}
function j$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveDown();
    return docs.ac
}
function k$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveUp();
    return docs.ac
}
function l$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveRight();
    return docs.ac
}
function w$1(vim,doc){
    let count=doc.count||1;
    while(count--)
        vim._trueCursor.moveToNextWordBegin();
    return docs.ac
}
var motions = {B: B$1,E: E$1,W: W$1,b: b$1,e: e$1,h: h$1,j: j$1,k: k$1,l: l$1,w: w$1,};

function gotoLine(vim,n){
    vim._trueCursor.moveTo(vim._trueCursor.line(n));
}
function D$1(vim,doc){
    functions.deleteCharacterwise(
        vim,
        doc.register,
        vim._trueCursor.abs,
        vim._trueCursor.lineEnd-1
    );
    if(vim._trueCursor.abs)
        vim._trueCursor.moveTo(vim._trueCursor.abs);
    return docs.acc
}
function G$1(vim,doc){
    gotoLine(vim,Math.min(
        vim._trueCursor._countOfRows,
        doc.count||vim._trueCursor._countOfRows
    )-1);
    return docs.ac
}
function O$1(vim,doc){
    functions.putLinewise(vim,vim._trueCursor.lineStart,'\n');
    vim._mode='insert';
    return docs.acc
}
function P$1(vim,doc){
    let reg=vim._registers[doc.register];
    if(!reg)
        return docs.ac
    let s=reg.string.repeat(doc.count);
    if(reg.mode=='string')
        functions.putCharacterwise(vim,vim._trueCursor.abs,s);
    else if(reg.mode=='line')
        functions.putLinewise(vim,vim._trueCursor.lineStart,s);
    return docs.acc
}
function X$1(vim,doc){
    let
        abs=vim._trueCursor.abs,
        ls=vim._trueCursor.lineStart,
        count=Math.min(abs-ls,Math.max(0,doc.count));
    functions.deleteCharacterwise(vim,doc.register,abs-count,abs);
    return docs.acc
}
function a$1(vim,doc){
    vim._mode='insert';
    vim._trueCursor.moveRight();
    return docs.ac
}
function dd(vim,doc){
    let c=vim._cursor;
    if(c.r<0)
        return docs.ac
    let count=Math.min(c._countOfRows-c.r,doc.count);
    functions.deleteLinewise(
        vim,
        doc.register,
        c.line(c.r),
        c.line(c.r+count)
    );
    c.moveTo(c.lineStart);
    return docs.acc
}
function gg(vim,doc){
    gotoLine(vim,Math.min(vim._trueCursor._countOfRows,doc.count||1)-1);
    return docs.ac
}
function o$1(vim,doc){
    functions.putLinewise(vim,vim._trueCursor.lineEnd,'\n');
    vim._mode='insert';
    return docs.acc
}
function p$1(vim,doc){
    let reg=vim._registers[doc.register];
    if(!reg)
        return docs.ac
    let s=reg.string.repeat(doc.count);
    if(reg.mode=='string')
        functions.putCharacterwise(vim,vim._trueCursor.abs+1,s);
    else if(reg.mode=='line')
        functions.putLinewise(vim,vim._trueCursor.lineEnd,s);
    return docs.acc
}
function yy(vim,doc){
    let c=vim._cursor;
    if(c.r<0)
        return docs.ac
    let arg=doc.count;
    arg=Math.min(c._countOfRows-c.r,arg);
    let
        a=c.line(c.r),
        b=c.line(c.r+arg);
    functions.yank(
        vim,
        doc.register,
        'line',
        vim._trueText.substring(a,b)
    );
    return docs.ac
}
function x$1(vim,doc){
    let
        abs=vim._trueCursor.abs,
        le=vim._trueCursor.lineEnd,
        count=Math.min(le-1-abs,Math.max(0,doc.count));
    functions.deleteCharacterwise(vim,doc.register,abs,abs+count);
    return docs.acc
}
var functions$1 = {
    B:motions.B,
    D: D$1,
    E:motions.E,
    G: G$1,
    O: O$1,
    P: P$1,
    W:motions.W,
    X: X$1,
    a: a$1,
    b:motions.b,
    dd,
    e:motions.e,
    gg,
    h:motions.h,
    j:motions.j,
    k:motions.k,
    l:motions.l,
    o: o$1,
    p: p$1,
    w:motions.w,
    yy,
    x: x$1,
};

function object(vim,val){
    if(val.ctrlKey){
        if(val.key=='r')
            return String.fromCharCode(17)+'r'
    }else switch(val.key){
        case 'ArrowLeft':
            return 'h'
        case 'ArrowRight':
            return 'l'
        case 'ArrowDown':
            return 'j'
        case 'ArrowUp':
            return 'k'
        case 'Backspace':
            return ascii.bs
        case 'Enter':
            return ascii.cr
        case 'Delete':
            return ascii.del
    }
    return ''
}
function tryCommand(vim,cmd,arg){
    if(cmd=='')
        return {acceptable:true}
    if(cmd[0] in commands)
        return commands[cmd[0]](vim,cmd.substring(1),arg)
}
var normal = (vim,val)=>{
    if(typeof val=='object')
        val=object(vim,val);
    if(!('command' in vim._modeData))
        vim._modeData.command='';
    vim._modeData.command+=val;
    let
        cmd=vim._modeData.command,
        arg;
    if(49<=cmd.charCodeAt(0)&&cmd.charCodeAt(0)<58){
        arg=parseInt(cmd,10);
        cmd=cmd.substring(arg.toString().length);
    }
    let res=tryCommand(vim,cmd,arg)||{};
    if(res.function!=undefined&&res.function in functions$1)
        res=functions$1[res.function](vim,res);
    if(res.acceptable){
        if(res.complete){
            if(res.changed)
                vim._undoBranchManager.push(vim._text);
            if(vim.mode=='normal')
                vim._modeData.command='';
        }
    }else{
        vim._modeData.command='';
    }
    vim._ui();
};

function main(vim,val){
    if(typeof val=='object')
        val=object$1(vim,val);
    if(typeof val=='string'){
        let abs=vim._trueCursor.abs;
        val=val.replace(/\r/,'\n');
        vim._trueText={
            function:'insert',
            position:abs,
            string:val,
        };
        vim._trueCursor.moveTo(abs+val.length);
    }
}
function object$1(vim,val){
    if(
        val.ctrlKey&&val.key=='c'||
        val.ctrlKey&&val.key=='['
    )
        val={key:'Escape'};
    switch(val.key){
        case 'ArrowDown':
            vim._trueCursor.moveDown();
            return
        case 'ArrowLeft':
            vim._trueCursor.moveLeft();
            return
        case 'ArrowRight':
            vim._trueCursor.moveRight();
            return
        case 'ArrowUp':
            vim._trueCursor.moveUp();
            return
        case 'Backspace':
            {
                let abs=vim._trueCursor.abs;
                if(abs==0)
                    return
                vim._text={
                    function:'delete',
                    start:abs-1,
                    end:abs,
                };
                vim._trueCursor.moveTo(abs-1);
            }
            return
        case 'Delete':
            {
                let
                    txt=vim._trueText,
                    abs=vim._trueCursor.abs;
                if(abs+1==txt.length)
                    return
                vim._text={
                    function:'delete',
                    start:abs,
                    end:abs+1,
                };
                vim._trueCursor.moveTo(abs);
            }
            return
        case 'Enter':
            return '\r'
        case 'Escape':
            vim._undoBranchManager.push(vim._text);
            vim._mode='normal';
            return
        case 'Tab':
            {
                let abs=vim._trueCursor.abs;
                vim._text={
                    function:'insert',
                    position:abs,
                    string:'\t',
                };
                vim._trueCursor.moveTo(abs+1);
            }
            return
    }
}
var insert = (vim,val)=>{
    let r=main(vim,val);
    vim._ui();
    return r
};

var visualRange = vim=>{
    let
        c=vim._modeData.cursor,
        d=vim._trueCursor.abs;
    if(d<c)[c,d]=[d,c];
    return {s:c,e:d+1}
};

function main$1(vim,val){
    if(typeof val=='string'){
        if(val=='d'){
            let
                r=visualRange(vim),
                b=vim._text.substring(r.s,r.e);
            vim._text={
                function:'delete',
                start:r.s,
                end:r.e,
            };
            vim._registers['"']={mode:'string',string:b};
            vim._trueCursor.moveTo(r.s);
            vim._mode='normal';
            return
        }
        if(val=='h')
            return vim._trueCursor.moveLeft()
        if(val=='j')
            return vim._trueCursor.moveDown()
        if(val=='k')
            return vim._trueCursor.moveUp()
        if(val=='l')
            return vim._trueCursor.moveRight()
        if(val=='y'){
            let r=visualRange(vim);
            vim._registers['"']={
                mode:'string',
                string:vim._text.substring(r.s,r.e),
            };
            vim._trueCursor.moveTo(r.s);
            vim._mode='normal';
            return
        }
        if(val=='<'){
            let r=visualRange(vim);
            let cursor=Object.create(vim._trueCursor);
            cursor.moveTo(r.s);
            let s=cursor.r;
            cursor.moveTo(r.e);
            let e=cursor.r;
            shift$1.left(vim,s,e+1);
            vim._mode='normal';
            return
        }
        if(val=='>'){
            let r=visualRange(vim);
            let cursor=Object.create(vim._trueCursor);
            cursor.moveTo(r.s);
            let s=cursor.r;
            cursor.moveTo(r.e);
            let e=cursor.r;
            shift$1.right(vim,s,e+1);
            vim._mode='normal';
            return
        }
    }else if(typeof val=='object'){
        if(
            val.key=='Escape'||
            val.ctrlKey&&val.key=='c'||
            val.ctrlKey&&val.key=='['
        )
            return vim._mode='normal'
    }
}
var visual = (vim,val)=>{
    main$1(vim,val);
    vim._ui();
};

let shortcut={
    nu:'number',
};
function main$2(vim,val){
    let enter=false;
    if(typeof val=='object'){
        if(val.key=='ArrowLeft')
            vim._modeData.cursor.position--;
        else if(val.key=='ArrowRight')
            vim._modeData.cursor.position++;
        else if(val.key=='Backspace')
            vim._modeData.cursor.backspace;
        else if(val.key=='Delete')
            vim._modeData.cursor.delete;
        else if(val.key=='End')
            vim._modeData.cursor.end;
        else if(val.key=='Enter')
            enter=true;
        else if(
            val.key=='Escape'||
            val.ctrlKey&&val.key=='c'||
            val.ctrlKey&&val.key=='['
        )
            return vim._mode='normal'
        else if(val.key=='Home')
            vim._modeData.cursor.home;
    }else if(typeof val=='string'){
        vim._modeData.inputBuffer=
            vim._modeData.inputBuffer.substring(
                0,vim._modeData.cursor.position
            )+
            val+
            vim._modeData.inputBuffer.substring(
                vim._modeData.cursor.position
            );
        vim._modeData.cursor.position+=val.length;
    }
    let cmd=vim._modeData.inputBuffer;
    if(!cmd)
        return vim._mode='normal'
    if(!enter)
        return
    let status;
    if(cmd[0]==':'){
        cmd=cmd.substring(1);
        let
            setPattern=/^set?(.*)/,
            editPattern=/^e(?:dit)?(.*)/;
        if(setPattern.test(cmd)){
            status=set(vim,cmd.match(setPattern)[1]);
        }else if(editPattern.test(cmd)){
            status=edit(vim,cmd.match(editPattern)[1]);
        }else if(/^q(?:uit)?$/.test(cmd)){
            vim._quit();
        }else if(/^wq$/.test(cmd)){
            vim._write();
            vim._quit();
        }else if(/^w(?:rite)?$/.test(cmd)){
            status=vim._write();
        }
    }else if(cmd[0]=='/');
    vim._mode='normal';
    if(status)
        vim._modeData.status=status;
}
function edit(vim,cmd){
    let argumentPattern=/ (.*)/;
    if(argumentPattern.test(cmd)){
        cmd=cmd.match(argumentPattern)[1];
        return vim._edit(cmd)
    }
}
function set(vim,cmd){
    let argumentPattern=/ (.*)/;
    if(argumentPattern.test(cmd)){
        cmd=cmd.match(argumentPattern)[1];
        let
            showValuePattern=   /(.*)\?$/,
            argsPattern=        /(.*)[=:](.*)/,
            noPattern=          /^no(.*)/,
            show=       false,
            toSet=      false,
            option,
            value;
        if(showValuePattern.test(cmd)){
            show=true;
            option=cmd.match(showValuePattern)[1];
        }else if(argsPattern.test(cmd)){
            toSet=true;
            option=cmd.match(argsPattern)[1];
            value=parseInt(cmd.match(argsPattern)[2],10);
        }else{
            toSet=true;
            if(noPattern.test(cmd)){
                option=cmd.match(noPattern)[1];
                value=false;
            }else{
                option=cmd;
                value=true;
            }
        }
        if(option in shortcut)
            option=shortcut[option];
        if(toSet){
            if(option in vim._options)
                vim._setOption(option,value);
        }else if(show){
            let v=vim._options[option];
            let res=`${v==false?'no':'  '}${option}`;
            if(typeof v=='number')
                res+=`=${v}`;
            return res
        }
    }
}
var cmdline = (vim,val)=>{
    let r=main$2(vim,val);
    vim._ui();
    return r
};

let modes={normal,insert,visual,cmdline,};
var input = {set(val){
    modes[this.mode](this,val);
}};

let ctx=document.createElement('canvas').getContext('2d');
var measureWidth = (size,s)=>{
    if(s==undefined)
        s='a';
    ctx.font=`${size}px monospace`;
    return ctx.measureText(s).width
};

/*MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/let a$2;
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t);}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
a$2=require('string-width');

},{"string-width":5}],2:[function(require,module,exports){

module.exports = options => {
	options = Object.assign({
		onlyFirst: false
	}, options);

	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, options.onlyFirst ? undefined : 'g');
};

},{}],3:[function(require,module,exports){

module.exports = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

},{}],4:[function(require,module,exports){

const isFullwidthCodePoint = codePoint => {
	if (Number.isNaN(codePoint)) {
		return false;
	}

	// Code points are derived from:
	// http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
	if (
		codePoint >= 0x1100 && (
			codePoint <= 0x115F || // Hangul Jamo
			codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
			codePoint === 0x232A || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			(0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			(0x3250 <= codePoint && codePoint <= 0x4DBF) ||
			// CJK Unified Ideographs .. Yi Radicals
			(0x4E00 <= codePoint && codePoint <= 0xA4C6) ||
			// Hangul Jamo Extended-A
			(0xA960 <= codePoint && codePoint <= 0xA97C) ||
			// Hangul Syllables
			(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
			// CJK Compatibility Ideographs
			(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
			// Vertical Forms
			(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
			// CJK Compatibility Forms .. Small Form Variants
			(0xFE30 <= codePoint && codePoint <= 0xFE6B) ||
			// Halfwidth and Fullwidth Forms
			(0xFF01 <= codePoint && codePoint <= 0xFF60) ||
			(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
			// Kana Supplement
			(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
			// Enclosed Ideographic Supplement
			(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			(0x20000 <= codePoint && codePoint <= 0x3FFFD)
		)
	) {
		return true;
	}

	return false;
};

module.exports = isFullwidthCodePoint;
module.exports.default = isFullwidthCodePoint;

},{}],5:[function(require,module,exports){
const stripAnsi = require('strip-ansi');
const isFullwidthCodePoint = require('is-fullwidth-code-point');
const emojiRegex = require('emoji-regex');

const stringWidth = string => {
	string = string.replace(emojiRegex(), '  ');

	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	string = stripAnsi(string);

	let width = 0;

	for (let i = 0; i < string.length; i++) {
		const code = string.codePointAt(i);

		// Ignore control characters
		if (code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (code >= 0x300 && code <= 0x36F) {
			continue;
		}

		// Surrogates
		if (code > 0xFFFF) {
			i++;
		}

		width += isFullwidthCodePoint(code) ? 2 : 1;
	}

	return width;
};

module.exports = stringWidth;
// TODO: remove this in the next major version
module.exports.default = stringWidth;

},{"emoji-regex":3,"is-fullwidth-code-point":4,"strip-ansi":6}],6:[function(require,module,exports){
const ansiRegex = require('ansi-regex');

const stripAnsi = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

module.exports = stripAnsi;
module.exports.default = stripAnsi;

},{"ansi-regex":2}]},{},[1]);
var npmStringWidth = a$2;

function charWidth(c){
    if(c=='\t')
        return 8
    return npmStringWidth(c)
}
function stringWidth(s){
    let res=0;
    for(let i=0;i<s.length;i++)
        res+=charWidth(s[i]);
    return res
}

let
    lfDoc={
        child:'$',
        class:'color4i',
    };
function substring(list,s,start,end){
    let a=[];
    for(;start!=end;start++){
        let c=s[start];
        a.push(c=='\n'?list?Object.create(lfDoc):'\n':c);
    }
    return a
}
function width(c){
    return c=='\n'?1:stringWidth(c)
}
function wrapLine(list,l,targetWidth){
    let rows=[];
    for(let i=0;i<l.length;){
        let start=i,end=calcEnd(i,l,targetWidth);
        rows.push({
            start,
            end,
            string:substring(list,l,start,end)
        });
        i=end;
    }
    return rows
}
function calcEnd(i,l,targetWidth){
    for(
        let rowWidth=0,w;
        i<l.length&&rowWidth+(w=width(l[i]))<=targetWidth;
        rowWidth+=w,i++
    );
    return i
}

function GreedyText(){
    this._options={};
    this.lines=[];
}
GreedyText.prototype._char=function(n){
    return this.lines.slice(0,n).map(v=>v.string.length+1).reduce(
        (a,b)=>a+b,0
    )
};
GreedyText.prototype._line=function(n){
    let i=0,s=0;
    while(i<this.lines.length&&s+this.lines[i].string.length+1<=n)
        s+=this.lines[i++].string.length+1;
    return i
};
Object.defineProperty(GreedyText.prototype,'countOfRows',{get(){
    this.wrap();
    return this.lines.map(l=>l.wrapped.rows.length).reduce((a,b)=>a+b,0)
}});
Object.defineProperty(GreedyText.prototype,'string',{get(){
    return this.lines.map(l=>l.string+'\n').join('')
}});
Object.defineProperty(GreedyText.prototype,'update',{set(val){
    if(typeof val=='string'){
        val=val.split('\n');
        val.pop();
        this.lines=val.map(val=>new Line(val));
    }else if(typeof val=='object'){
        let removeAdd=(s,e,a)=>{
            a=a.split('\n');
            a.pop();
            a=a.map(v=>new Line(v));
            a.unshift(s,e-s)
            ;[].splice.apply(this.lines,a);
        };
        if(val.function=='insert'){
            let l=this._line(val.position);
            let p=val.position-this._char(l);
            let s=(this.lines[l]?this.lines[l].string+'\n':'');
            s=s.substring(0,p)+val.string+s.substring(p);
            removeAdd(l,l+1,s);
        }else if(val.function=='delete'){
            let sl=this._line(val.start),el=this._line(val.end)+2;
            let lc=this._char(sl);
            let start=val.start-lc,end=val.end-lc;
            let s=this.lines.slice(sl,el).map(v=>v.string).join('\n')+'\n';
            s=s.substring(0,start)+s.substring(end);
            removeAdd(sl,el,s);
        }
    }
}});
Object.defineProperty(GreedyText.prototype,'width',{set(val){
    if(this._width!=val)
        this.lines.map(l=>{
            delete l.rows;
        });
    this._width=val;
},get(){
    return this._width
}});
GreedyText.prototype.uiText=function(start,end){
    let res=this.lines.map(l=>l.wrapped);
    return start==undefined?res:cut(res)
    function cut(res){
        return res.map(l=>{
            if(l.startRow+l.rows.length<=start||end<=l.startRow)
                return
            l.rows=l.rows.map((r,i)=>
                inRange(l.startRow+i)&&r
            ).filter(r=>r);
            return l
        }).filter(l=>l!=undefined)
    }
    function inRange(i){
        return start<=i&&i<end
    }
};
GreedyText.prototype.row=function(pos){
    let res;
    this.wrap();
    this.lines.map(l=>l.wrapped).map(l=>l.rows.map((r,i)=>{
        if(l.start+r.start<=pos&&pos<l.start+r.end)
            res=l.startRow+i;
    }));
    return res
};
GreedyText.prototype.setOption=function(key,val){
    this._options[key]=val;
    if(key=='list')
        this.lines.map(l=>{
            delete l.rows;
        });
};
/*
    A line should not include EOL, since it has already been seperated
    from the others.
*/
function Line(val){
    this.string=val;
}
GreedyText.prototype.wrap=function(){
    let
        charCount=0,
        rowsCount=0;
    this.lines.map((l,j)=>{
        let s=l.string+'\n';
        if(!l.rows)
            l.rows=wrapLine(this._options.list,s,this.width||Infinity);
        l.wrapped={
            index:j,
            start:charCount,
            startRow:rowsCount,
            rows:l.rows,
        };
        charCount+=s.length;
        rowsCount+=l.rows.length;
    });
};

function doe(n){
    let
        state=0,
        p={
            function:f=>f(n),
            number,
            object,
            string,
        };
    transform([...arguments].slice(1));
    return n
    function number(n){
        state=n;
    }
    function object(o){
        if(o instanceof Array)
            array();
        else if(o instanceof Node)
            n[state?'removeChild':'appendChild'](o);
        else if(('length' in o)||o[Symbol.iterator]){
            o=Array.from(o);
            array();
        }else if(state)
            Object.entries(o).map(([a,b])=>n.setAttribute(a,b));
        else
            Object.assign(n,o);
        function array(){
            o.map(transform);
        }
    }
    function string(s){
        n.appendChild(document.createTextNode(s));
    }
    function transform(t){
        for(let q;q=p[typeof t];t=q(t));
    }
}
let methods={
    html(){
        return doe(document.documentElement,...arguments)
    },
    head(){
        return doe(document.head,...arguments)
    },
    body(){
        return doe(document.body,...arguments)
    },
};
var doe$1 = new Proxy(doe,{
    get:(t,p)=>methods[p]||function(){
        return doe(document.createElement(p),...arguments)
    }
});

function update(view){
    if(view._width)
        view.node.style.width=`${view._width*view._fontWidth}px`;
    if(view._height)
        view.node.style.height=`${view._height*view._fontSize}px`;
    view._listeners.map(doc=>
        doc.cli.off('view',doc.listener)
    );
    view._listeners=[];
    {
        let a=dfs(view,view._cli,0,0);
        reuseWrite(view,a,view._previousArray);
        view._previousArray=a;
    }
}
function dfs(view,cli,dr,dc,o){
    o||(o={});
    cli._children.map(c=>{
        let tr=dr+c.r,tc=dc+c.c;
        if(!(0<=tr&&tr<view._height&&0<=tc&&tc<view._width))
            return
        if(typeof c.child=='string'){
            o[tr]||(o[tr]={});
            o[tr][tc]=c;
        }else if(typeof c.child=='symbol')
            view.symbols[c.child]={r:tr,c:tc};
        else
            dfs(view,c.child,tr,tc,o);
    });
    let listener=()=>update(view);
    view._listeners.push({cli,listener});
    cli.on('view',listener);
    return o
}
function reuseWrite(view,a,b){
    let o={};
    for(let r in a)
        for(let c in a[r])
            if(r in b&&c in b[r]&&notEqual(a[r][c],b[r][c]))
                write(view,a[r][c]||{child:''},r,c);
    inNotIn(a,b,(r,c)=>write(view,a[r][c],r,c));
    inNotIn(b,a,(r,c)=>write(view,{child:''},r,c));
    return o
    function notEqual(a,b){
        if(a.child!=b.child)
            return true
        if(a.class!=b.class)
            return true
        if(a.style!=b.style)
            return true
        return false
    }
    function inNotIn(a,b,f){
        for(let r in a)
            for(let c in a[r])
                if(!(r in b&&c in b[r]))
                    f(r,c);
    }
}
function write(view,doc,r,c){
    let
        div=getDiv(view,r,c),
        textContent=doc.child;
    if(textContent=='\n')
        textContent=' ';
    doe$1(div,
        {className:doc.class||''},
        doc.style?
            [
                {textContent:''},
                doe$1.div(
                    {textContent},
                    n=>{doe$1(n.style,doc.style);}
                )
            ]
        :
            {textContent}
    );
    div.style.width=`${stringWidth(textContent)*view._fontWidth}px`;
    function getDiv(view,r,c){
        if(!(r in view._divs))
            view._divs[r]={};
        if(!(c in view._divs[r])){
            doe$1(view.node,
                view._divs[r][c]=doe$1.div(n=>{doe$1(n.style,{
                    top:`${r*view._fontSize}px`,
                    left:`${c*view._fontWidth}px`,
                    textAlign:'center',
                });})
            );
        }
        return view._divs[r][c]
    }
}

function View(cli){
    this._cli=cli;
    this._fontSize=13;
    this._children=[];
    this._divs={};
    this._listeners=[];
    this._previousArray={};
    this._fontWidth=Math.ceil(measureWidth(this._fontSize));
    this.node=doe$1.div({className:'cli'});
    this.symbols={};
    update(this);
}
Object.defineProperty(View.prototype,'width',{set(val){
    this._width=val;
    this.update;
},get(){
    return this._width
}});
Object.defineProperty(View.prototype,'height',{set(val){
    this._height=val;
    this.update;
},get(){
    return this._height
}});
Object.defineProperty(View.prototype,'fontSize',{set(val){
    this._fontSize=val;
    this._fontWidth=Math.ceil(measureWidth(this._fontSize));
    this.node.style.fontSize=`${this._fontSize}px`;
    this.update;
}});
Object.defineProperty(View.prototype,'update',{set(val){
    update(this);
}});
View.prototype.free=function(){
};

function Cli(){
    EventEmmiter.call(this);
    this._children=[];
}
Object.setPrototypeOf(Cli.prototype,EventEmmiter.prototype);
Object.defineProperty(Cli.prototype,'view',{get(){
    let view=new View(this);
    this.on('view',()=>view.update);
    return view
}});
Cli.prototype.clear=function(){
    this._flushed=false;
    this._children=[];
};
Cli.prototype.flush=function(){
    if(this._flushed)
        return
    this.emit('view');
    this._flushed=true;
};
Cli.prototype.appendChild=function(child){
    this._flushed=false;
    if(
        typeof child=='string'||
        child instanceof Cli
    )
        child={child};
    if(!('r' in child))
        child.r=0;
    if(!('c' in child))
        child.c=0;
    if(typeof child.child=='string'){
        let r=0,c=0;
        for(let i=0;i<child.child.length;i++){
            let chr=child.child[i];
            this._children.push({
                child:chr,
                r:child.r+r,
                c:child.c+c,
                class:child.class,
                style:child.style,
            });
            if(chr=='\n'){
                r++;
                c=0;
            }else{
                c+=stringWidth(chr);
            }
        }
    }else
        this._children.push(child);
};

function update$1(ui,cli){
    let vim=ui._vim;
    cli.clear();
    if(vim.mode=='normal'){
        cli.appendChild(vim._modeData.status!=undefined?
            vim._modeData.status
        :
            ''
        );
    }else if(vim.mode=='insert'){
        g('-- INSERT --');
    }else if(vim.mode=='visual'){
        g('-- VISUAL --');
    }else if(vim.mode=='visual-block'){
        g('-- VISUAL BLOCK --');
    }
    cli.appendChild({
        child:cursor(
            ui._vim._cursor.r,
            ui._vim._cursor.c
        ),
        c:ui.width-18
    });
    cli.appendChild({
        child:scroll(
            ui._wrapMethodData._scroll,
            ui._wrapMethodData.text.countOfRows,
            ui.height
        ),
        c:ui.width-4
    });
    cli.flush();
    function cursor(r,c){
        return `${r+1},${c+1}`
    }
    function scroll(s,cr,h){
        let
            top=s==0,
            bot=cr<=s+(h-1);
        if(top&&bot)
            return 'All'
        if(top)
            return 'Top'
        if(bot)
            return 'Bot'
        let n=Math.floor(100*s/(cr-(h-1))).toString();
        return `${' '.repeat(2-n.length)}${n}%`
    }
    function g(s){
        cli.appendChild({child:s,style:{fontWeight:'bold'}});
    }
}
function cmdlineUpdate(ui,cli){
    let vim=ui._vim;
    let
        text=vim._modeData.inputBuffer,
        cursor=vim._modeData.cursor.position;
    cli.clear();
    cli.appendChild(text);
    cli.appendChild({
        child:
            text.substring(cursor,cursor+1)||' ',
        c:cursor,
        class:'cursor',
    });
    cli.flush();
}
function CommandCli(ui){
    this._ui=ui;
    this.cli=new Cli;
    this.update();
}
function createCommandCli(ui){
    return new CommandCli(ui)
}
CommandCli.prototype.update=function(){
    let
        ui=this._ui,
        cli=this.cli,
        vim=ui._vim;
    if(inNvii(vim.mode))
        update$1(ui,cli);
    else if(vim.mode=='cmdline')
        cmdlineUpdate(ui,cli);
    function inNvii(v){
        return 0<=[
            'normal',
            'insert',
            'visual',
            'visual-block',
        ].indexOf(v)
    }
};

let highlightStyle={backgroundColor:'var(--middle-color)'};
function calcWidth(a){
    let x=0;
    for(let i=0;i<a.length;i++){
        let v=a[i];
        x+=typeof v=='object'?stringWidth(v.child):stringWidth(v);
    }
    return x
}
function createTextContentCli(
    text,
    cursor,
    showCursor,
    highlightRange,
    cursorSymbol,
    width
){
    let cli=new Cli,rowsCount;
    {
        let
            currentRowsCount=0;
        text.map(l=>{
            if(!l.rows.length)
                currentRowsCount++;
            l.rows.map(row=>{
                let rowStart=l.start+row.start;
                for(
                    let i=0,c=0;
                    i<row.string.length;
                    c+=calcWidth(row.string[i++])
                ){
                    let o=row.string[i];
                    if(typeof o=='string')
                        o={child:o};
                    else
                        o={
                            child:o.child,
                            class:o.class,
                            style:o.style,
                        };
                    o.r=currentRowsCount;
                    o.c=c;
                    if(
                        highlightRange&&
                        highlightRange.s<=rowStart+i&&
                        rowStart+i<highlightRange.e
                    )
                        o.style=highlightStyle;
                    cli.appendChild(o);
                }
                currentRowsCount++;
            });
        });
        rowsCount=currentRowsCount;
    }
    if(showCursor){
        let c;
        c=cursor;
        c=cursorCli(text,{
            r:c.r,
            c:c.c==-1?0:c.c
        },width);
        if(c){
            cli.appendChild(c);
            cli.appendChild({
                child:cursorSymbol,
                r:c.r,
                c:c.c,
            });
        }
    }
    return {
        textCli:cli,
        rowsCount,
    }
}
function cursorCli(text,vc,width){
    let currentRowsCount=0;
    let clientCursor;
    text.map(l=>{
        if(!l.rows.length)
            currentRowsCount++;
        l.rows.map(row=>{
            if(
                l.index==vc.r&&
                row.start<=vc.c&&vc.c<row.start+row.string.length
            ){
                let viewC=width?vc.c-row.start:vc.c;
                clientCursor={
                    row:currentRowsCount,
                    col:calcWidth(row.string.slice(0,viewC)),
                    doc:row.string[viewC],
                };
            }
            currentRowsCount++;
        });
    });
    if(!clientCursor)
        return
    if(typeof clientCursor.doc!='object')
        clientCursor.doc={child:clientCursor.doc};
    clientCursor.doc=Object.create(clientCursor.doc);
    clientCursor.doc.child=clientCursor.doc.child||' ';
    clientCursor.doc.r=clientCursor.row;
    clientCursor.doc.c=clientCursor.col;
    if(clientCursor.doc.class)
        clientCursor.doc.class=`${clientCursor.doc.class} cursor`;
    else
        clientCursor.doc.class='cursor';
    return clientCursor.doc
}

let
    color3i={
        color:'var(--color3i)'
    },
    color4i={
        color:'var(--color4i)'
    };
function build(cli,ui,showCursor,showNumber){
    let 
        cursor= ui._vim._trueCursor,
        width=  ui._width,
        height= ui._height,
        data=   ui._wrapMethodData,
        txt=    data.text;
    let numberWidth=ui._numberWidth;
    let textWidth=ui._textWidth;
    let text=data.text.uiText(data._scroll,data._scroll+height-1);
    let res=createTextContentCli(
        text,
        cursor,
        showCursor,
        ui._vim._mode=='visual'&&visualRange(ui._vim),
        ui._cursorSymbol,
        width
    );
    if(showNumber){
        cli.appendChild(number(text,numberWidth));
        cli.appendChild({
            child:res.textCli,
            c:numberWidth+1,
        });
    }else{
        cli.appendChild(res.textCli);
    }
    for(let r=res.rowsCount;r<ui.height-1;r++)
        cli.appendChild({
            child:'~',
            r,
            style:color4i
        });
    return cli
}
function number(text,numberWidth){
    let cli=new Cli;
    let currentRowsCount=0;
    text.map(l=>{
        cli.appendChild({
            child:pad((l.index+1).toString()),
            r:currentRowsCount,
            style:color3i
        });
        currentRowsCount+=l.rows.length||1;
    });
    return cli
    function pad(s){
        return ' '.repeat(numberWidth-s.length)+s
    }
}

function createTextCli(ui){
    return new TextCli(ui)
}
function TextCli(ui){
    this._ui=ui;
    this._updated=false;
    this.cli=new Cli;
    this.flush();
}
TextCli.prototype.update=function(){
    this._updated=false;
};
TextCli.prototype.flush=function(){
    if(this._updated)
        return
    this.cli.clear();
    build(
        this.cli,
        this._ui,
        document.activeElement==this._ui._inputTag&&
            this._ui._vim.mode!='cmdline',
        this._ui._vim._options.number
    );
    this.cli.flush();
    this._updated=true;
};

var createInput = ui=>doe$1.textarea({className:'input'},n=>{
    n.style.fontSize=`${ui._fontSize}px`;
    n.style.height=`${ui._fontSize+2}px`;
    let
        vim=ui._vim,
        composing=false;
    n.addEventListener('blur',()=>{
        vim._ui();
    });
    n.addEventListener('compositionstart',e=>{
        composing=true;
    });
    n.addEventListener('compositionend',e=>{
        composing=false;
        f();
    });
    n.addEventListener('focus',()=>{
        vim._ui();
    });
    n.addEventListener('input',()=>{
        f();
    });
    n.addEventListener('keydown',e=>{
        if(composing||!(
            e.key=='ArrowLeft'||
            e.key=='ArrowRight'||
            e.key=='ArrowDown'||
            e.key=='ArrowUp'||
            e.key=='Backspace'||
            e.key=='Delete'||
            e.key=='End'||
            e.key=='Enter'||
            e.key=='Escape'||
            e.key=='Home'||
            e.key=='Tab'||
            e.ctrlKey&&e.key=='c'||
            e.ctrlKey&&e.key=='['||
            e.ctrlKey&&e.key=='r'
        ))
            return
        e.preventDefault();
        e.stopPropagation();
        vim.input=e;
    });
    function f(){
        if(composing){
            vim._ui();
        }else{
            vim.input=n.value;
            n.value='';
        }
        let width=measureWidth(ui._fontSize,n.value);
        if(width)
            width+=2;
        n.style.width=`${width}px`;
    }
});

function createCliDiv(ui){
    return new CliDiv(ui)
}
function CliDiv(ui){
    this._ui=ui;
    this._vim=this._ui._vim;
    this._cli=new Cli;
    this._cliView=this._cli.view;
    this._ui._commandCli=createCommandCli(this._ui);
    this._cliView.fontSize=this._ui._fontSize;
    this._textCli=createTextCli(this._ui);
    this.update();
    let n=this._cliView.node;
    this._ui._inputTag=createInput(this._ui);
    n.appendChild(this._ui._inputTag);
    this.node=n;
}
CliDiv.prototype.modeChange=function(){
    this._ui._commandCli.update();
};
CliDiv.prototype.update=function(){
    let ui=this._ui;
    ui._wrapMethodData.text.width=ui._textWidth;
    ui._wrapMethodData.text.wrap();
    ui._checkScroll();
    this._textCli.update();
    this._ui._commandCli.update();
    if(this._cliView.width!=this._ui._width)
        this._cliView.width=this._ui._width;
    if(this._cliView.height!=this._ui._height)
        this._cliView.height=this._ui._height;
    {let c;if(c=this._cliView.symbols[this._ui._cursorSymbol]){
        this._ui._inputTag.style.top=`${c.r*this._ui._fontSize}px`;
        this._ui._inputTag.style.left=`${c.c*this._ui._fontWidth}px`;
    }}
    let r=this._ui._height-1;
    if(
        this._currentR==r&&
        this._currentWelcomeText==this._vim._welcomeText
    )
        return
    this._cli.clear();
    this._cli.appendChild(this._textCli.cli);
    this._cli.appendChild({
        child:this._ui._commandCli.cli,
        r,
    });
    if(
        this._vim._welcomeText&&
        50<=this._ui.width&&
        16<=this._ui.height
    ){
        let
            r=Math.floor(
                (
                    this._ui.height-
                    this._vim._welcomeText.split('\n').length-1
                )/2
            ),
            c=Math.floor(
                (this._ui.width-this._vim._welcomeText.split(
                    '\n'
                ).map(
                    s=>s.length
                ).reduce(
                    (a,b)=>Math.max(a,b)
                ))/2
            );
        this._cli.appendChild({
            child:this._vim._welcomeText,
            r,
            c,
        });
    }
    this._cli.flush();
    this._currentR=r;
    this._currentWelcomeText=this._vim._welcomeText;
};
CliDiv.prototype.flush=function(){
    this._textCli.flush();
};

function createViewNode(ui){
    let cliDiv=createCliDiv(ui);
    let n=cliDiv.node;
    n.classList.add('webvim');
    n.addEventListener('click',()=>
        ui._vim.focus()
    );
    return cliDiv
}

function optionChange(ui,options){
    for(let k of options)switch(k){
        case 'list':
            if(ui._wrapMethod=='greedy')
                ui._wrapMethodData.text.setOption(
                    'list',ui._vim._options[k]
                );
            break
        case 'number':
            ui._wrapMethodData.text.width=ui._textWidth;
            break
    }
}
function _updateByVim(changed){
    for(let k in changed){let v=changed[k];
        switch(k){
            case 'mode':
                this._viewNode.modeChange();
                break
            case 'text':
                if(this._wrapMethod=='greedy'){
                    if(this._sync&&this._vim._text!='')
                        v.map(u=>
                            this._wrapMethodData.text.update=u
                        );
                    else
                        this._wrapMethodData.text.update=
                            this._vim._trueText;
                    this._sync=
                        this._vim._text==this._wrapMethodData.text.string;
                }
                break
            case 'options':
                optionChange(this,Object.keys(v));
                break
        }
    }
    this._update();
}

function Ui(vim){
    this._values={};
    this._vim=vim;
    this._width=80;
    this._height=24;
    this._fontSize=13;
    this._wrapMethod='greedy';
    this._cursorSymbol=Symbol();
    this._viewNode=createViewNode(this);
    this.node=this._viewNode.node;
    setUpClock(this);
}
Object.defineProperty(Ui.prototype,'_fontSize',{set(v){
    this._values._fontSize=v;
    this._values._fontWidth=measureWidth(this._fontSize);
},get(){
    return this._values._fontSize
}});
Object.defineProperty(Ui.prototype,'_fontWidth',{get(){
    return this._values._fontWidth
}});
Object.defineProperty(Ui.prototype,'_numberWidth',{get(){
    return Math.max(3,Math.floor(
        Math.log(this._vim._trueCursor._countOfRows)/Math.log(10)
    )+1)
}});
Object.defineProperty(Ui.prototype,'_textWidth',{get(){
    return this._vim._options.number?
        this._width-(this._numberWidth+1)
    :
        this._width
}});
Ui.prototype._checkScroll=function(){
    let
        height=         this._height,
        data=           this._wrapMethodData,
        txt=            data.text,
        c=              this._vim._trueCursor,
        cursorViewRow=  txt.row(c._countOfCols==0?c.line(c.r):c.abs);
    if(data._scroll+height-1<=cursorViewRow)
        data._scroll=cursorViewRow-(height-1)+1;
    if(cursorViewRow<data._scroll)
        data._scroll=cursorViewRow;
};
Ui.prototype._update=function(){
    this._viewNode.update();
};
Ui.prototype._updateByVim=_updateByVim;
Object.defineProperty(Ui.prototype,'_wrapMethod',{set(val){
    this._values.wrapMethod=val;
    if(this._values.wrapMethod=='greedy'){
        let text=new GreedyText;
        text.width=this._textWidth;
        text.update=this._vim._trueText;
        text.setOption('list',this._vim._options.list);
        this._wrapMethodData={
            _scroll:0,
            text,
        };
    }else if(this._values.wrapMethod=='fixed'){
        this._wrapMethodData={
            _scroll:0,
        };
    }
},get(){
    return this._values.wrapMethod
}});
Object.defineProperty(Ui.prototype,'width',{set(val){
    this._width=val;
    this._update();
},get(){
    return this._width
}});
Object.defineProperty(Ui.prototype,'height',{set(val){
    this._height=val;
    this._update();
},get(){
    return this._height
}});
Ui.prototype.focus=function(){
    this._inputTag.focus();
};
Object.defineProperty(Ui.prototype,'free',{get(){
    tearDownClock(this);
    this._vim.removeUi(this);
}});
function setUpClock(ui){
    let f=()=>{
        ui._animationFrame=requestAnimationFrame(f);
        ui._viewNode.flush();
    };
    ui._animationFrame=requestAnimationFrame(f);
}
function tearDownClock(ui){
    cancelAnimationFrame(ui._animationFrame);
    delete ui._animationFrame;
}
var ui = {get(){
    let ui=new Ui(this);
    this._uis.add(ui);
    return ui
}};

var loadUserInterface = o=>{
    Object.defineProperty(o,'cursor',{get(){
        return this._cursor.abs
    }});
    Object.defineProperty(o,'mode',{get(){
        return this._mode
    }});
    Object.defineProperty(o,'text',{
        set(val){
            this._text=val;
            this._welcomeText=undefined;
            this._undoBranchManager.clear();
            this._undoBranchManager.push(this._text);
            this._ui();
        },get(){
            return this._text
        }
    });
    o.focus=function(){
        this._mainUi.focus();
    };
    Object.defineProperty(o,'input',input);
    Object.defineProperty(o,'ui',ui);
};

var loadSyntacticSugar = o=>{
    Object.defineProperty(o,'node',{get(){
        return this._mainUi.node
    }});
    Object.defineProperty(o,'height',{set(val){
        this._mainUi.height=val;
    }});
    Object.defineProperty(o,'width',{set(val){
        this._mainUi.width=val;
    }});
    Object.defineProperty(o,'pollute',{get(){
        this.polluteStyle;
        this.polluteCopy;
    }});
    Object.defineProperty(o,'polluteStyle',{get(){
        doe$1.head(this.style);
        this.once('quit',()=>{
            doe$1.head(1,this.style);
        });
    }});
    Object.defineProperty(o,'polluteCopy',{get(){
        this.copy=s=>{
            let e=document.activeElement,n;
            doe$1.body(n=doe$1.textarea({value:s},n=>{
                n.style.position='fixed';
            }));
            n.select();
            document.execCommand('copy',true,null);
            doe$1.body(1,n);
            if(e)
                e.focus();
        };
    }});
};

var colorsStyle = `div.webvim.cli{
    --color3i:yellow;
    --color4:blue;
    --color4i:dodgerblue;
    --background-color:black;
    --foreground-color:lightgray;
    --middle-color:gray;
    --cursor-bg:var(--foreground-color);
    --cursor-fg:var(--background-color);
}
div.webvim.cli .color4i{
    color:var(--color4i);
    --cursor-bg:var(--color4i);
    --cursor-fg:var(--background-color);
}
div.webvim.cli .cursor{
    background-color:var(--cursor-bg);
    color:var(--cursor-fg);
}
`;

function Cursor$1(vim){
    this._x=0;
    this._y=0;
}
// start 0
Object.defineProperty(Cursor$1.prototype,'_countOfRows',{get(){
    return this.text.split('\n').length-1
}});
Object.defineProperty(Cursor$1.prototype,'_countOfCols',{get(){
    return this.text?this.text.split('\n')[this.r].length:0
}});
Object.defineProperty(Cursor$1.prototype,'_exotic',{get(){
    let c=Object.create(this);
    Object.defineProperty(c,'_x',{set:val=>this._x=val,get:()=>this._x});
    Object.defineProperty(c,'_y',{set:val=>this._y=val,get:()=>this._y});
    return c
}});
Object.defineProperty(Cursor$1.prototype,'r',{set(val){
    this._y=val;
},get(){
    return Math.min(this._countOfRows-1,Math.max(0,this._y))
}});
Object.defineProperty(Cursor$1.prototype,'c',{set(val){
    this._x=val;
},get(){
    return Math.min(availableCols(this)-1,Math.max(0,this._x))
}});
function availableCols(c){
    if(
        c.mode=='normal'||
        c.mode=='cmdline'
    )
        return c._countOfCols
    if(
        c.mode=='visual'||
        c.mode=='insert'
    )
        return c._countOfCols+1
}
Cursor$1.prototype.line=function(n){
    return this.text.split('\n').slice(0,n).join('').length+n
};
// end 0
// start 1
Cursor$1.prototype.moveLeft=function(){
    this._x=Math.max(0,this.c-1);
};
Cursor$1.prototype.moveRight=function(){
    this._x=Math.min(availableCols(this)-1,this.c+1);
};
Cursor$1.prototype.moveUp=function(){
    this._y=Math.max(0,this._y-1);
};
Cursor$1.prototype.moveDown=function(){
    this._y=Math.min(this._countOfRows-1,this._y+1);
};
// end 1
// start 1a
Object.defineProperty(Cursor$1.prototype,'onChar',{get(){
    return 0<=this.c
}});
Object.defineProperty(Cursor$1.prototype,'abs',{get(){
    return (0<=this.r?this.line(this.r):0)+(0<=this.c?this.c:0)
}});
// end 1a
// start 1b
Cursor$1.prototype.moveTo=function(n){
    this._y=this.text.substring(0,n).split('\n').length-1;
    this._x=n-(
        this.text.split('\n').slice(0,this.r).join('').length+this.r
    );
};
// end 1b
// start 1c
Object.defineProperty(Cursor$1.prototype,'lineStart',{get(){
    return this.text.substring(0,this.abs).lastIndexOf('\n')+1
}});
Object.defineProperty(Cursor$1.prototype,'lineEnd',{get(){
    let a=this.abs;
    return a+this.text.substring(a).indexOf('\n')+1
}});
// end 1c
// start 2
Cursor$1.prototype.moveToEOL=function(){
    this.moveTo(this.lineEnd-1);
};
// end 2
// start 2a
{
    // start github.com/b04902012
    function charType(text,a){
        if(text[a]==='\n'&&(!a||text[a-1]==='\n'))
            return "EmptyLine"
        if(/^\s$/.test(text[a]))
            return "WhiteSpace"
        if(/^\w$/.test(text[a]))
            return "AlphaNumeric"
        if(/^[\x00-\x7F]*$/.test(text[a]))
            return "ASCII"
        return "NonASCII"
    }
    /*Cursor.prototype.moveWordRight=function(){
        let a=this.abs
        let t=charType(this.text,a)
        let b=false
        while(a<this.text.length-1&&
          [(b||t),"WhiteSpace"].includes(charType(this.text,a))
        ){
            b=b||(charType(this.text,a)==="WhiteSpace")
            a++
            if(charType(this.text,a)==="EmptyLine")break
        }
        this.moveTo(a)
    }
    Cursor.prototype.moveGeneralWordRight=function(){
        let a=this.abs
        let t=charType(this.text,a)
        let b=false
        while(a<this.text.length-1&&
          (!b||charType(this.text,a)==="WhiteSpace")
        ){
            b=b||(charType(this.text,a)==="WhiteSpace")
            a++
            if(charType(this.text,a)==="EmptyLine")
              break
            if(t==="EmptyLine"&&charType(this.text,a)!=="WhiteSpace")
              break
        }
        this.moveTo(a)
    }*/
    // end github.com/b04902012
    /*Cursor.prototype.moveWordRight=function(){
        let a=this.abs,t=charType(this.text,a)
        if(t=='EmptyLine'){
            if(a+1<this.text.length)
                a++
        }else
            for(;
                a+1<this.text.length&&
                t==charType(this.text,a)
            ;)
                a++
        for(;a+1<this.text.length&&'WhiteSpace'==charType(this.text,a);)
            a++
        this.moveTo(a)
    }
    Cursor.prototype.moveGeneralWordRight=function(){
        let a=this.abs,t=charType(this.text,a)
        if(t=='EmptyLine'){
            if(a+1<this.text.length)
                a++
        }else
            for(;
                a+1<this.text.length&&
                !['EmptyLine','WhiteSpace'].includes(charType(this.text,a))
            ;)
                a++
        for(;a+1<this.text.length&&'WhiteSpace'==charType(this.text,a);)
            a++
        this.moveTo(a)
    }*/
    function isWordBegin(text,a,general){
        if(!a)return true
        if(charType(text,a)==="EmptyLine")return true
        if(charType(text,a)==="WhiteSpace")return false
        if(!general && charType(text,a) !== charType(text, a-1))return true
        if(general && ["WhiteSpace", "EmptyLine"].includes(charType(text,a-1)))return true
        return false
    }
    function isWordEnd(text,a,general){
        if(a===text.length-1)return true
        if(charType(text,a)==="EmptyLine")return true
        if(charType(text,a)==="WhiteSpace")return false
        if(!general && charType(text,a) !== charType(text, a+1))return true
        if(general && ["WhiteSpace", "EmptyLine"].includes(charType(text,a+1)))return true
        return false
    }
    Cursor$1.prototype.moveToNextWordBegin=function(){
        let a=this.abs+1;
        if(a === this.text.length)
          return this.moveTo(this.abs)
        while(a<this.text.length-1 && !isWordBegin(this.text,a,false))a++;
        return this.moveTo(a)
    };
    Cursor$1.prototype.moveToNextGeneralWordBegin=function(){
        let a=this.abs+1;
        if(a === this.text.length)
          return this.moveTo(this.abs)
        while(a<this.text.length-1 && !isWordBegin(this.text,a,true))a++;
        return this.moveTo(a)
    };
    Cursor$1.prototype.moveToNextWordEnd=function(){
        let a=this.abs+1;
        if(a === this.text.length)
          return this.moveTo(this.abs)
        while(a<this.text.length-1 && !isWordEnd(this.text,a,false))a++;
        return this.moveTo(a)
    };
    Cursor$1.prototype.moveToNextGeneralWordEnd=function(){
        let a=this.abs+1;
        if(a === this.text.length)
          return this.moveTo(this.abs)
        while(a<this.text.length-1 && !isWordEnd(this.text,a,true))a++;
        return this.moveTo(a)
    };
    Cursor$1.prototype.moveToPreviousWordBegin=function(){
        let a=this.abs-1;
        if(!a)
          return this.moveTo(this.abs)
        while(a>0 && !isWordBegin(this.text,a,false))a--;
        return this.moveTo(a)
    };
    Cursor$1.prototype.moveToPreviousGeneralWordBegin=function(){
        let a=this.abs-1;
        if(!a)
          return this.moveTo(this.abs)
        while(a>0 && !isWordBegin(this.text,a,true))a--;
        return this.moveTo(a)
    };
}

function createCursor(vim){
    let cursor=new Cursor$1,trueCursor=cursor._exotic;
    Object.defineProperty(cursor,'text',{configurable:true,get(){
        return vim._text
    }});
    Object.defineProperty(cursor,'mode',{get(){
        return vim._mode
    }});
    Object.defineProperty(trueCursor,'text',{get(){
        return vim._trueText
    }});
    return [cursor,trueCursor]
}

var rc = vim=>{
    let vimrc=vim._read('~/.vimrc');
    if(vimrc==undefined)
        return
    vimrc.split('\n').map(c=>{
        if(!c)
            return
        vim._mode='cmdline';
        vim._modeData.inputBuffer=':';
        vim._modeData.cursor.position=1;
        vim.input=c;
        vim.input={key:'Enter'};
    });
};

var defaultOptions = {
    expandtab:  false,
    list:       false,
    number:     false,
    shiftwidth: 8,
    tabstop:    8,
};

function StyleManager(){
    this.style=doe$1.style();
}
StyleManager.prototype.appendChild=function(n){
    doe$1(this.style,n);
};

function UndoBranchManager(){
    this._undoBranches=[];
}
UndoBranchManager.prototype.clear=function(){
    this._undoBranches=[];
    delete this.current;
};
UndoBranchManager.prototype.push=function(text){
    let b=new UndoBranch(text);
    this._undoBranches.push(b);
    if(this.current!=undefined){
        this.current.next=b;
        b.previous=this.current;
    }
    this.current=b;
};
UndoBranchManager.prototype.gotoPrevious=function(){
    if(this.current.previous!=undefined){
        let b=this.current.previous;
        this.current=b;
        return b.text
    }
};
function UndoBranch(text){
    this.text=text;
}

var style = `div.webvim.cli{
    position:relative;
    font-family:monospace;
    white-space:pre;
    line-height:1;
    color:var(--foreground-color);
    background-color:var(--background-color);
    cursor:default;
    user-select:none;
}
div.webvim.cli>div{
    position:absolute;
}
div.webvim.cli>textarea.input{
    font-family:monospace;
    position:absolute;
    border:0;
    padding:0;
    resize:none;
    overflow:hidden;
    outline:none;
    width:0;
    color:var(--background-color);
    background-color:var(--foreground-color);
    z-index:1;
}
`;

let load=[
    loadBase,
    loadUserInterface,
    loadSyntacticSugar,
];
function Vim(read,write){
    EventEmmiter.call(this);
    this._values={
        mode:'normal'
    };
    this._options=Object.create(defaultOptions);
    this._viewChanged=[];
    this._text='';
    this._registers={};
    this._modeData={};
    {let a=createCursor(this);
        this._cursor=a[0];
        this._trueCursor=a[1];
    }
    this._undoBranchManager=new UndoBranchManager;
    this._undoBranchManager.push(this._text);
    this._styleManager=new StyleManager;
    this.style=this._styleManager.style;
    this._styleManager.appendChild(document.createTextNode(style));
    this._styleManager.appendChild(document.createTextNode(colorsStyle));
    this.read=read;
    this.write=write;
    this._uis=new Set;
    rc(this);
}
Object.setPrototypeOf(Vim.prototype,EventEmmiter.prototype);
load.map(f=>f(Vim.prototype));

export default Vim;
