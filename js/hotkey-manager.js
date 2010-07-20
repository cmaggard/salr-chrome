// Copyright (c) 2009, Scott Ferguson
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the software nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY SCOTT FERGUSON ''AS IS'' AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL SCOTT FERGUSON BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function HotKeyManager() {
    /*****************
     N - Next Post
     P/M - Previous Post
     J - Next Page
     K/H - Previous Page
     O - Reanchor thread
     Q - Quick Quote current post
     E - Quick Edit current post
     R - Quick Reply current thread
    *******************/
    this.bindHotKeys();
    this.current_post = this.findFirstUnreadPost();

    this.thread_post_size = jQuery('div#thread > table.post').size();
}

HotKeyManager.prototype.bindHotKeys = function() {
    var that = this;

    jQuery(document).keypress(function(event) {
        var quick_reply_block = false;

        if (findCurrentPage() == 'showthread.php') {
            if (quickReply.isExpanded() || quickReply.isVisible()) {
                quick_reply_block = true;
            }
        }

        if (!quick_reply_block) {
            switch(event.keyCode) {
                case 110:
                    // Next post
                    that.nextPost();
                    break;
                case 112:
                case 109:
                    // Previous post
                    that.previousPost();
                    break;
                case 106:
                    // Next page
                    that.nextPage();
                    break;
                case 107:
                case 104:
                    // Previous page
                    that.previousPage();
                    break;
                case 111:
                    // Re-anchor thread
                    that.anchorThread();
                    break;
                case 113:
                    // Quick quote current post
                    that.quoteCurrentPost();
                    break;
                case 101:
                    // Quick edit current post
                    break;
                case 114:
                    // TODO: Conditionalize on quick reply being enabled
                    that.displayQuickReply();
                    break;
                case 27:
                    // TODO: Conditionalize on quick reply being enabled
                    that.hideQuickReply();
                    break;
            }
        }
    });
};

HotKeyManager.prototype.findFirstUnreadPost = function() {
    var index = 0;
    var count = 0;

    jQuery('div#thread > table.post').each(function() {
        var post = jQuery('tr', this);

        if (post.hasClass('seen1') || post.hasClass('seen2')) {
            index = count;
        }

        count++;
    });

    return index;
};

HotKeyManager.prototype.nextPage = function() {
    this.pageCount = countPages();

    switch(findCurrentPage()) {
        case 'forumdisplay.php':
        case 'showthread.php':
            this.rootPageType = (findCurrentPage() == 'forumdisplay.php') ? 'forumid' : 'threadid';
            this.basePageID = findForumID();
            this.currentPage = Number(jQuery('span.curpage').html());
            if (this.currentPage <= 0)
                this.currentPage = 1;
            if (this.currentPage < this.pageCount)
                jumpToPage(this.rootPageType, this.basePageID, this.currentPage + 1);
            break;
    }
};

HotKeyManager.prototype.previousPage = function() {
    this.pageCount = countPages();

    switch(findCurrentPage()) {
        case 'forumdisplay.php':
        case 'showthread.php':
            this.rootPageType = (findCurrentPage() == 'forumdisplay.php') ? 'forumid' : 'threadid';
            this.basePageID = findForumID();
            this.currentPage = Number(jQuery('span.curpage').html());
            if (this.currentPage <= 0)
                this.currentPage = 1;
            if (this.currentPage > 1)
                jumpToPage(this.rootPageType, this.basePageID, this.currentPage - 1);
            break;
    }
};

HotKeyManager.prototype.nextPost = function() {
    if (!findCurrentPage() == 'showthread.php') {
        return;
    }

    if (this.current_post < (this.thread_post_size - 1)) {
        this.current_post++;
    }

    var post = jQuery('div#thread > table.post');
    var previous_post = post.eq(this.current_post - 1);
    var current_post = post.eq(this.current_post);
    previous_post.css('border', '1px solid #c1c1c1');
    current_post.css('border', '2px dashed #aaa');

    jQuery(window).scrollTop(current_post.offset().top);
};

HotKeyManager.prototype.previousPost = function() {
    if (!findCurrentPage() == 'showthread.php') {
        return;
    }

    if (this.current_post > 0) {
        this.current_post--;
    }

    var post = jQuery('div#thread > table.post');
    var previous_post = post.eq(this.current_post + 1);
    var current_post = post.eq(this.current_post);
    previous_post.css('border', '1px solid #c1c1c1');
    current_post.css('border', '2px dashed #aaa');

    jQuery(window).scrollTop(current_post.offset().top);
};

HotKeyManager.prototype.anchorThread = function() {
    if (!findCurrentPage() == 'showthread.php') {
        return;
    } else if (this.current_post == -1) {
        return;
    }

    var post = jQuery('div#thread > table.post').eq(this.current_post);

    jQuery(window).scrollTop(post.offset().top);
};

HotKeyManager.prototype.quoteCurrentPost = function() {
    if (this.current_post == -1) {
        return;
    }

    var current_post = jQuery('div#thread > table.post').eq(this.current_post);
    var username = jQuery('tr > td.userinfo > dl > dt.author', current_post).html();
    // Query for the quote
    var quote = jQuery('tr > td.postbody', current_post).clone();

    quickReply.appendQuote(username, quote);
    quickReply.show();
};

HotKeyManager.prototype.displayQuickReply = function() {
    if (findCurrentPage() == 'showthread.php') {
        quickReply.show();
    }
};

HotKeyManager.prototype.hideQuickReply = function() {
    if (findCurrentPage() == 'showthread.php') {
        quickReply.hide();
    }
};
