const express = require("express");
const app=express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var _ =require('lodash');
mongoose.connect('mongodb+srv://docsuser:docsuser123@cluster0.lb8gg2f.mongodb.net/todolistDB?retryWrites=true&w=majority');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); 
app.set('view engine',"ejs");
const item = new mongoose.Schema({
    name: String
})
const additem = mongoose.model("additem",item);
const drink = new additem({
    name:"drink water",
});
const work = new additem({
    name:"work",
});
const gym = new additem({
    name:"workout",
});
defaultitems=[drink,work,gym];
app.get("/",function(req, res){
    additem.find()
        .then(function (allitems) {                                    
            if(allitems.length===0){
                additem.insertMany(defaultitems).then(function(){
                console.log("inserted");
                allitems=defaultitems;
                res.render("list",{DayType:"Today",newlistitems:allitems});
            }) 
            }
            else{
                res.render("list",{DayType:"Today",newlistitems:allitems});
            }
        })
});
app.post("/", function(req, res) {
    var newitem1 = req.body.item;
    const newitem = new additem({
        name: newitem1
    })

    if (req.body.list === "Today") {
        newitem.save();
        res.redirect("/");
    } else {
        const para = req.body.list;
        clist.findOne({ name: para })
            .then(function(clistarray) {
                if (clistarray) {
                    clistarray.data.push(newitem);
                    clistarray.save();
                    res.redirect("/" + para);
                } else {
                    const newList = new clist({
                        name: para,
                        data: [newitem]
                    });
                    newList.save();
                    console.log("New custom list created");
                    res.redirect("/" + para);
                }
            })
            .catch(function(err) {
                console.error(err);
                res.redirect("/");
            });
    }
})


app.post("/delete",function(req,res){
    const checdid = req.body.check;
    const ListName = req.body.listName;
    if(ListName=="Today"){
        async function deleteid(){
            const del = await additem.findByIdAndDelete(checdid);
        }
        deleteid();
        res.redirect("/");
    }
    else{
        async function pull(){
            const remove = await clist.findOneAndUpdate({name:ListName}, {$pull:{data:{_id:checdid}}});
        }
        pull();
        res.redirect("/"+ListName);
    }
    
});
const listschema = new mongoose.Schema({
    name:String,
    data:[item]//passing the item schema as array
}); 
const clist = mongoose.model("clist",listschema);
app.get("/:param",function(req,res){
    const customListName= _.capitalize(req.params['param']);
    clist.findOne({name:customListName})
        .then(function(foundlist){
            if(!foundlist){
                const list = new clist({
                    name:customListName,
                    data:defaultitems
                });
                list.save();
                console.log("saved");
                res.render("list",{DayType:list.name, newlistitems:list.data});
            }
            else{
                res.render("list",{DayType:foundlist.name, newlistitems:foundlist.data});
            }
        })
        .catch(function(err){});
})
app.listen(4000,function(){
    console.log("portal started");
});