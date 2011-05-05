
(function (global, $) {
    // simple conf
    var conf = {
        maxRecentDocuments: 10,
    };
    
    // modules
    const fp = require("file-picker"),
          zip = require("zip"),
          url = require("url"),
          windowOpener = require("open-window");
          // sandboxWindow = require("chromeless-sandbox-window");

    // recent documents list
    // XXX same code can be reused for document models
    var RecentDocuments = {
        docs:   [],
        add:    function (rdoc) {
            if (this.docs.length >= conf.maxRecentDocuments) this.docs.pop();
            this.docs.unshift(rdoc);
            this.render();
        },
        load:    function () {
            var stored = localStorage.RecentDocuments;
            this.docs = stored ? JSON.parse(localStorage.RecentDocuments) : [];
            this.render();
        },
        render:    function () {
            var $target = $("#recent-documents");
            $target.empty();
            if (this.docs.length == 0) {
                $target.append("<tr><td class='no-results'>No documents.</td></tr>");
            }
            else {
                this.docs.forEach(function (it, i) {
                    var $tr = $("<tr><td class='recent-doc'></td></tr>");
                    $tr.find("td.recent-doc").text(it.path);
                    $target.append($tr);
                });
            }
        },
    };
    RecentDocuments.load();

    // handle file opening
    $("#cmd-open").click(function (e) {
        var picker = fp.FilePicker("Open Wocument", "multiple");
        picker.show(function (files) {
            if (files === undefined) return;
            files.forEach(function (it) {
                var woc = new Wocument();
                woc.openFromFile(it);
            });
        });
        e.preventDefault();
        // RecentDocuments.add({ path: "/foo/bar/test" }); 
    });


    // Wocument handling
    function Wocument () {
    }
    Wocument.prototype = {
        // jar:file:///Projects/wocuments/wocuments/examples/basic-save-value.woc!/basic-save-value/index.html
        openFromFile:    function (filePath) {
            console.log("### opening for " + filePath);
            var woc = zip.open(filePath);
            this.zip = woc;
            console.log("contents:\n\t" + this.zip.allEntryPaths().join("\n\t"));
            var jarURI = "jar:" + url.fromFilename(filePath) + "!/",
                baseDir = "";
            if (!woc.hasEntry("index.html")) {
                // we assume that everything is in a directory at the root,
                // so we just take the first part of the first entry path and use that
                var paths = woc.allEntryPaths();
                if (!paths.length) throw("Empty Zip archive");
                baseDir = (/^[^\/]+\//.exec(paths[0]))[0];
                jarURI += baseDir;
            }
            this.baseURI = jarURI;
            this.baseDir = baseDir;
            jarURI += "index.html";
            // alert("jarURI=" + jarURI);
            this.openWindow(jarURI);
        },
        openWindow:    function (uri) {
            // XXX note that this is built on a temporary hack that involves 
            // a window that probably isn't properly sandboxed
            var self = this;
            var wocWindow = windowOpener.open({
                url: uri,
                // XXX set these in a better way
                width: 600,
                height: 500,
                resizable: true ,
                menubar: false,
                injectProps: {
                    console: {
                        log: function() {
                            console.log.apply(console, Array.prototype.slice.call(arguments));
                        }
                    },
                    exit: function() {
                        console.log("window.exit() called...");
                        wocWindow.close();
                    },
                    wocument:   new WocumentObject(this),
                },
                onclose:    function () {
                    console.log("close called");
                    self.zip.close();
                },
            });
            this.wocWindow = wocWindow;
        },
    };

    function WocumentObject (woc) {
        this.woc = woc;
        this.dataDirectory = new DataDirectory(woc.baseDir + "data/", woc);
    }
    WocumentObject.prototype = {};
    function DataDirectory (dir, woc) {
        console.log("configured DataDirectory with dir=" + dir);
        this.dir = dir;
        this.woc = woc;
    }
    DataDirectory.prototype = {
        getFileAsJSON:    function (name, cb) {
            console.log("getFileAsJSON for name=" + name);
            var zip = this.woc.zip,
                entry = this.dir + name;
            console.log("entry=" + entry);
            if (zip.hasEntry(entry)) {
                console.log("entry exists");
                cb(JSON.parse(zip.entryAsText(entry)));
                console.log("callback called");
            }
            else {
                console.log("entry does not exist");
                cb(null);
            }
        },
        saveFileAsJSON:    function (name, object) {
            this.woc.zip.addEntryFromText(this.dir + name, JSON.stringify(object));
        },
    };

})(window, jQuery);
