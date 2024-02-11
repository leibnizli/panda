var fontCarrier = require('font-carrier');
var fs = require("fs");
// var fontCarrier = {};
// var fs = {};
//drag
$(document).on({
    dragleave: function(e) {
        e.preventDefault();
    },
    drop: function(e) {
        e.preventDefault();
    },
    dragenter: function(e) {
        e.preventDefault();
    },
    dragover: function(e) {
        e.preventDefault();
    }
});

// Create an empty menubar
var menu = new nw.Menu({type: 'menubar'});
menu.createMacBuiltin("Panda");
// Create a submenu as the 2nd level menu
var submenu = new nw.Menu();
const issue = new nw.MenuItem({ label: 'Report An Issue..' });
issue.click = function () {
  require('nw.gui').Shell.openExternal( "https://github.com/leibnizli/panda/issues" );
}

submenu.append(issue);

const website = new nw.MenuItem({ label: 'Website' })
website.click = function () {
  require('nw.gui').Shell.openExternal( "https://arayofsunshine.dev/" );
}
submenu.append(website);

const buy = new nw.MenuItem({ label: 'Buy Me A Coffee' })
buy.click = function () {
  require('nw.gui').Shell.openExternal( "https://buy.arayofsunshine.dev/" );
}
submenu.append(buy);
// Create and append the 1st level menu to the menubar
menu.append(new nw.MenuItem({
  label: 'Help',
  submenu: submenu
}));
// Assign it to `window.menu` to get the menu displayed
nw.Window.get().menu = menu;
//app
var defaults = {
    index: 0
}

function App(options) {
    this.options = $.extend(true, defaults, options);
    this.index = this.options.index;
    this.status = "";
    this.unicodeNum = 1000,
        this.isFirst = true;
    this.bd = $("#app-bd");
    this.nav = $("#app-nav");
    this.data = {};
    this.init();
}
App.prototype = {
    init: function() {
        var self = this;
        this._action(this.index)
        this.bd.on("dragenter", ".ui-font-area", function(e) {
            $(this).addClass("active");
        });
        this.bd.on("dragleave", ".ui-font-area", function(e) {
            $(this).removeClass("active");
        });

        this.bd.on("drop", ".ui-font-area", function(e) {
            var files = e.originalEvent.dataTransfer.files,
                fontList = self.bd.find(".ui-font-list"),
                fontArea = $(this);
            //ui-font-main
            if (self.isFirst) {
                fontArea.addClass("ui-font-area-have");
                self.bd.find(".ui-font-main").show();
            }
            if (self.status === "merge") {
                for (var i = 0; i < files.length; i++) {
                    if (/image\/svg/.test(files[i].type)) {
                        self.isFirst = false;
                        var unicodeNum = self._getunicode();
                        self.data[self.status].push({
                            unicode: '&#x' + unicodeNum + ';',
                            glyph: fs.readFileSync(files[i].path).toString(),
                            path: files[i].path
                        });
                        var file = files[i];
                        fontList.prepend('<li class="ui-font-item">\
                            <div class="ui-font-operation"><span class="ui-font-del" title="Delete the current icon">&#xe607;</span></div>\
                            <div class="ui-font-pic"><img width="45" height="45" src="file://' + file.path + '" alt=""></div>\
                            <div class="ui-font-info">\
                                <div class="ui-font-name"><span class="ui-font-name-file">' + file.name + '</span><span class="ui-font-name-unicode">&amp;#x' + unicodeNum + ';</span></div>\
                                <div class="ui-font-size">' + (parseInt(file.size) / 1024).toFixed(2) + 'kb</div>\
                            </div>\
                        </li>');
                    }
                }
            } else if (self.status === "add") {
                if (self.isFirst) {
                    var file = files[0];
                    if (!/ttf/.test(file.name)) {
                        return;
                    }
                    self.isFirst = false;
                    //var importPath = file.path.replace(/[^/\\]+$/, "");
                    file.path.replace(/[^/\\]+$/, function(a) {
                        fontArea.find(".ui-font-area-txt").html('Current file：' + a + '<br>Drag one or more SVG files to start to modify');
                    });
                    var glyphs = fontCarrier.transfer(file.path).allGlyph();
                    for (key in glyphs) {
                        var svg = glyphs[key].toSvg();
                        self.data[self.status].push({
                            unicode: key,
                            glyph: svg,
                            path: file.path
                        });
                        if (key == "&#x78;") {
                            continue;
                        }
                        fontList.prepend('<li class="ui-font-item">\
                            <div class="ui-font-operation"><span class="ui-font-replace" title="Replace">&#xe604;<input class="ui-font-replace-input" type="file" accept=".svg"/></span><span class="ui-font-export" title="Export the current icon is SVG format">&#xe600;</span><span class="ui-font-del" title="Delete the current icon">&#xe607;</span></div>\
                            <div class="ui-font-pic"><img width="45" height="45" src="data:image/svg+xml;base64,' + new Buffer(svg).toString('base64') + '" alt=""></div>\
                            <div class="ui-font-info">\
                                <div class="ui-font-name"><span class="ui-font-name-unicode">&amp;' + key.slice(1) + '</span></div>\
                            </div>\
                        </li>');
                    }
                } else {
                    for (var i = 0; i < files.length; i++) {
                        if (!/image\/svg/.test(files[i].type)) {
                            continue;
                        }
                        var unicodeNum = self._getunicode(),
                            len = self.data[self.status].length;
                        for (var j = len; j > 0; j--) {
                            var snapNum = self.data[self.status][j - 1]['unicode'].replace(/\D/g, function(a) {
                                return ""
                            });
                            snapNum = Number(snapNum);
                            if (snapNum >= unicodeNum) {
                                self.unicodeNum = snapNum;
                                unicodeNum = self._getunicode();
                                break;
                            }
                        }
                        self.data[self.status].push({
                            unicode: '&#x' + unicodeNum + ';',
                            glyph: fs.readFileSync(files[i].path).toString(),
                            path: files[i].path
                        });
                        var file = files[i];
                        fontList.prepend('<li class="ui-font-item">\
                            <div class="ui-font-operation"><span class="ui-font-del" title="Delete the current icon">&#xe607;</span></div>\
                            <div class="ui-font-pic"><img width="45" height="45" src="file://' + file.path + '" alt=""></div>\
                            <div class="ui-font-info">\
                                <div class="ui-font-name"><span class="ui-font-name-file">' + file.name + '</span><span class="ui-font-name-unicode">&amp;#x' + unicodeNum + ';</span></div>\
                                <div class="ui-font-size">' + (parseInt(file.size) / 1024).toFixed(2) + 'kb</div>\
                            </div>\
                        </li>');
                    }
                }
            } else if (self.status === "cut") {
                var file = files[0];
                if (!/ttf/.test(file.name)) {
                    return;
                }
                self.isFirst = false;
                file.path.replace(/[^/\\]+$/, function(a) {
                    fontArea.find(".ui-font-area-txt").html('Files are about to cut：' + a);
                });
                self.data[self.status].push({
                    path: file.path
                });
            }
        });
        //nav
        this.nav.on("click", "li", function(e) {
            var index = $(this).index();
            self._action(index);
        });
        //del
        this.bd.on("click", ".ui-font-del", function(e) {
            self._deleteFontView(this)
        });
        //export
        this.bd.on("click", ".ui-font-export", function(e) {
            self._exportIcon(this)
        });
        //replace
        this.bd.on("change", ".ui-font-replace-input", function(e) {
            self._replaceIcon(e,this)
        });
        var isAllowRender = true;
        this.bd.on("click", ".ui-font-command-render", function(e) {
            e.preventDefault();
            var renderBtn = $(this);
            if (isAllowRender) {
                isAllowRender = false;
                //名字匹配矫正
                var data = self.data[self.status];
                if (data.length > 0) {
                    renderBtn.addClass("disable").html("Export...");
                    var font;
                    //C:\Users\Administrator\Desktop\hebing.svg
                    //C:\Users\Administrator\Desktop\iconfont-lvxing.svg
                    var exportPath = data[0].path.replace(/[^/\\]+$/, "");
                    var dir = exportPath + '/demo';
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    if (self.status == "cut") {
                        var val = self.bd.find(".ui-font-textarea").val();
                        font = fontCarrier.transfer(data[0].path);
                        font.min(val);
                    } else {
                        font = fontCarrier.create();
                        for (var i = 0; i < data.length; i++) {
                            font.setSvg(data[i].unicode, data[i].glyph);
                        }
                    }
                    self._renderFile(dir);
                    font.output({
                        path: dir + '/iconfont/'
                    })
                    renderBtn.removeClass("disable").html("生成");
                    isAllowRender = true;
                }
            }

        });
    },
    _renderFile: function(dir) {
        var data = this.data[this.status],
            html = '';
        fs.writeFileSync(dir + '/demo.css', '@font-face{font-family:"iconfont";src:url("iconfont.eot");src:url("iconfont.eot?#iefix") format("embedded-opentype"),url("iconfont.woff") format("woff"),url("iconfont.ttf") format("truetype"),url("iconfont.svg#iconfont") format("svg")}.iconfont{font-family:"iconfont"!important;font-size:16px;font-style:normal;-webkit-font-smoothing:antialiased;-webkit-text-stroke-width:.2px;-moz-osx-font-smoothing:grayscale}*{margin:0;padding:0;list-style:none}body,h1,h2,h3,h4,h5,h6,hr,p,blockquote,dl,dt,dd,ul,ol,li,pre,form,fieldset,legend,button,input,textarea,th,td{margin:0;padding:0}body,button,input,select,textarea{font:12px/1.5 tahoma,arial,sans-serif}h1,h2,h3,h4,h5,h6{font-size:100%}address,cite,dfn,em,var{font-style:normal}code,kbd,pre,samp{font-family:courier new,courier,monospace}small{font-size:12px}ul,ol{list-style:none}a{text-decoration:none}a:hover{text-decoration:underline}legend{color:#000}fieldset,img{border:0}button,input,select,textarea{font-size:100%}table{border-collapse:collapse;border-spacing:0}.ks-clear:after,.clear:after{content:"";display:block;height:0;clear:both}.ks-clear,.clear{*zoom:1}.main{padding:30px 100px}.main h1{font-size:36px;color:#333;text-align:left;margin-bottom:30px;border-bottom:1px solid #eee}.helps{margin-top:40px}.helps pre{padding:20px;margin:10px 0;border:solid 1px #e7e1cd;background-color:#fffdef;overflow:auto}.icon_lists li{float:left;width:100px;height:180px;text-align:center}.icon_lists .icon{font-size:42px;line-height:100px;margin:10px 0;color:#333;-webkit-transition:font-size .25s ease-out 0s;-moz-transition:font-size .25s ease-out 0s;transition:font-size .25s ease-out 0s}.icon_lists .icon:hover{font-size:100px}');
        if (this.status === "cut") {
            fs.writeFileSync(dir + '/demo.html', '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>IconFont</title><link rel="stylesheet" href="demo.css"></head><body><h1 class="iconfont">' + this.bd.find(".ui-font-textarea").val() + '</h1></body></html>');
        } else {
            for (var i = 0; i < data.length; i++) {
                if (data[i].unicode === "&#x78;") {
                    continue;
                }
                html += '<li><i class="icon iconfont">' + data[i].unicode + '</i><div class="code">&amp;' + data[i].unicode.slice(1) + '</div></li>'
            }
            fs.writeFileSync(dir + '/demo.html', '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>IconFont</title><link rel="stylesheet" href="demo.css"></head><body><div class="main"><h1>IconFont</h1><ul class="icon_lists clear">' + html + '</ul><div class="helps">Step 1: Use font-face to declare fonts<pre>\n@font-face {\n    font-family: "iconfont";\n    src: url("iconfont.eot");\n    src: url("iconfont.eot?#iefix") format("embedded-opentype"),\n    url("iconfont.woff") format("woff"),\n    url("iconfont.ttf") format("truetype"),\n    url("iconfont.svg#iconfont") format("svg");\n}</pre>\nStep 2: Define the style of using iconfont\n' +
              '<pre>.iconfont {\n    font-family:"iconfont" !important;\n    font-size:16px;\n    font-style:normal;\n    -webkit-font-smoothing: antialiased;\n    -webkit-text-stroke-width: 0.2px;\n    -moz-osx-font-smoothing: grayscale;\n}</pre>Step 3: Select the corresponding icon and get font coding, apply to the page<pre>&lt;i class="iconfont"&gt;&amp;#x33;&lt;/i&gt;</pre></div></div></body></html>');
        }
    },
    _getunicode: function() {
        return this.unicodeNum += 1;
    },
    _deleteFontView: function(el) {
        var $item = $(el).closest(".ui-font-item");
        var data = this.data[this.status];
        data.splice(data.length - 1 - $item.index(), 1);
        $item.remove();
    },
    _exportIcon: function(el) {
        var $item = $(el).closest(".ui-font-item");
        var data = this.data[this.status];
        data = data[data.length - 1 - $item.index()];
        //data.splice(data.length - 1 - $item.index(), 1);
        var exportPath = data.path.replace(/[^/\\]+$/, "")
        fs.writeFileSync(exportPath + '/' + data.unicode.slice(2,7) + '.svg', data.glyph);
    },
    _replaceIcon: function(e,el) {
        var $item = $(el).closest(".ui-font-item");
        var path = "file:///"+$(el).val();
        $item.find("img").attr("src", path)
        var data = this.data[this.status];
        data = data[data.length - 1 - $item.index()];
        data.path = path
        data.glyph = fs.readFileSync($(el).val()).toString()
    },
    _action: function(i) {
        localStorage.nav = i;
        var el = this.nav.find("li").eq(i);
        $(el).addClass("active").siblings().removeClass("active");
        this.status = $(el).data("action");
        this.bd.attr('class', 'app-bd ' + this.status);
        this.isFirst = true;
        this._renderView(this.status);
        this._initData();
    },
    _initData: function() {
        var self = this;
        this.unicodeNum = 1000;
        this.nav.find("li").each(function(i, el) {
            var action = $(el).data("action");
            self.data[action] = [];
        });
    },
    _renderView: function(status) {
        var self = this;
        var commonHtml = '<div class="ui-font-main">\
                    <ul class="ui-font-list"></ul>\
                    <div class="result"></div>\
                    <div class="ui-font-command">\
                        <button class="ui-btn ui-font-command-render">Generate</button>\
                    </div>\
                </div>';
        var view = {
            merge: '<div class="ui-font">\
                <div class="ui-font-area">\
                    <span class="icon-yijieshou ui-font-area-txt">Drag one or more SVG files to this</span>\
                </div>' + commonHtml + '</div>',
            add: '<div class="ui-font">\
                <div class="ui-font-area">\
                    <span class="icon-yijieshou ui-font-area-txt">Drag and drop a font (.ttf) file to be modified <br/> If the file is large, you need to wait patiently</span>\
                </div>' + commonHtml + '</div>',
            cut: '<div class="ui-font">\
                    <div class="ui-font-area">\
                        <span class="icon-yijieshou ui-font-area-txt">Drag and drop a font (.ttf) file to this <br/> If the file is large, you need to wait patiently</span>\
                    </div>\
                    <div class="ui-font-main" style="display:none">\
                        <textarea class="ui-font-textarea" placeholder="Enter the text you need to keep here"></textarea>\
                        <div class="result"></div>\
                        <div class="ui-font-command">\
                            <button class="ui-btn ui-font-command-render">Generate</button>\
                        </div>\
                    </div>\
                </div>',
        }
        this.bd.html(view[status]);
    }
}
var initIndex;
if (localStorage.getItem("nav")) {
    initIndex = localStorage.getItem("nav");
} else {
    initIndex = 0;
}
new App({
    index: initIndex
});
