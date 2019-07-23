/**
 * @license jQuery paging plugin v1.1.1 21/06/2014
 * http://www.xarg.org/2011/09/jquery-pagination-revised/
 *
 * Copyright (c) 2011, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
define(["jquery"], function($) {
    $["fn"]["easyPaging"] = function(num, o) {

        if (!$["fn"]["paging"]) {
            return this;
        }

        // Normal Paging config
        var opts = {
            "perpage": 10,
            "elements": 0,
            "page": 1,
            "format": "",
            "lapping": 0,
            "onSelect": function() {
            }
        };

        $["extend"](opts, o || {});

        var $li = $("li", this);

        var masks = {};

        $li.each(function(i) {
            if (0 === i) {
              masks.first = this.innerHTML;
              opts.format += "[";
            } else if (1 === i) {
                masks.prev = this.innerHTML; 
                opts.format += "<";
            } else if (i + 1 === $li.length -1){
                masks.next = this.innerHTML; 
                opts.format += ">";
            } else if (i + 1 === $li.length) {                
                masks.last = this.innerHTML;                
                opts.format +="]";
            } else {
                masks[i-1] = this.innerHTML.replace(/#[nc]/, function(str) {
                    opts["format"] += str.replace("#", "");
                    return "([...])";
                });
            }
        });

        opts["onFormat"] = function(type) {
            var value = "";
            switch (type) {
                case 'block':
                 		value = masks[this["pos"]].replace("([...])", this["value"]);
                    if (!this['active'])
                        return '<li class="page-item">' + value + '</li>';
                    if (this["page"] !== this["value"])
                        return '<li class="page-item"><a class="page-link" href="#' + this["value"] + '">' + value + '</a></li>';
                    return '<li class="page-item active" ><a class="page-link">' + value + '</a></li>';
                case 'next':
                    if (!this['active'])
                        return '<li class="page-item"><a class="page-link"  href="#">' + masks[type] + '</a></li>';
                    return '<li class="page-item"><a class="page-link"  href="#' + this["value"] + '">' + masks[type] + '</a></li>';
                case 'prev':
                    if (!this['active'])
                        return '<li class="page-item"><a class="page-link"  href="#">' + masks[type] + '</a></li>';
                    return '<li class="page-item"><a class="page-link" href="#' + this["value"] + '">' + masks[type] + '</a></li>';
                case 'first':
                    if (!this['active'])
                      return '<li class="page-item"><a class="page-link"  href="#">' + masks[type] + '</a></li>';
                    return '<li class="page-item"><a class="page-link" href="#' + this["value"] + '">' + masks[type] + '</a></li>';
                case 'last':
                    if (!this['active'])
                      return '<li class="page-item"><a class="page-link"  href="#">' + masks[type] + '</a></li>';
                    return '<li class="page-item"><a class="page-link" href="#' + this["value"] + '">' + masks[type] + '</a></li>';
            }
        };

        $(this)["paging"](num, opts);
        
        return this;
    };

});
