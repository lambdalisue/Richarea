******************************
 Richarea
******************************

Cross browser richarea (iframe) munipulator script written in CoffeeScript

Working Demo is available on http://demos.richarea.hashnote.net/

:Author: Alisue (lambdalisue@hashnote.net)
:License: MIT License
:Url: http://github.com/lambdalisue/Richarea
:Version: 0.1.0

How to use
====================
First you have to include ``richarea.min.js`` on your HTML. HTML looks like below::
    
    <html>
        <head>
            <meta charset="utf-8">
            <script type="text/javascript" src="https://raw.github.com/lambdalisue/Richarea/master/lib/richarea.min.js"></script>
            <!-- optional -->
            <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
            <!-- /optional -->
        </head>
        <body>
            <iframe id="richarea">
            When I find myself in times of trouble
            Mother Mary comes to me
            Speaking words of wisdom, let it be.
            And in my hour of darkness
            She is standing right in front of me
            Speaking words of wisdom, let it be.
            Let it be, let it be.
            Let it be, let it be.
            Whisper words of wisdom, let it be.
            </iframe>
        </body>
    </html>
                                                  
CoffeeScript with jQuery + Firebug::              
    
    <script type="text/javascript" src="http://jashkenas.github.com/coffee-script/extras/coffee-script.js"></script>
    <script type="text/coffeescript">
        $(->
            richarea = new Richarea $('#richarea')        
            console.log richarea.getValue()               
            richarea.bold()
            richarea.italic()
            richarea.heading(1)
            # ...whatever
        )
    </script>

JavaScript with Firebug::

    <script type="text/javascript">
        $(function(){
            var richarea = document.getElementById('richarea');
            richarea = new Richarea(richarea);
            console.log(richarea.getValue());
            richarea.bold();
            richarea.italic();
            richarea.heading(1);
            // ...whatever
        });
    </script>

References
====================
-   http://help.dottoro.com/ljcvtcaw.php
-   http://wiki.bit-hive.com/tomizoo/pg/JavaScript%20Range%A4%CE%BB%C8%A4%A4%CA%FD
-   http://www.mozilla-japan.org/editor/midas-spec.html
-   https://bugzilla.mozilla.org/show_bug.cgi?id=297494
