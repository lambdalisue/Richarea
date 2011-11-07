window.commands = (function(){
    this.strong = function(){
        richarea.surroundSelection('<strong>');
    };
    this.em = function(){
        richarea.surroundSelection('<em>');
    };
    this.ins = function(){
        richarea.surroundSelection('<ins>');
    };
    this.del = function(){
        richarea.surroundSelection('<del>');
    };
    this.sub = function(){
        richarea.surroundSelection('<sub>');
    };
    this.sup = function(){
        richarea.surroundSelection('<sup>');
    };
    this.h1 = function(){
        richarea.surroundSelection('<h1>');
    };
    this.h2 = function(){
        richarea.surroundSelection('<h2>');
    };
    this.h3 = function(){
        richarea.surroundSelection('<h3>');
    };
    this.p = function(){
        richarea.surroundSelection('<p>');
    };
    this.pre = function(){
        richarea.surroundSelection('<pre>');
    };
    this.blockquote = function(){
        richarea.surroundSelection('<blockquote>');
    };
    this.unblockquote = function(){
        richarea.unsurroundSelection('<blockquote>');
    };
    this.a = function(){
        var nodelist = [];
        var namelist = [];
        var fn = function(node){
            if(!Richarea.dom.DOMUtils.isDataNode(node)){
                nodelist.push(node);
                namelist.push(node.tagName);
            }
        };
        var defaultValue = '';
        if(richarea.applyToAllUpstreamNodeOfSelection(fn)){
            var index = namelist.indexOf('A');
            if(index != -1){
                exists = nodelist[index];
                defaultValue = exists.getAttribute('href');
            }
        }
        var href = prompt('Please input href URL', defaultValue);
        if(!!(href)){
            richarea.surroundSelection('<a href="'+href+'">');
        }
    };
    this.img = function(){
        var src = prompt('Please input src URL');
        if(!!(src)){
            richarea.replaceSelection('<img src="'+src+'">');
        }
    };
    this.hr = function(){
        richarea.replaceSelection('<hr>');
    };
    this.indent = function(){
        richarea.execCommand('indent');
    };
    this.outdent = function(){
        richarea.execCommand('outdent');
    };
    this.ul = function(){
        richarea.execCommand('insertUnorderedList');
    };
    this.ol = function(){
        richarea.execCommand('insertOrderedList');
    };
    this.table = function(){
        var raws, cols, caption;
        rows = prompt('Please input number of row');
        cols = prompt('Please input number of column');
        caption = prompt('(Optional) Pleaes input table caption');
        var tds = [];
        for(var i=0; i<cols; i++){
            tds.push('    <td>XXX</td>');
        }
        var trs = [];
        for(var i=0; i<rows; i++){
            trs.push("  <tr>\n"+tds.join('\n')+"\n  </tr>");
        }
        caption = !!(caption) ? "\n<caption>"+caption+"</caption>" : ''
        table = "<table>"+caption+"\n"+trs.join('\n')+"\n</table>"
        richarea.replaceSelection(table);
    };
    return this;
})();
// The script use jQuery but Richarea.js is not jQuery dependent
$(document).ready(function(){
    window.richarea = new Richarea($('#richarea').get(0));
    richarea.ready(function(){
        richarea.bind('change', function(e){
            // richarea -> preview
            $('#preview').val(richarea.getValue());
        });
        richarea.bind('change focus keydown keypress click blur', function(e){
            // Update PATH
            var path = richarea.getUpstreamNodeTagNameListOfSelection();
            var names = [
                'h1', 'h2', 'h3', 'strong', 'em', 'ins', 'del', 'sup', 'sub'
            ];
            for(var i=0; i<names.length; i++){
                var name = names[i];
                if(path.indexOf(name.toUpperCase()) != -1){
                    $('li.button.'+name).addClass('active');
                } else {
                    $('li.button.'+name).removeClass('active');
                }
            }
            $('#path').empty().append(path.join(" > "));
        });
        $('#preview').bind('blur', function(e){
            // preview -> richarea
            richarea.setValue($('#preview').val());
        });
        // initial update
        richarea.fire('change');
    });
});
