Object.entries({"main.js":";(async()=>{\n    ;(await module.importByPath('lib/general.static.js',{mode:1}))(module)\n    module.repository.Chat=module.shareImport('Chat.js')\n    let[\n        chatPage,\n    ]=await Promise.all([\n        module.shareImport('main/chatPage.js'),\n    ])\n    module.arguments.userId==undefined?\n        chatPage.showConversationList()\n    :\n        chatPage.showChatRoom(module.arguments.userId)\n})()\n","Chat/Room/Ui.js":"(async()=>{\n    let[\n        dom,\n        createMessage,\n        createSingleMessage,\n        createBottom,\n        StyleManager,\n        colorScheme,\n    ]=await Promise.all([\n        module.repository.althea.dom,\n        module.shareImport('Ui/createMessage.js'),\n        module.shareImport('Ui/createSingleMessage.js'),\n        module.shareImport('Ui/createBottom.js'),\n        module.shareImport('Ui/StyleManager.js'),\n        module.shareImport('Ui/colorScheme.js'),\n    ])\n    function Ui(currentUser,target){\n        this._currentUser=currentUser\n        this._target=target\n        this._styleManager=new StyleManager\n        this.node=dom('div',\n            {className:'chat'},\n            this.messageDiv=createMessage(this),\n            this.bottomDiv=createBottom(this)\n        )\n    }\n    Ui.prototype._send=function(){\n        if(this.textarea.value=='')\n            return\n        this.sendMessage(this.textarea.value)\n        this.textarea.value=''\n    }\n    Ui.prototype.beAppended=function(){\n        this.updateMessageDivHeight()\n    }\n    Ui.prototype.focus=function(){\n        this.textarea.focus()\n    }\n    Ui.prototype.updateMessageDivHeight=function(){\n        this.messageDiv.style.height=`calc(100% - 8px - ${\n            this.bottomDiv.clientHeight+2\n        }px)`\n    }\n    Ui.prototype.updateTextareaHeight=function(){\n        let rows=Math.max(2,Math.min(4,\n            this.textarea.value.split('\\n').length\n        ))\n        this.textarea.rows=rows\n        this.updateMessageDivHeight()\n        this.syncInnerMessageDivScroll()\n    }\n    Ui.prototype.prepend=async function(messages){\n        return uiAddMessages.call(this,messages,'prepend')\n    }\n    Ui.prototype.append=async function(messages){\n        return uiAddMessages.call(this,messages,'append')\n    }\n    Ui.prototype._queryOlder=function(){\n        this.queryOlder()\n    }\n    Ui.prototype.changeStyle=function(id){\n        if(this._style!=undefined)\n            this._styleManager.remove(this._style)\n        this._style=this._styleManager.insert({\n            id,\n            content:colorScheme[id].style,\n        })\n    }\n    Object.defineProperty(Ui.prototype,'style',{set(val){\n        this._styleManager.forEach=val\n    },get(){\n        return this._styleManager.forEach\n    }})\n    Object.defineProperty(Ui.prototype,'connectionStatus',{set(val){\n        this._connectionStatus=val\n        this._statusNode.textContent=val=='online'?'':'offline'\n    }})\n    async function uiAddMessages(messages,mode){\n        let[userA,userB]=await Promise.all([\n            this._currentUser,\n            this._target,\n        ])\n        await Promise.all([userA,userB].map(u=>u.load('nickname')))\n        let insert\n        if(mode=='prepend'){\n            messages=messages.slice()\n            messages.reverse()\n            insert=div=>this._topDiv.after(div)\n        }else if(mode=='append'){\n            insert=div=>dom(this._innerMessageDiv,div)\n        }\n        messages.map(message=>\n            insert(createSingleMessage(this,userA,userB,message))\n        )\n        this.syncInnerMessageDivScroll()\n    }\n    return Ui\n})()\n","Chat/Room/Ui/createSingleMessage/compile.js":"let whitelist={\n    a:{\n        href:/^https?:\\/\\//,\n    },\n    br:{},\n    code:{\n        style:0,\n    },\n    div:{\n        style:0,\n    },\n    iframe:{\n        width:0,\n        height:0,\n        src:/^https:\\/\\/www\\.youtube\\.com\\/embed\\//,\n        frameborder:0,\n        allowfullscreen:0,\n    },\n    img:{\n        src:/^img\\//,\n        style:0,\n    },\n    p:{\n        style:0,\n    },\n    pre:{\n        style:0,\n    },\n    span:{\n        style:0,\n    },\n}\n;(async()=>{\n    let[\n        dom,\n        uri,\n    ]=await Promise.all([\n        module.repository.althea.dom,\n        module.repository.althea.uri,\n    ])\n    function compile(s){\n        let body=(new DOMParser).parseFromString(\n            `<!docytpe html><title>0</title><body>${s}`,'text/html'\n        ).body\n        traverse(body)\n        return[...body.childNodes]\n    }\n    function traverse(m){\n        [...m.childNodes].map(n=>{\n            if(!test(n))\n                return m.removeChild(n)\n            if(n.nodeType==1)\n                traverse(n)\n            else if(n.nodeType==3){\n                for(let o of renderUrl(n.wholeText))\n                    m.insertBefore(o,n)\n                m.removeChild(n)\n            }\n        })\n    }\n    function test(n){\n        if(n.nodeType==1){\n            let name=n.nodeName.toLowerCase()\n            if(!(name in whitelist))\n                return\n            let nodeTest=whitelist[name]\n            return[...n.attributes].every(a=>{\n                if(!(a.name in nodeTest))\n                    return \n                let attrTest=nodeTest[a.name]\n                if(attrTest==0)\n                    return true\n                return attrTest.test(a.value)\n            })\n        }else if(n.nodeType==3)\n            return 1\n    }\n    function*renderUrl(s){\n        for(let m;m=uri.matchAbsoluteUri(s);){\n            yield dom.tn(s.substring(0,m.index))\n            yield /^https?/.test(m[0])?\n                dom('a',decodeURI(m[0]),{href:m[0]})\n            :\n                dom.tn(m[0])\n            s=s.substring(m.index+m[0].length)\n        }\n        yield dom.tn(s)\n    }\n    return compile\n})()\n","Chat/Room/Ui/setupSettingsButton.js":";(async()=>{\n    let[\n        dom,\n        arg,\n        colorScheme,\n    ]=await Promise.all([\n        module.repository.althea.dom,\n        module.repository.althea.arg,\n        module.shareImport('colorScheme.js'),\n    ])\n    function setupSettingsButton(ui){\n        ui._settingsButton=dom('button','Settings',{onclick(e){\n            let bF=dom.createBF()\n            dom(ui.node,bF.node)\n            bF.appendChild(createSettingsDiv(ui))\n            bF.on('backClick',e=>{\n                ui.node.removeChild(bF.node)\n            })\n        }})\n    }\n    function createSettingsDiv(ui){\n        return dom('div',\n            n=>{\n                n.style.margin='16px 24px'\n                n.style.width='280px'\n            },\n            notificationSound(ui),\n            colorSchemeP(ui),\n            dom('p',\n                dom('input',{\n                    type:'checkbox',\n                    checked:ui.getSetting('pressEnterToSend'),\n                    onchange(e){\n                        ui.setSetting('pressEnterToSend',this.checked)\n                    }\n                }),\n                ' Press Enter to send.'\n            )\n        )\n    }\n    function notificationSound(ui){\n        return dom('p',\n            'Notification Sound: ',\n            dom('input',{\n                type:'range',\n                max:1,\n                step:0.01,\n                value:ui.getSetting('notificationSound'),\n                onchange(e){\n                    ui.setSetting('notificationSound',this.value)\n                    ui.playNotificationSound()\n                }\n            })\n        )\n    }\n    function colorSchemeP(ui){\n        let s=ui.getSetting('colorScheme')\n        return dom('p',\n            'Color Scheme: ',\n            dom('select',\n                ...Object.keys(colorScheme).map(i=>\n                    dom('option',{value:i},colorScheme[i].name,n=>{\n                        if(s==i)\n                            n.selected=true\n                    })\n                ),\n                {onchange(e){\n                    ui.setSetting('colorScheme',this.value)\n                }}\n            )\n        )\n    }\n    return setupSettingsButton\n})()\n","Chat/Room/Ui/StyleManager.js":"function StyleManager(){\n    this._style=[]\n}\nStyleManager.prototype.insert=function(content){\n    let s={content}\n    if(this._forEach)\n        s.rollback=this._forEach(s.content)\n    this._style.push(s)\n    return this._style.length-1\n}\nStyleManager.prototype.remove=function(id){\n    let s=this._style[id]\n    if(this._forEach)\n        s.rollback()\n    this._style.splice(id,1)\n}\nObject.defineProperty(StyleManager.prototype,'forEach',{set(forEach){\n    this._forEach=forEach\n    this._style.map(forEach?\n        s=>s.rollback=forEach(s.content)\n    :\n        s=>s.rollback()\n    )\n},get(){\n    return this._forEach\n}})\nStyleManager\n","Chat/Room/Ui/createSingleMessage.js":"(async()=>{\n    let[\n        compile,\n        dom,\n    ]=await Promise.all([\n        module.shareImport('createSingleMessage/compile.js'),\n        module.repository.althea.dom,\n    ])\n    return createSingleMessageNode\n    function createSingleMessageNode(ui,userA,userB,message){\n        return dom('p',async n=>{\n            let a=await(message.fromUser==userA.id?userA:userB).finalA\n            let span=createSpan(message)\n            dom(n,a,': ',span.span)\n            ui.syncInnerMessageDivScroll()\n            await span.promise\n            ui.syncInnerMessageDivScroll()\n        })\n    }\n    function createSpan(message){\n        let span=dom('span',\n            {title:(new Date(message.timestamp)).toLocaleString()},\n            compile(message.message)\n        )\n        return{\n            span,\n            promise:Promise.all(\n                [...span.getElementsByTagName('img')].map(img=>\n                    new Promise((rs,rj)=>{\n                        img.addEventListener('load',rs)\n                        img.addEventListener('error',rs)\n                    })\n                )\n            )\n        }\n    }\n})()\n","Chat/Room/Ui/createMessage.js":"(async()=>{\n    let[\n        dom,\n    ]=await Promise.all([\n        module.repository.althea.dom,\n    ])\n    return createMessageDiv\n    function createMessageDiv(ui){\n        function syncDivScroll(){\n            if(ui.atBottom)\n                div.scrollTop=div.scrollHeight\n        }\n        function updateAtBottom(){\n            ui.atBottom=Math.abs(\n                div.scrollTop+div.clientHeight-div.scrollHeight\n            )<=1\n        }\n        let div=dom('div',\n            {\n                className:'message',\n                onscroll:updateAtBottom,\n                onclick(e){\n                    getSelection().isCollapsed&&ui.textarea.focus()\n                },\n            },\n            ui._topDiv=createTopDiv(ui)\n        )\n        updateAtBottom()\n        ui.syncInnerMessageDivScroll=syncDivScroll\n        return ui._innerMessageDiv=div\n    }\n    function createTopDiv(ui){\n        return dom('div',\n            {className:'top'},\n            createShowOlderMessagesButton(ui)\n        )\n    }\n    function createShowOlderMessagesButton(ui){\n        return dom('button',{onclick(e){\n            e.stopPropagation()\n            ui._queryOlder()\n        }},'Show Older Messages')\n    }\n})()\n","Chat/Room/Ui/createBottom.js":";(async()=>{\n    let[\n        arg,\n        dom,\n        setupSettingsButton,\n    ]=await Promise.all([\n        module.repository.althea.arg,\n        module.repository.althea.dom,\n        module.shareImport('setupSettingsButton.js'),\n    ])\n    function createTextarea(ui){\n        let textarea=dom('textarea',{\n            rows:2,\n            oninput(e){\n                ui.updateTextareaHeight()\n            }\n        })\n        textarea.onkeydown=e=>{\n            // only enter\n            if(!(\n                ui.getSetting('pressEnterToSend')&&\n                !e.ctrlKey&&!e.shiftKey&&e.key=='Enter'\n            ))\n                return\n            e.stopPropagation()\n            e.preventDefault()\n            ui._send()\n        }\n        ;(async()=>{\n            let user=await ui._currentUser\n            await user.load('nickname')\n            textarea.placeholder=`${user.nickname}: `\n        })()\n        return textarea\n    }\n    function setupFileButton(ui){\n        ui._fileButton=dom.createFileButton('Image')\n        ui._fileButton.on('file',async a=>{\n            ui._fileButton.n.disabled=true\n            let imageIds=await ui.imageUploader.uploadImages(a)\n            imageIds.map(id=>{\n                ui.textarea.value+=\n                    `<img src=img/${id}c800x600.jpg>\\n`\n            })\n            ui.updateTextareaHeight()\n            ui._fileButton.n.disabled=false\n        })\n    }\n    function setupStatusNode(ui){\n        ui._statusNode=dom('span')\n    }\n    function createSendButton(ui){\n        return dom('button','Send',{onclick(){\n            ui._send()\n        }})\n    }\n    function createBottom(ui){\n        setupFileButton(ui)\n        setupSettingsButton(ui)\n        setupFindButton(ui)\n        setupStatusNode(ui)\n        return dom('div',\n            {className:'bottom'},\n            ui.textarea=createTextarea(ui),\n            arg.h&&[ui._findButton,' '],\n            ui._fileButton.n,' ',\n            createSendButton(ui),' ',\n            ui._settingsButton,' ',\n            ui._statusNode\n        )\n    }\n    function setupFindButton(ui){\n        ui._findButton=dom('button','Find')\n    }\n    return createBottom\n})()\n/*async function fullscreen(div){\n    if((await module.repository.althea.browser).isMobile){\n        dom(div,' ',createFullscreenButton())\n    }\n    function createFullscreenButton(){\n        let\n            status=0,\n            n=dom('button')\n        updateTextContent()\n        n.onclick=e=>{\n            status=1-status\n            updateTextContent()\n            if(status==0)\n                document.webkitExitFullscreen()\n            else\n                document.body.webkitRequestFullscreen()\n        }\n        function updateTextContent(){\n            n.textContent=['Fullscreen','Window'][status]\n        }\n        return n\n    }\n}*/\n","Chat/Room/Ui/colorScheme.js":"let colorScheme={\n    'default':{\n        name:'Default',\n        style:`\ndiv.chat>div.message::-webkit-scrollbar{\n    width:12px;\n}\ndiv.chat>div.message::-webkit-scrollbar-track{\n    border-radius:6px;\n    background:#DDD;\n}\ndiv.chat>div.message::-webkit-scrollbar-thumb{\n    border-radius:6px;\n    background:#BBB;\n}\n`,\n    },\n    'gnulinux':{\n        name:'GNU/Linux',\n        style:`\ndiv.chat>div.message::-webkit-scrollbar{\n    width:12px;\n}\ndiv.chat>div.message::-webkit-scrollbar-track{\n    border-radius:6px;\n    background:#222;\n}\ndiv.chat>div.message::-webkit-scrollbar-thumb{\n    border-radius:6px;\n    background:#444;\n}\ndiv.chat a:active,div.chat a:link,div.chat a:hover,div.chat a:visited{\n    color:lightblue;\n}\ndiv.chat button{\n    background-color:black;\n    color:lightgray;\n}\ndiv.chat>div.message{\n    background-color:black;\n    color:lightgray;\n}\ndiv.chat>div.message a.user{\n    color:lightgray;\n}\ndiv.chat>div.bottom textarea{\n    background-color:black;\n    color:lightgray;\n}\n`,\n    }\n}\ncolorScheme\n","Chat/Room/style.css":"div.chat>div.message{\n    margin-bottom:8px;\n}\ndiv.chat>div.message{\n    padding-right:8px;\n    height:100%;\n    overflow-y:scroll;\n    overflow-wrap:break-word;\n/*\n    In Chrome 57, 'word-break:break-all' is causing\n    'overflow-wrap:break-word' not to break 'a lot of continuous \"！\"'. I\n    considered it as a browser bug.\n\n    It also results in horizontal scroll.\n*/\n    /*word-break:break-all;*/\n    /*text-align:justify;*/\n}\ndiv.chat>div.message>div.top{\n    text-align:center;\n}\ndiv.chat>div.message a.user{\n    color:black;\n    text-decoration:none;\n}\ndiv.chat>div.message img{\n    max-width:60%;\n}\ndiv.chat>div.bottom>textarea{\n    width:calc(100% - 6px);\n    resize:none;\n}\ndiv.chat div.scroll *::-webkit-scrollbar{\n    height:12px;\n}\ndiv.chat div.scroll *::-webkit-scrollbar-track{\n    border-radius:6px;\n    background:#DDD;\n}\ndiv.chat div.scroll *::-webkit-scrollbar-thumb{\n    border-radius:6px;\n    background:#BBB;\n}\n/* start fullscreen */\n/*body:-webkit-full-screen{\n    margin:0;\n    width:100%;\n    height:100%;\n    background-color:white;\n}\nbody:-webkit-full-screen>.chat{\n    padding:8px;\n    width:calc(100% - 16px);\n    height:calc(100% - 16px);\n    background-color:white;\n}*/\n/* end fullscreen */\n","Chat/Room.js":"(async()=>{\n    let\n        [\n            EventEmmiter,\n            Ui,\n            style,\n        ]=await Promise.all([\n            module.repository.althea.EventEmmiter,\n            module.shareImport('Room/Ui.js'),\n            module.get('Room/style.css'),\n        ]),\n        blockSize=16\n    function Room(imageUploader,currentUser,target){\n        EventEmmiter.call(this)\n        this._imageUploader=imageUploader\n        this._currentUser=currentUser\n        this._target=target\n        this._sendFunction=new Promise(set=>\n            Object.defineProperty(this,'send',{set})\n        )\n        this._messages=[]\n        this._getMessagesPromise={}\n        ;(async()=>{\n            await this._getMessages('before')\n            setInterval(()=>this._getMessages('after'),200)\n        })()\n    }\n    Object.setPrototypeOf(Room.prototype,EventEmmiter.prototype)\n    Room.prototype._getMessagesData=async function(mode){\n        let\n            chat=this\n        let doc={\n            function:   'getMessages',\n            target:     (await this._target).id,\n        }\n        if(mode=='before'){\n            doc.after=0\n            doc.before=calcBefore()\n            doc.last=blockSize\n        }else if(mode=='after'){\n            doc.after=calcAfter()\n            doc.before=0\n        }\n        return this._send(doc)\n        function calcBefore(){\n            return chat._messages.length==0?\n                0\n            :\n                chat._messages[0].id\n        }\n        function calcAfter(){\n            return chat._messages.length==0?\n                0\n            :\n                chat._messages[chat._messages.length-1].id+1\n        }\n    }\n    Room.prototype._getMessages=async function(mode='after'){\n        if(this._getMessagesPromise[mode])\n            return\n        this._getMessagesPromise[mode]=this._getMessagesData(mode)\n        try{\n            let res=await this._getMessagesPromise[mode]\n            if(res.length){\n                res.sort((a,b)=>a.id-b.id)\n                if(mode=='before'){\n                    if(this._ui)\n                        this._ui.prepend(res)\n                    this._messages=res.concat(this._messages)\n                }else if(mode=='after'){\n                    if(this._ui)\n                        this._ui.append(res)\n                    this._messages=this._messages.concat(res)\n                    if(res.length)\n                        this.emit('append')\n                }\n            }\n        }catch(e){}\n        delete this._getMessagesPromise[mode]\n    }\n    Room.prototype._sendMessage=async function(message){\n        return this._send({\n            function:   'sendMessage',\n            target:     (await this._target).id,\n            message,\n        })\n    }\n    Room.prototype._send=async function(doc){\n        return(await this._sendFunction)(doc)\n    }\n    Object.defineProperty(Room.prototype,'connectionStatus',{set(val){\n        this._connectionStatus=val\n        if(this._ui)\n            this._ui.connectionStatus=val\n    }})\n    Room.prototype.style=style\n    Object.defineProperty(Room.prototype,'ui',{get(){\n        if(this._ui)\n            return this._ui\n        let ui=new Ui(\n            this._currentUser,\n            this._target\n        )\n        ui.queryOlder=()=>this._getMessages('before')\n        ui.sendMessage=m=>this._sendMessage(m)\n        ui.getSetting=this.getSetting\n        ui.setSetting=(k,v)=>{\n            this.setSetting(k,v)\n            if(k=='colorScheme')\n                ui.changeStyle(v)\n        }\n        ui.playNotificationSound=this.playNotificationSound\n        ui.imageUploader=this._imageUploader\n        ui.connectionStatus=this._connectionStatus\n        if(this.getSetting('colorScheme')==undefined)\n            this.setSetting('colorScheme','default')\n        ui.changeStyle(this.getSetting('colorScheme'))\n        return this._ui=ui\n    }})\n    return Room\n})()\n","Chat.js":"(async()=>{\n    let Room=await module.shareImport('Chat/Room.js')\n    return{\n        Room\n    }\n})()\n","main/chatPage.js":"(async()=>{\n    let[\n        createChatRoom,\n        mainStyle,\n        showConversationList,\n        dom,\n    ]=await Promise.all([\n        module.shareImport('createChatRoom.js'),\n        module.get('style.css'),\n        module.shareImport('showConversationList.js'),\n        module.repository.althea.dom,\n    ])\n    function ChatPage(){\n        this.settings=localStorage.altheaChatSettings?\n            JSON.parse(localStorage.altheaChatSettings)\n        :\n            {notificationSound:0}\n        dom(document.head,\n            this.style=dom('style',mainStyle),\n            this.themeColor=dom('meta',{name:'theme-color'})\n        )\n    }\n    ChatPage.prototype.playSound=function(settings){\n        dom(document.body,dom('audio',{\n            autoplay:true,\n            src:'plugins/althea-chat/main/notification.mp3',\n            onended(e){document.body.removeChild(this)},\n            volume:this.settings.notificationSound,\n        }))\n    }\n    ChatPage.prototype.showConversationList=showConversationList\n    ChatPage.prototype.showChatRoom=function(id){\n        let\n            target=getUser(id),\n            chatRoom=createChatRoom.call(\n                this,\n                target,\n                module.repository.althea.site\n            )\n        notification.call(this,chatRoom,target)\n        content.call(this,chatRoom)\n        async function getUser(id){\n            let site=await module.repository.althea.site\n            return site.getUser(id)\n        }\n    }\n    ChatPage.prototype.setSetting=function(k,v){\n        this.settings[k]=v\n        localStorage.altheaChatSettings=JSON.stringify(this.settings)\n    }\n    async function notification(chat,target){\n        await Promise.all([\n            (async()=>{\n                chat=await chat\n            })(),\n            (async()=>{\n                target=await target\n                await target.load('nickname')\n            })(),\n        ])\n        let\n            tabIsFocused=true,\n            notification=0,\n            unread=0\n        updateTitle()\n        setInterval(updateTitle,1000)\n        chat.on('append',()=>{\n            if(tabIsFocused)\n                return\n            if(unread==0)\n                notification=1\n            unread++\n            this.playSound()\n        })\n        addEventListener('focusin',e=>{\n            tabIsFocused=true\n            unread=0\n        })\n        addEventListener('focusout',e=>{\n            tabIsFocused=false\n        })\n        function updateTitle(){\n            let notiPart=unread==0?'':`${'◯⬤'[notification]} (${unread}) `\n            lazyChangeTitle(`${notiPart}↔ ${target.nickname}`)\n            notification=1-notification\n        }\n        function lazyChangeTitle(s){\n            document.title==s||(document.title=s)\n        }\n    }\n    async function content(chat){\n        chat=await chat\n        let ui=chat.ui\n        dom(this.style,await chat.style)\n        ui.style=s=>{\n            let n=dom.tn(s.content)\n            dom(this.style,n)\n            let color={\n                default:'',\n                gnulinux:'black',\n            }[s.id]\n            this.themeColor.content=color\n            document.body.style.backgroundColor=color\n            return()=>this.style.removeChild(n)\n        }\n        dom(document.body,ui.node)\n        ui.focus()\n        ui.beAppended()\n    }\n    return new ChatPage\n})()\n","main/createChatRoom.js":";(async function createChatRoom(target,site){\n    let[\n        Chat,\n        ImageUploader,\n    ]=await Promise.all([\n        module.repository.Chat,\n        module.repository.althea.ImageUploader,\n    ])\n    let chatRoom=new Chat.Room(\n        new ImageUploader(site),\n        (async()=>(await site).currentUser)(),\n        target\n    )\n    chatRoom.send=async d=>(await site).send(d)\n    chatRoom.getSetting=k=>this.settings[k]\n    chatRoom.setSetting=(k,v)=>this.setSetting(k,v)\n    chatRoom.playNotificationSound=()=>this.playSound()\n    ;(async site=>{\n        site=await site\n        update()\n        addEventListener('offline',update)\n        addEventListener('online',update)\n        function update(){\n            chatRoom.connectionStatus=navigator.onLine?'online':'offline'\n        }\n    })(site)\n    return chatRoom\n})\n","main/style.css":"html{\n    height:100%;\n}\nbody{\n    height:calc(100% - 16px);\n}\na:active,a:link,a:hover,a:visited{\n    color:blue;\n}\n.chat{\n    height:100%;\n    max-width:600px;\n    margin:0 auto;\n}\n.conversationList{\n    height:100%;\n    max-width:600px;\n    margin:0 auto;\n}\n","main/showConversationList.js":"(async()=>{\n    let[\n        dom,\n    ]=await Promise.all([\n        module.repository.althea.dom,\n    ])\n    function createConversation(site,id){\n        let\n            user=site.getUser(id),\n            tc=textContent(id)\n        return{\n            n:dom('div',createLink(id)),\n            order:tc,\n        }\n        async function textContent(id){\n            let u=await user\n            await u.load(['username','nickname'])\n            return u.nickname||u.username\n        }\n        async function createLink(id){\n            return dom('a',async n=>{\n                let u=await user\n                await u.load('username')\n                n.href=`chat/${u.username}`\n                return tc\n            })\n        }\n    }\n    return function(){\n        document.title='Conversations - Chat'\n        let n=dom('div','Conversations:',{className:'conversationList'})\n        ;(async()=>{\n            let[order,site]=await Promise.all([\n                module.repository.althea.order,\n                module.repository.althea.site,\n            ])\n            order.post(\n                (await site.send('getConversations')).map(async id=>{\n                    let c=createConversation(site,id)\n                    return{\n                        n:c.n,\n                        o:await c.order\n                    }\n                }),\n                (a,b)=>n.insertBefore(a.n,b.n),\n                e=>dom(n,e.n),\n                (a,b)=>a.o.localeCompare(b.o)<0\n            )\n        })()\n        dom(document.body,n)\n    }\n})()\n"}).map(([k,v])=>module.static(k,v));;(async()=>{
    ;(await module.importByPath('lib/general.static.js',{mode:1}))(module)
    module.repository.Chat=module.shareImport('Chat.js')
    let[
        chatPage,
    ]=await Promise.all([
        module.shareImport('main/chatPage.js'),
    ])
    module.arguments.userId==undefined?
        chatPage.showConversationList()
    :
        chatPage.showChatRoom(module.arguments.userId)
})()
