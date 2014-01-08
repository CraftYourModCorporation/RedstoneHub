/**
 * Module dependencies.
 */
var express = require('express'),
    connect = require('connect'),
    app = express(),
    routes = require('./routes'),
    user = require('./routes/user'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    path = require('path'),
    config = require('./config'),
    jade = require('jade'),
    model = require('./app/model'),
    status = require('json-status'),
    util = require('util'),
    fs = require('fs'),
    sessionStore = new connect.middleware.session.MemoryStore(),
    Mod = model.mod,
    User = model.user,
    Category = model.category,
    Stars = model.stars,
    Files = model.files,
    crypto = require('crypto'),
    cookieParser = express.cookieParser(config.secret),
    shasum = crypto.createHash('sha256'),
    lessMiddleware = require('less-middleware'),
    $1 = require('./dollar.js'),
    passport = require('passport'),
    archive = require('archiver'),
    uuid = require('uuid');
    zipstream = require('zipstream');
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// Middelwares
var responseSent = false;
var errorEventSent = false;
var statusMiddleware = status.connectMiddleware('status', function(data) {
    console.log("error: ", data.type, data.message, data.detail);
});
app.use(statusMiddleware);

// Express
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(cookieParser);
app.use(express.session({
    store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(lessMiddleware({
    src: __dirname + "/less",
    dest: __dirname + "/public/css",
    // if you're using a different src/dest directory, you
    // MUST include the prefex, which matches the dest
    // public directory
    prefix: "/css",
    // force true recompiles on every request... not the
    // best for production, but fine in debug while working
    // through changes
    force: true
}));

app.use(express.static(__dirname + '/public'));
// Router
app.use(app.router);

var SessionSockets = require('session.socket.io'),
    sessionSockets = new SessionSockets(io, sessionStore, express.cookieParser(config.secret));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
var index = function(req, res) {
    console.log('req' + req.user)
    res.render('index', {
        user: req.user,
        logged: (req.user ? true : false),
        title: 'Homepage'
    });
};
// INDEX
app.get('/:var((browse((/*)?))|upload)?', index);
app.get('/view/:id', index);
app.get('/edit/:id', index);
app.get('/register', index);

var humanList = [];
app.post('/register', function(req, res) {
    var hid = req.cookies['human-id'] || '';
    if (humanList.indexOf(hid) != -1) {
        console.log(req.body);
        User.register(new User({
            username: req.body.username,
            email: req.body.email
        }), req.body.password, function(err, account) {
            if (err) {
                return res.send({
                    status: 'error'
                });
            }
            res.send({
                status: 'done'
            });
        });
    }
    else {
        res.send({
            status: 'error',
            type: 'bot'
        });
    }
});

app.get('/shape', function(req, res) {

    // sort a random shape for the captcha and save it on the session
    var shapes = ['triangle', 'x', 'rectangle', 'circle', 'check', 'caret', 'zigzag', 'arrow', 'leftbracket', 'rightbracket', 'v', 'delete', 'star', 'pigtail'];
    var shape = shapes[Math.floor(Math.random() * (shapes.length))];
    req.session.shape = shape;

    res.send(shape);
});
app.post('/isbot', function(req, res) {

    // require $1 Unistroke Recognizer
    var
    points = req.param('_points') // get the points submitted on the hidden input
    ,
        _points_xy = points.split('|'),
        _points = [];

    // convert to an array of Points
    for (p in _points_xy) {
        var xy = _points_xy[p].split(',');
        _points.push(new $1.Point(parseInt(xy[0]), parseInt(xy[1])));
    }

    // test the points
    var _r = new $1.DollarRecognizer();
    var result = _r.Recognize(_points);

    // validates the captcha or redirect
    if (_points.length >= 10 && result.Score > 0.7 && result.Name == req.session.shape) { // 
        var idplain = Date.now() + Math.floor(Math.random() * 99999999) + 1;
        var d = crypto.createHash('sha256').update(idplain.toString()).digest('hex');
        res.cookie('human-id', d, {
            httpOnly: false
        });
        res.cookie('isbot', 'no', {
            httpOnly: false
        });
        humanList.push(d);
        console.log(d);
        res.send({
            status: 'ok'
        });
        1
    }
    else {
        res.send({
            status: 'invalid'
        });
    }

});
app.get('/login', function(req, res) {

    res.render('login', {
        user: req.user
    });
});
/*
app.post('/login' , function (req, res) {
    console.log("logging in...");
    passport.authenticate('local');
});*/

app.get('/ajax/logout', function(req, res) {
    req.logout();
    res.send('');
});
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.post('/login', passport.authenticate('local', {}), function(req, res) {
    res.send({
        user: req.user
    });
});

app.get('/isauth', function(req, res) {
    res.send({
        user: req.user
    });
});
// AJAX
// AJAX
// AJAX ROUTE FOR ADDING MOD
app.post('/ajax/addmod/', function(req, res) {
    var user = req.user;
    if (user) {
        var enforce = require("enforce");
        var form = JSON.parse(req.body.form);
        var name = form.name,
            sum = form.sum,
            desc = form.desc,
            version = form.version,
            logo = form.logo,
            dl_link = form.dl_link,
            category = form.category;

        var checks = new enforce.Enforce({
            returnAllErrors: true
        });
        checks.add("name", enforce.notEmptyString('Name invalid')).add("name", enforce.ranges.length(2, undefined, "Name is too short")) // yes, you can have multiple validators per property
        /*.add("version", enforce.patterns.match(config.version_regex, undefined, 'Version is invalid'))*/
        .add("sum", enforce.notEmptyString('Summary is invalid')).add("desc", enforce.notEmptyString('Description is invalid'));
        checks.check({
            name: name,
            sum: sum,
            desc: desc,
            version: version,
            logo: logo,
            dl_link: dl_link

        },

        function(err) {
            if (!err) { // find each person with a last name matching 'Ghost'
                var query = Category.findOne({
                    'slug': category
                });
                query.limit(1);
                // execute the query at a later time
                query.exec(function(err, cat) {
                    if (err) {
                        res.send({
                            'Status': 'Error',
                            'ErrorType': 'Exception',
                            'ErrorMessage': 'An exception has occured',
                            'ErrorData': err.name
                        });
                    }
                    var slug = name;
                    slug = slug.replace(new RegExp("([^\\w\\s\\-])", "gi"), '') // Matches non alpha numeric
                    .replace(new RegExp("\\s", "gi"), '-').toLowerCase();
                    var document = {
                        name: name,
                        summary: sum,
                        description: desc,
                        version: version,
                        logo: logo,
                        dl_link: dl_link,
                        creation_date: Date.now(),
                        category_id: cat._id,
                        author: user._id,
                        slug: slug
                    };
                    var doc = new Mod(document);
                    doc.save(function(err, mod) {
                        if (err) {
                            return err;
                        };
                        console.log(mod);
                        res.send({
                            'Status': 'OK',
                            'Slug': slug
                        });

                    });
                })

            }
            else {
                res.send({
                    'Status': 'Error',
                    'ErrorType': 'InvalidData',
                    'ErrorMessage': 'Some datas are invalid',
                    'ErrorData': err
                });
            }
        });
    }
    else {
        res.send({
            'Status': 'Error',
            'ErrorType': 'Unauthorized',
            'ErrorMessage': 'Guest can\'t post mods',
            'ErrorData': ''
        });
    }
});

// AJAX ROUTE FOR GETTING MODS
app.get('/ajax/getmods/', function(req, res) {
    var limit = req.param('limit');
    var skip = req.param('skip');
    var sort = req.param('sort');
    var category = req.param('category') || 'all';
    var findMods = function(category_id) {
        var query = Mod.find(null);
        if (category_id) query.where('category_id', category_id);
        query.limit(limit).skip(skip).sort(sort).select('name summary category_id creation_date _id slug');
        query.exec(function(err, doc) {
            if (err) {
                throw err;
            }
            else {
                res.send(doc);
            }
        });
    }
    if (category !== 'all') {
        var query = Category.findOne({
            'slug': category
        });
        query.exec(function(err, doc) {
            if (err) {
                throw err;
            }
            else {
                console.log(doc);
                findMods(doc.id);
            }
        });
    }
    else findMods();

});
// AJAX ROUTE FOR VIEWING MOD
app.get('/ajax/info/', function(req, res) {
    var slug = req.param('slug');


    var query = Mod.findOne({
        'slug': slug
    }).populate('category_id').populate('author', 'username _id');
    query.exec(function(err, doc) {
        if (err) {
            throw err;
        }
        else {
            res.send(doc);
        }
    });

});

// AJAX ROUTE FOR STARRING MOD
app.get('/ajax/star/', function(req, res) {
    if (!req.user) {

        res.status.unauthenticated();
        return;
    }
    var modid = req.param('id');
    var userid = req.user.id;
    var query = Mod.findOne({
        '_id': modid
    });
    query.exec(function(err, doc) {
        if (err) {
            res.status.internalServerError(err);
        }
        else {
            if (doc.voters) for (var i = 0; i < doc.voters.length; i++) {
                if (doc.voters[i].userid.equals(userid)) {
                    res.status.conflict('Already starred');
                    return;
                }
            }
            else doc.voters = [];
            doc.voters.push({
                userid: userid
            });
            if (!doc.vote_count) doc.vote_count = 0;
            doc.vote_count++;
            doc.save(function(err) {
                if (err) {
                    res.status.internalServerError(err);
                    return;
                }
                res.status.accepted(doc);
            });
        }
    });

});
// AJAX ROUTE FOR MANAGING FILE
app.get('/ajax/files/manage/', function(req, res) {
    var modid = req.param('modid');
    var action = req.param('action');
    var fileid = req.param('fileid');
    var path = req.param('path');
    if (!req.user) {
        res.status.unauthenticated('Who are you the proud lord say ?');
        return;
    }
    if (!modid && modid === '') {
        res.status.badRequest('No mod id');
    }
    else {
        var query = Mod.findOne({
            '_id': modid
        }).select('_id files name summary author');
        query.exec(function(err, doc) {
            if (err || !doc) {
                res.status.internalServerError('Issues with database');
            }
            else {

                // Check the user
                var query = User.findOne({
                    '_id': req.user._id
                }).select('_id name');

                query.exec(function(err, user) {

                    // The mod's owner and the user have to be the same person
                    var userid = user._id.toString(),
                        author = doc.author.toString()
                        console.log(userid);
                    console.log(author);
                    if (author !== userid) {
                        res.status.forbidden('You are not the mod\'s owner');
                        return;
                    }

                    // actions add, del, edit, get
                    switch (action) {
                    case 'get':
                        console.log(doc.files)
                        var r = []
                        for (i in doc.files) {
                            var file = doc.files[i];
                            r.push({
                                title: file.path
                            });
                        }
                        res.send(r);
                        break;
                    case 'add':
                        if (path !== '' && modid !== '') {
                            doc.files.push({
                                _id: model.mongoose.Types.ObjectId(),
                                path: path
                            });
                            doc.save(function(err) {
                                if (err) return res.status.internalServerError('Can\'t save');
                                res.status.accepted();
                            });

                        }
                        else res.status.badRequest('Wrong arguments');

                        break;
                    case 'del':
                        if (modid !== '') {

                        }
                        else res.status.badRequest('No mod specified');
                        break;
                    case 'edit':
                        if (modid !== '') {

                        }
                        else res.status.badRequest('No mod specified');
                        break;
                    default:
                        res.status.badRequest('No suitable action (' + action + ')');
                        break;

                    }
                });
            }
        });
    }


});

app.get('/pack/', function(req, res) {
    var id = req.param('id');
    if (!id) return res.status.badRequest('No mod selected');
    Mod.findOne({
        '_id': id
    }, function(err, mod) {
        if (!mod || err) return res.status.internalServerError('No mod');

        var zip = new archive('zip');


        zip.on('error', function(err) {
            console.log(err);
        });

        res.set({
            "Content-Disposition": 'attachment; filename="' + mod.slug + '.zip"'
        });
        zip.pipe(res);
        // add local file
        var i;
        for (i in mod.files) {
            if (mod.files[i]._id && mod.files[i].path) {
                var path = mod.files[i].path,
                    id = mod.files[i]._id;
                zip.append(fs.createReadStream('./public/uploads/' + id), {
                    name: path
                });
                console.log('Adding file ' + id + ' to ' + path);
            }
        }
        zip.finalize(function(err, bytes) {
            if (err) {
                return console.log(err);
            }

            console.log(bytes + ' total bytes');
        });
        // get everything as a buffer
        //  var buffer = zip.toBuffer();
        //var hash = crypto.createHash('sha256').update(buffer).digest('hex');
        //    console.log(mod.slug+"="+hash);
        // or write everything to disk
        //  zip.writeZip( /*target file name*/ "./cache/" + hash);
        //res.sendfile("./cache/" + hash);


    });
})


require('./app/socket.js')(sessionSockets, config.uploadPacketSize, fs, model, Mod, User, uuid);


server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
