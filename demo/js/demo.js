// The script use jQuery but Richarea.js is not jQuery dependent
$(document).ready(function(){
    window.richarea = new Richarea($('#richarea').get(0));
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
        richarea.bind('change', forwardUpdate);
        richarea.bind('change focus keydown keypress click', function(e){
            var path = richarea.getPath();
            $('#path').empty().append(path.join(" > "));
        });
        $('#preview').bind('blur', reverseUpdate);
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
window.info = function(){
    var getSelection, selection, range;
    getSelection = function(){
        var selection, iframe;
        iframe = $('#richarea').get(0);
        if (window.getSelection !== null && typeof window.getSelection === 'function') {
            selection = iframe.contentWindow.getSelection();
        } else {
            selection = new W3CSelection(iframe.contentWindow.document);
        }
        return selection;
    };
    selection = getSelection();
    range = selection.getRangeAt(0);
    if (window.console !== null){
        console.group('Selected Range Information');
        console.log('Object: ', range);
        console.log('startContainer: ', range.startContainer);
        console.log('startOffset: ', range.startOffset);
        console.log('endContainer: ', range.endContainer);
        console.log('endOffset: ', range.endOffset);
        console.groupEnd();
    }
};
window.clear = function(){
    richarea.setValue('');
};

