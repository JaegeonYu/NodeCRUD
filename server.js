const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
const bcrypt = require('bcrypt');
const saltRounds=10;
const myPlaintextPassword = 's0/\/\P4$$0rD';
const someOtherPlaintextPassword = 'not_bacon';
require('dotenv').config()
var db;
MongoClient.connect(process.env.DB_URL,{useUnifiedTopology:true},
function(error, client){
    if( error) return console.log(error)  

    db = client.db('todoapp');
    app.listen(process.env.PORT, function(){
        console.log("listening on 8080")
    });
})


app.get('/pet',function(요청, 응답){
    응답.send('펫용품 쇼핑할수있는 ㅔ피이집니다.');
});


app.get('/',function(요청, 응답){
    응답.render('index.ejs');
});

app.get('/write',function(요청, 응답){
    응답.render('write.ejs');
    
});
app.post("/add", function(request, response)
{
    response.send("전송완료")
    db.collection('counter').findOne({name : '총게시물수'}, function(error, report){
        var 총게시물수 = report.totalPost;
        db.collection('post').insertOne({_id : 총게시물수 + 1, 이름 : request.body.name, 나이 :request.body.age}, function(에러, 결과){
            console.log("저장완료");
            db.collection('counter').updateOne({name : '총게시물수'}, {$inc : {totalPost : 1}}, function(error, response){
                if(error) return (console.log(error))
            });
        });
    });
    
});

app.get('/list', function(request, response){
    db.collection('post').find().toArray(function(error, report){
        response.render('list.ejs', {posts : report});
    });
    
});

app.delete('/delete', function(request, response){
    console.log(request.body);
    request.body._id = parseInt(request.body._id);
    db.collection('post').deleteOne(request.body,function(error, report){
        console.log("삭제완료");
        response.status(200).send({message : "성공했습니다."});
    });
});

app.get("/detail/:id", function(request, response){
    db.collection('post').findOne({_id : parseInt(request.params.id)},function(error, report){
        response.render('detail.ejs', {data : report});
    });
});

app.get("/edit/:id", function(request, response){
    db.collection('post').findOne({_id : parseInt(request.params.id)},function(error, report){
        response.render('edit.ejs', {data : report});
    });
});

app.put("/edit", function(request, response){
    db.collection('post').updateOne({_id : parseInt(request.body.id)}, {$set : {이름 : request.body.name, 나이 : request.body.age }}, function(error, report){
        if(error) return (console.log(error));
        console.log("수정완료");
        response.redirect("/list");
    });
   
    
});

const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

app.use(session({secret : "비밀코드", resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function(request, response){
    response.render('login.ejs');
});

app.post('/login',passport.authenticate('local',{
    failureRedirect : '/fail'
}), function(request, response){
    response.redirect('/');
});
function 암호화(pw){
    
    bcrypt.genSalt(saltRounds, function(err, salt){
        bcrypt.hash(pw, salt, function(err, hash){
            pw=hash;
        })
    })
    return pw;
}
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);

    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
 
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));
//로그인 성공시 세션만들기 user.id에 저장
//line 121 결과를 -> line129 user에 저장
passport.serializeUser(function(user, done){
    done(null, user.id);
 });
passport.deserializeUser(function(id, done){
    db.collection('login').findOne({id : id}, function(request, response){
        done(null, response)
    })

});

app.get('/mypage',로그인했니, function(request, response){
    response.render('mypage.ejs');
});

function 로그인했니(request, response, next){
    if(request.user){
        next()
    }else{
        response.send("로그인안하셨는데요?");
    }
}


app.get('/signup', function(request, response){
    response.render('signup.ejs');
});

app.post('/signup', function(request, response){
    console.log(request.body.id, request.body.pw)

    let user = db.collection('login').findOne({id : request.body.id}, function(error, report){
        console.log(report);
        if(report==null){
            db.collection('login').insertOne({id : request.body.id, pw : request.body.pw}, function(error, report2){
                response.send("회원가입완료");
            })
            
        }else{
            response.send("이미 있는 id 입니다");
        }
    });
});

app.get('/search', (req, res)=>{
    var searchCondition = [
        {
            $search :{
                index : 'nameSearch',
                text : {
                    query : req.query.value,
                    path : "이름"
                }
            }
        }
    ]
    db.collection('post').aggregate(searchCondition).toArray((err, report)=>{
        //console.log(report);
        res.render('search.ejs', {posts : report});
    });
});


app.use('/' , require('./routers/shop.js'));
app.use('/board/sub', require('./routers/board-sub.js'));