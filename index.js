import express from 'express'
import path from 'path'
import mongoose from 'mongoose'; 
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

mongoose
.connect("mongodb://127.0.0.1:27017",{
    dbName: "backend",
})
.then(()=> console.log("Database Connected"))
.catch((e)=> console.log(e));


const messageSchema = new mongoose.Schema({
    name: String, 
    email: String,
    password: String,
});






const users = mongoose.model("Users",messageSchema);
// const users=[]



const app = express();

//using middleware
app.use(express.static(path.join(path.resolve(),"public")));

//middleware to access data filled in form reflect in terminal
app.use(express.urlencoded({extended: true}));

//to use cookie parser
app.use(cookieParser())

//setting up view Engine
app.set("view engine","ejs");

app.get("/",async(req,res)=>{
    const {token} = req.cookies;
    if(token)
    {
        //to get decoded token value
        const decoded = jwt.verify(token,"hwhcvabvhgabhabch")
        
        //to save user infomation can easily access user info by req.user
        req.user = await users.findById(decoded._id);

        res.render("logout",{name: req.user.name});
    }
    else{
        res.render("register");
    }

});

// app.get("/add", async(req,res)=>{
//   await  Messge.create({
//         name: "Abhi2",
//         email:"sample2@gmail.com"
//     })
// });



app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register")
});

// creating post to hit a url when we click the button
// app.post("/contact", async (req,res)=>{
//         await Messge.create({name: req.body.name, email: req.body.email});
//     res.redirect("/success");
// });

// //sending data of users array in json format
// app.get("/users",(req,res)=>{
//     res.json({
//         users,
//     });
// });

app.post("/login", async(req,res)=>{
    const {email,password} = req.body;

    let user = await users.findOne({email}); 

    if(!user)
    {
       return res.redirect("/register")
    }

    const isMatch = await bcrypt.compare(password , user.password); //comparing password with hassed password
    if(!isMatch)
    {
       return res.render("login",{email, message: "wrong password"});
    }
    const token = jwt.sign({_id : user._id},"hwhcvabvhgabhabch")

    //passing users in token
    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now()+60*1000),
    }); 
    res.redirect("/")
})



app.post("/register", async(req,res)=> {


    //taking name and email from req.body
    const {name,email,password} = req.body;

    //if user is not register database than redirecting them to register page
    let user = await users.findOne({email});
    if(user)
    {
         return res.redirect("/login");
    }

    // hassing password for security so that pasword cannot be seen in database
    const hassedPassword = await bcrypt.hash(password,10);

    // creating users with name and email
        user = await users.create({
        name,
        email,
        password: hassedPassword,
    });
    //console.log(req.body);

//Creating token with the help of jsonwebtoken for security purpose
    const token = jwt.sign({_id : user._id},"hwhcvabvhgabhabch")

    //passing users in token
    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now()+60*1000),
    }); 
    res.redirect("/")
});

app.get("/logout",(req,res)=> {
    res.cookie("token","null",{
        httpOnly: true,
        expires: new Date(Date.now()),
    }); 
    res.redirect("/" )
})

app.listen(8000,() => {
    console.log("server is working in epress")
})