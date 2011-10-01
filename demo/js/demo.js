// The script use jQuery but Richarea.js is not jQuery dependent
$(document).ready(function(){
    window.richarea = new Richarea($('#richarea'));
    // define update event callback
    forwardUpdate = function(){
        var $$ = $(richarea.raw.body);
        $('#preview').val($$.html());
    };
    reverseUpdate = function(){
        var $$ = $('#preview');
        richarea.setValue($$.val());
    };
    // bind events
    richarea.ready(function(){
        $(richarea.raw.body).bind('keypress change click blur enter', forwardUpdate);
        $('#preview').bind('keypress change click blur enter', reverseUpdate);
        $('#toolbar li a.do').click(function(){
            var $$ = $(this);
            info();
            richarea.execCommand($$.attr('do'), $$.attr('arg'));
            forwardUpdate();
        });
        // initial update
        forwardUpdate();
    });
});
window.getSelection = function(){
    var selection, iframe;
    iframe = $('#richarea').get(0);
    if (iframe.contentWindow.getSelection !== null) {
        selection = iframe.contentWindow.getSelection();
    } else {
        selection = new W3CSelection(iframe.contentWindow.document);
    }
    return selection;
};
window.info = function(){
    var selection, range;
    selection = getSelection();
    range = selection.getRangeAt(0);
    console.group('Selected Range Information');
    console.log('Object: ', range);
    console.log('startContainer: ', range.startContainer);
    console.log('startOffset: ', range.startOffset);
    console.log('endContainer: ', range.endContainer);
    console.log('endOffset: ', range.endOffset);
    console.groupEnd();
};
window.clear = function(){
    richarea.setValue('');
};

