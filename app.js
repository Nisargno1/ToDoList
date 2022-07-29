//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://nisargno1:test1234@todocluster.0vsvt.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = ({
    name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your ToDo list"
});

const item2 = new Item({
    name: "Hit the + to add a new item."
});

const item3 = new Item({
    name: "<--Hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = ({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully updated.")
                }
            });
            res.redirect("/");
        }
            else {
            res.render("list", { listTitle: "Today's list", newListItems: foundItems });
            } 
        });
});

app.get("/:workTitle", function (req, res) {
    const workTitle = _.capitalize(req.params.workTitle);
    List.findOne({ name: workTitle }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: workTitle,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + workTitle);

            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });
});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName === "Today's list") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
}); 

app.post("/delete", function (req, res) {
    const checked = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today's list") {
        Item.findByIdAndDelete(checked, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted.");
            }
            res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checked } } }, function (err, foundList) {
            if (!err) {
                
                console.log("Successfully deleted.");
                res.redirect("/" + listName);
            }
           
        });
    }
    
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});