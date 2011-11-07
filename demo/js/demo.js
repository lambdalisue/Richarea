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
        return false;
    };
    return this;
})();
// The script use jQuery but Richarea.js is not jQuery dependent
$(document).ready(function(){
    richarea = new Richarea($('#richarea').get(0));
    richarea.ready(function(){
        richarea.bind('change', function(e){
            // richarea -> preview
            $('#preview').val(this.getValue());
        });
        richarea.bind('change focus keydown keypress click blur', function(e){
            // Update PATH
            var path = richarea.getPath();
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
            this.setValue($('#preview').val());
        });
        // initial update
        richarea.fire('change');
    });
    window.richarea = richarea;
});
