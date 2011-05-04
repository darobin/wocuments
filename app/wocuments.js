
(function (global, $) {
    // simple conf
    var conf = {
        maxRecentDocuments: 10,
    };
    
    // modules
    const fp = require("file-picker"),
          zip = require("zip");

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
        openFromFile:    function (filePath) {
            alert(filePath);
            this.zip = zip.open(filePath);
            alert("contents: " + string);
        },
    };


})(window, jQuery);
