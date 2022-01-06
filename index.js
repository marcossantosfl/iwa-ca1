const express = require('express')
const app = express()
const fs= require('fs')
const axios = require('axios');
const route = express.Router()
const cors = require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

//this line is required to parse the request body
app.use(express.json())
app.use(cors())




app.get('/', (req, res) => {
    axios.get('http://localhost:3000/user/list')
        .then(function(response){
            res.render('index', { users : response.data });
        })
        .catch(err =>{
            res.send(err);
        })

})


// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))

// load assets
app.use(express.static('assets'));

/* Create - POST method */
app.post('/user/add', (req, res) => {

  
//get the existing user data
const existUsers = getUserData()

const userData = req.body

//get the new user data from post request

//check if the userData fields are missing
if (userData.fullname == null || userData.age == null || userData.username == null || userData.password == null) {
    //return res.status(401).send({error: true, msg: 'User data missing'})
   return  res.status(500).send({
        message : {error: true, msg: 'User data missing'}
    });
}

//check if the username exist already
const findExist = existUsers.find( user => user.username === userData.username )
if (findExist) {
    return res.status(409).send({error: true, msg: 'username already exist'})
}
//append the user data
existUsers.push(userData)
//save the new user data
saveUserData(existUsers);

//res.send({success: true, msg: 'User data added successfully'})
 res.redirect('/');
})




/* Read - GET method */
app.get('/user/list', (req, res) => {
    
    const users = getUserData()
    res.send(users)
})


/* Update - Patch method */
app.patch('/user/update/:username', (req, res) => {
    //get the username from url
    const username = req.params.username
    //get the update data
    const userData = req.body
    //get the existing user data
    const existUsers = getUserData()
    //check if the username exist or not       
    const findExist = existUsers.find( user => user.username === username )
    if (!findExist) {
        return res.status(409).send({error: true, msg: 'username not exist'})
    }
    res.send(findExist);
      //filter the userdata
    const updateUser = existUsers.filter( user => user.username !== username )
    //push the updated data
    updateUser.push(userData)
    res.send(userData);
    //finally save it
    saveUserData(updateUser)
    
    res.redirect('/')
    
   
})
/* Delete - Delete method */
app.delete('/user/delete/:username', (req, res) => {
    const username = req.params.username
    //get the existing userdata
    const existUsers = getUserData()
    //filter the userdata to remove it
    const filterUser = existUsers.filter( user => user.username !== username )
    if ( existUsers.length === filterUser.length ) {
        return res.status(409).send({error: true, msg: 'username does not exist'})
    }
    //save the filtered data
    saveUserData(filterUser)
    res.send({success: true, msg: 'User removed successfully'})
    
})
/* util functions */
//read the user data from json file
const saveUserData = (data) => {
    
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('users.json', stringifyData)
}
//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('users.json')
    return JSON.parse(jsonData)    
}

//routing
app.get('/add-user', (req, res) =>{
    res.render('add_user')
})

app.get('/update-user', (req, res) =>{
    res.render('update_user')
})


//configure the server port
app.listen(3000, () => {
    console.log('Server runs on port 3000')
})