     requirejs.config({
         baseUrl: '../../',
         paths: {
             'EpicEditor':          'components/EpicEditor/epiceditor/js/epiceditor.min',
             'markdown':            'components/markdown/lib/markdown',
             'ladda':               'components/Ladda/dist/ladda.min',
             'dropkick':            'components/jquery-dropkick2/jquery.dropkick-1.0.0',
             'Ladda':               'components/Ladda/dist/ladda.min',
             'jquery-autosize':     'components/jquery-autosize/jquery.autosize',
             'mixitup':             'components/mixitup/jquery.mixitup.min',
             'jquery':              '//code.jquery.com/jquery-1.9.1',
             'jquery.migrate':      '//code.jquery.com/jquery-migrate-1.2.1',
             'jqueryui':            '//code.jquery.com/ui/1.10.3/jquery-ui',
             'history':             'components/history',
             'history.js':          'components/history',
             'spin':                'components/spin.js/dist/spin',
             'jquery.qtip':         'components/qtip2/basic/jquery.qtip',
             'sammy':               'components/sammy/lib/sammy',
             'sammy.haml':          'components/sammy/lib/plugins/sammy.haml',
             'sammy.title':         'components/sammy/lib/plugins/sammy.title',
             'haml':                'components/haml/lib/haml',
             'browser':             'components/jquery.browser/jquery.browser.min',
             'utils':               'app/scripts/utils',
             'highlight':           'app/lib/highlight.js/highlight.pack',
             'autosize':            'components/jquery-autosize/jquery.autosize.min',
             'nprogress':           'components/nprogress/nprogress',
             'noty':                'components/noty/js/noty/jquery.noty',
             'noty-layout':         'components/noty/js/noty/layouts/bottom',
             'noty-layout-left':    'components/noty/js/noty/layouts/bottomLeft',
             'noty-theme':          'components/noty/js/noty/themes/default',
             'qtip2':               'app/lib/qtip/jquery.qtip.min',
             'imagesloaded':        'app/lib/qtip/imagesloaded.min',
             'eventEmitter':        'components/eventEmitter/EventEmitter.min',
             'eventie':             'components/eventie/eventie',
             'tabulous':            'components/tabulous/demo/src/tabulous.min',
             'file-upload':         'js/jquery.fileupload',
             'file-upload-ui':      'js/jquery.fileupload-ui',
             'iframe-transport':    'js/jquery.iframe-transport',
             'tmpl':                'components/blueimp-tmpl/js/tmpl.min'
        },
         shim: {
             'file-upload': {
                 deps: ['jquery', 'jqueryui', 'file-upload-ui', 'iframe-transport', 'tmpl']
             },/*
             'file-upload-ui': {
                 deps: ['file-upload']
             },*/
             'dropkick': {
                 deps: ['jquery']
             },
             'browser': {
                 deps: ['jquery']
             },
             'jquery.migrate': {
                 deps: ['jquery']
             },
             'utils': {
                 deps: ['jquery']
             },
             'autosize': {
                 deps: ['jquery']
             },
             'sammy.haml': {
                 deps: ['haml']
             },
             'sammy.title': {
                 deps: ['sammy']
             },
             'nprogress': {
                 deps: ['jquery']
             },
             'mixitup': {
                 deps: ['jquery']
             },
             'noty': {
                 deps: ['jquery']
             },
             'noty-layout': {
                 deps: ['noty']
             },
             'noty-layout-left': {
                 deps: ['noty-layout']
             },
             'noty-theme': {
                 deps: ['noty-layout']
             },
             'qtip2': {
                 deps: ['jquery']  
             },
             'tabulous': {
                 deps: ['jquery']  
             },
             'jqueryui': {
                 deps: ['jquery']
             }
         }

     });
     requirejs(['jquery', 'haml', 'nprogress', 'noty', 'noty-layout','noty-layout-left', 'noty-theme', 'highlight', 'qtip2', 'jqueryui'], 
                        function($, haml, np, notym, notyl, notyll, notyt, hlj, qtip, ui) {
         $.cart = [];window.haml = haml;
         $('#login').qtip({
             content: '<h2>Log In</h2><form action="/login" method="post"><div><label>Username</label><input name="username" type="text"></div><div><label>Password</label><input name="password" type="password"></div><div><input value="Log In" type="submit"></div></form>',
             show: 'click',
             hide: 'unfocus',
             style: 'qtip-dark qtip-rounded',
             position: {
                 my: 'top center',
                 at: 'bottom center'
             }
         })
         NProgress.start();
         requirejs(['utils', 'sammy', 'sammy.haml', 'browser', 'markdown', 'mixitup'], function(utils, sammy, shaml, browser, markdow, mixitup) {
             var addCss = function(url) {
                 $('<link>').appendTo($('head')).attr({
                     type: 'text/css',
                     rel: 'stylesheet'
                 }).attr('href', url);
             };
             NProgress.inc();
             var app = sammy('#main', function() {
                 var self = this;
                 self.use(shaml);
                    
                self.get('/', function(context) {
                     NProgress.inc();
                     $.ajax({
                         type: "GET",
                         url: "/ajax/getmods/?sort=name",
                         error: function(err) {
                             throw err;
                         },
                         success: function(mods) {
                             var grid = $('#Grid');
                             NProgress.inc();
                             var content = '';
                             $.each(mods, function(i) {
                                var mod = mods[i];
                                var sum = mod.summary;
                                var l = mod.summary.length;
                                if(l > 160) {
                                    
                                    sum = sum.substring(0, 150);
                                    sum = sum.trim() + '...' + sum.substr(l - 10, 9);
                                }
                                    content +='<li data-name="' + mod.name + '" data-version="1.6#1.5.63" class="mix '+mod.category_id+' mix_all">' +
                                    '<img  class="mod_logo" src="' + (mod.logo ? mod.logo : 'http://icons.iconarchive.com/icons/icojam/blue-bits/128/module-puzzle-icon.png') + '" />' +
                                        '<div class="actions">' +
                                            '<div class="download" data-icon="download">Download now</div>'+
                                            '<div class="cart" data-id="'+mod._id+'" data-icon="cartfill">Add to cart</div>'+
                                        '</div>'+
                                    '<div class="modinfo">'+
                                        '<a href="/view/'+mod._id+'" class="view" data-id="'+mod._id+'" >'+
                                            '<h1 class="title">' + mod.name + '</h1>'+
                                            '<h6 class="summary text">' +sum + '</h6>'+
                                        '</a>'+
                                        '<div class="links">' +
                                            '<a href="/demo/'+mod._id+'" id="demo demo_'+mod._id+'" data-id="'+mod._id+'" data-icon="play">demo</a> '+
                                            '<a href="/view/'+mod._id+'" id="view view_'+mod._id+'" data-id="'+mod._id+'" data-icon="eye">view</a> '+
                                            '<a href="/cmod/'+mod._id+'" id="cmod cmod_'+mod._id+'" data-id="'+mod._id+'" data-icon="cartfill">cart</a> '+
                                            '<a href="/star/'+mod._id+'" id="star star_'+mod._id+'" data-id="'+mod._id+'" data-icon="stare">1,552,256</a> '+
                                        '</div>'+
                                    '</div>'+
                                '</li>';
                                
                             });
                             context.swap(content, function() {
                                 console.log('[INFO]Mixing...');
                                 $('#Grid').mixitup($.getJSON('app/config/mixitup.json'));
                                 $('.cart').on('click', function () {
                                    var id = this.getAttribute('data-id');
                                    $.cart.push(id);
                                    
                                 });
                                 NProgress.done();

                             });
                         }
                     });


                 });
                    
                self.get('/view/:id', function() {
                    var id = this.params['id'];
                    var self = this;
                    $.ajax({
                        type: "GET",
                        url: "/ajax/info/?id=" + id,
                        error: function(err) {
                            throw err;
                        },
                        success: function(mod) {
                            var html = markdown.toHTML(mod.description);
                            NProgress.inc()
                            mod.htmldesc = html;
                            self.partial('/app/templates/mod.haml', mod, function() {
                                NProgress.inc();
                                addCss('/app/lib/highlight.js/styles/tomorrow-night-eighties.css');
                               // addCss('/components/tabulous/demo/src/tabulous.css');
                                $('pre code').each(function(i, e) {
                                    var code = hljs.highlightAuto($(this).html()).value;
                                    console.log(code);
                                    $(this).html(code);
                                });
                                    $('#tabs').tabs();  
                                NProgress.done();
                
                            });
                
                
                        }
                    });
                
                });
                    
                self.get('/edit/:id', function(context) {
                   NProgress.inc();
                   var self = this;
                   require([],

                   function () {
                       self.partial('/app/templates/edit.haml', undefined, function () {
               
                           
                                NProgress.done();

                       });
                   });
                });
                self.get('/upload', function(context) {
                        console.log('Upload');
                     //self.setTitle('Upload a new mod - Open Cubes');
                     this.partial('app/templates/upload.haml', function() {

                         NProgress.inc();
                         $('#main').css({
                             'opacity': '0'
                         });
                         addCss('/components/jquery-dropkick2/dropkick.css');
                         $('#epiceditor').height(500);
                         requirejs(["EpicEditor", "markdown", "ladda", "dropkick", "autosize"], function(eeditor, markd, Ladda, dk, as) {
                             NProgress.inc();
                             NProgress.inc();
                             var editor;
                             addCss('/components/Ladda/dist/ladda.min.css');

                             //$('.select').dropkick();
                             $('textarea').autosize();
                             $("#submit").unbind('click').on("click", function(event) {
                                 event.preventDefault();
                                 console.log('hi');
                                 var form = $('form').serializeObject();
                                 form.desc = editor.exportFile();
                                 // Create a new instance of ladda for the specified button
                                 var l = Ladda.create(document.querySelector('.ladda-button'));

                                 // Start loading
                                 l.start();

                                 $.ajax({
                                     url: '/ajax/addmod/',
                                     type: 'POST',
                                     data: {
                                         form: JSON.stringify(form)
                                     },
                                     dataType: 'json',
                                     success: function(data) {
                                         console.log(data)
                                         if (data.Status === 'Error') {
                                             switch (data.ErrorType) {
                                                case 'InvalidData':
                                                 $.each(data, function(i, v) {
                                                     var e = $('[name="' + v.property + '"]');
                                                     e.addClass('invalid');
                                                 });
                                                 $().getScroll().scrollTop(1);
                                                 setTimeout(function() {
                                                     $.each(data, function(i, v) {
                                                         var e = $('[name="' + v.property + '"]');
                                                         e.removeClass('invalid');
                                                     });
                                                 }, 3000);
                                                 break;
                                             }
                                             noty({
                                                 text: data.ErrorMessage,
                                                 type: 'error',
                                                 layout: 'bottomLeft'
                                             })
                                         }
                                         else if(data.Status === 'OK'){
                                             console.log(data);
                                             noty({
                                                 text: 'Successfully uploaded. Redirecting...',
                                                 type: 'success',
                                                 layout: 'bottomLeft'
                                             });
                                             context.redirect('view/'+data.DataId);
                                         }
                                         // Stop loading
                                         l.stop();

                                     },
                                     error: function(jqXHR, textStatus, err) {
                                         alert('text status ' + textStatus + ', err ' + err);
                                         // Stop loading
                                         l.stop();

                                     }
                                 });
                             }); // this will show the info it in firebug console
                             editor = new EpicEditor({
                                 container: 'epiceditor',
                                 textarea: null,
                                 basePath: 'epiceditor',
                                 clientSideStorage: false,
                                 localStorageName: 'epiceditor',
                                 useNativeFullscreen: true,
                                 parser: markdown.toHTML,
                                 file: {
                                     name: 'epiceditor',
                                     defaultContent: '# This is a title\n\nThe description should be written in markdown. ' + '\nTo preview or switch to fullscreen mod, go at the end of the area (follow the arrow).\n**You should not put here changelog, downloads or features list. OpenKubes has a built-in manager for that.** \n\n##This is another title\n\n###...and subtitle\n\n' + '##  Code \n\n\nIndented with for spaces, it is a code\n\n     class HelloWorld {\n     public static void main(String[] args) {\n         System.out.println("Hello world!");\n     }' + '\n    }\n\n## Quotes\n\n\nYou can also do quoting by adding > at the beginning of the text\n' + '\n> Markdown is a lightweight markup language, originally created by John Gruber "allowing people ' + '\n to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML)"' + '\nsMarkdown formatted text should be readable as-is, without looking like it\'s been marked up with tags or formatting instructions, ' + 'unlike text which has been formatted with a Markup language, such as HTML, which has obvious tags and formatting instructions.' + ' Markdown is a formatting syntax for text that can be read by humans and can be easily converted to HTML.\n\n_(Wikipedia)_' + '\n\n## Format\n\n\nThere are mutliple format possibilities : \n\n - A list is marked with a \'-\' at the beginning\n - An ordered list with 1. or 2.\n' + ' - You can make the text **bold** by putting \'**\' at the beginning and at the end of the text\n - _Italic_ is also possible with \'_\'',
                                 },
                                 theme: {
                                     base: '/themes/base/epiceditor.css',
                                     preview: '/themes/preview/preview-dark.css',
                                     editor: '/themes/editor/epic-dark.css'
                                 },
                                 button: {
                                     preview: true,
                                     fullscreen: true,
                                     bar: "auto"
                                 },
                                 focusOnLoad: false,
                                 shortcut: {
                                     modifier: 18,
                                     fullscreen: 70,
                                     preview: 80
                                 },
                                 string: {
                                     togglePreview: 'Toggle Preview Mode',
                                     toggleEdit: 'Toggle Edit Mode',
                                     toggleFullscreen: 'Enter Fullscreen'
                                 },
                                 autogrow: true
                             });
                             editor.load(function() { //editor.preview();
                                 $('#main').animate({
                                     'opacity': '1'
                                 });

                                 NProgress.done();
                                 editor.reflow(function() {
                                     $().getScroll().scrollTop(0);
                                 })
                             });
                         });


                     });
                 });
                    
                    
                
             });
                
             app.run();
                
         });

     });