
(function (global, $) {
    // simple conf
    var conf = {
        maxRecentDocuments: 10,
    };

    // recent documents list
    var RecentDocuments = {
        docs:   [],
        add:    function (rdoc) {
            if (this.docs.length >= conf.maxRecentDocuments) this.docs.pop();
            this.docs.unshift(rdoc);
            localStorage.setItem("RecentDocuments", JSON.stringify(this.docs));
            this.render();
        },
        load:    function () {
            var stored = localStorage.getItem("RecentDocuments");
            if (stored) this.docs = JSON.parse(stored);
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
    $("#cmd-open").click(function () { RecentDocuments.add({ path: "/foo/bar/test" }); });
    RecentDocuments.load();

})(window, jQuery);
