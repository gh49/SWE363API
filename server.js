const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jwt-simple");
const Post = require("./models/post");
const User = require("./models/user");
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const secret = "woeFpd232";

//Middleware to use in requests that require auth
const checkToken = async (req, res, next) => {
    const token = req.headers['x-auth'];
    if (!token) {
        return res.status(401).send("Error: Invalid token");
    }

    try {
        const decodedToken = jwt.decode(token, secret);
        const user = await User.findOne(decodedToken);
        if(user) {
            req.userData = user;
            next();
        }
    }
    catch (error) {
        return res.status(401).send("Error: Invalid token");
    }
};

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

async function isUser(email) {
    try {
        const user = await User.findOne({ email: email });

        if (user) {
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error in isUser function:", error);
        return true;
    }
}

async function checkEmailPassword(email, password) {
    try {
        const user = await User.findOne({email: email});
        const match = user.password === password;
        const res = {result: match, user: user};
        console.log(`${res.result}, ${res.user}`);
        return res;
    } catch (error) {
        console.error("Error in checkEmailPassword function:", error);
        return {result: false};
    }
}

app.get("/", function (req, res) {
    res.send("this is the root of the api");
})

app.post("/auth", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    if(!isValidEmail(email)) {
        res.status(401).send("Please enter a valid email");
        return;
    }
    if(password.length < 6) {
        res.status(401).send("Please enter a password that is longer than 6 characters");
        return;
    }
    const validLogin = await checkEmailPassword(email, password);
    if(!validLogin.result) {
        res.status(401).send("Incorrect Email/Password")
        return;
    }
    const token = jwt.encode({email: email}, secret);
    res.json({token: token, user: validLogin.user});
});

app.post("/register", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const userLocation = req.body.userLocation;
    if(!isValidEmail(email)) {
        res.status(401).send("Please enter a valid email");
        return;
    }
    if(password.length < 6) {
        res.status(401).send("Please enter a password that is longer than 6 characters");
        return;
    }
    const userExists = await isUser(email);
    if(userExists) {
        res.status(401).send("Email already registered")
        return;
    }

    try {
        const userData = {
            email: email,
            password: password,
            username: username,
            userLocation: userLocation
        };
        const user = new User(userData);

        const savedUser = await user.save();
    
        const token = jwt.encode({email: email}, secret);
        res.json({token: token, user: savedUser});
    }
    catch(error) {
        res.status(401).send("Error: " + error.message);
    }
});

app.post("/post", checkToken, async function (req, res) {
    req.body.post.userId = req.userData.id;
    const post = new Post(req.body.post);
    req.userData
    try {
        const savedPost = await post.save();
        res.status(201).json({post: savedPost});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/post", async function (req, res) {
    try {
        const posts = await Post.find({});
        res.json({posts});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/post/:id", async function (req, res) {
    try {
        const post = await Post.findOne({_id: req.params.id});
        if (!post) {
            return res.status(404).send("Post not found")
        }
        res.json({post: post});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/comment/:postid", checkToken, async function (req, res) {
    try {
        const post = await Post.findById(req.params.postid);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (!req.body.text) {
            return res.status(401).json({ message: 'Comment not found.' });
        }

        const newComment = {
            username: req.userData.username,
            text: req.body.text
        };

        post.comments.push(newComment);

        const updatedPost = await post.save();

        res.status(201).json({post: updatedPost});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/cart", checkToken, async function (req, res) {
    try {
        let posts = [];
        for(let i=0; i<req.userData.cart.length; i++) {
            const post = await Post.findById(req.userData.cart[i]);
            posts.push(post);
            console.log(`${post} and ${posts}`);
        }
        console.log(posts);
        res.status(201).json({cart: posts});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/cart", checkToken, async function (req, res) {
    try {
        const post = await Post.findById(req.body.post._id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        req.userData.cart.push(post);

        const updatedUser = await req.userData.save();

        res.status(201).json({user: updatedUser});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/users/:id", async function (req, res) {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(401).send("Error: No such user");
        }
        const userData = user.toJSON();
        delete userData["email"];
        delete userData["password"];
        delete userData["cart"];

        res.status(201).json({user: userData});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
    console.log(`server is listening to port ${PORT}`);
});