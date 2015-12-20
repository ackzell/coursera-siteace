/////
// template helpers 
/////

// helper function that returns all available websites
Template.website_list.helpers({
    websites: function() {
        return Websites.find({}, {sort: { upVotes: -1 }});
    }
});

/////
// template events 
/////

Template.website_item.events({
    "click .js-upvote": function(event) {
        // example of how you can access the id for the website in the database
        // (this is the data context for the template)
        var website_id = this._id;
        //console.log("Up voting website with id " + website_id);
        
        Websites.update(
            {_id: website_id}, 
            {$inc: {upVotes: 1}}, 
            function(err, res) {
            });

        return false; // prevent the button from reloading the page
    },
    "click .js-downvote": function(event) {

        // example of how you can access the id for the website in the database
        // (this is the data context for the template)
        var website_id = this._id;
        // console.log("Down voting website with id " + website_id);

        Websites.update(
            {_id: website_id}, 
            {$inc: {downVotes: 1}}, 
            function(err, res) {
            });

        return false; // prevent the button from reloading the page
    }
});

Template.website.events({
    'submit .js-add-comment': function (event) {

        var userEmail = Meteor.users.findOne({_id: Meteor.user()._id}).emails[0].address;
        var comment = {
            content: event.target.comment.value,
            author: {
                email: userEmail,
                id: Meteor.user()._id
            },
            createdOn: new Date()
        };
        
        Websites.update(
            {_id: this._id}, 
            {$push: { comments: comment }},
            function(err, res) {
                event.target.comment.value = '';
            });

        return false;
    }
});

Template.website_form.events({
    "click .js-toggle-website-form": function(event) {
        $("#website_form").toggle('slow');
    },
    "submit .js-save-website-form": function(event) {

        var website = {
                createdBy: Meteor.user()._id,
                createdOn: new Date(),
                description: event.target.description.value,
                title: event.target.title.value,
                url: event.target.url.value,
            };

        if (Meteor.user()) {
            Websites.insert(website, function(err, res) {
                event.target.description.value = '';
                event.target.title.value = '';
                event.target.url.value = '';
            });    
        }

        return false; // stop the form submit from reloading the page
    },
    // updating a reactive value when the url and description fields change
    "keyup #url,#description": function(event) {
       Session.set(event.target.id + 'Val', event.target.value);
    }
});

Template.website_form.helpers({
    disabledSubmit: function () {
        return !(Session.get('urlVal') && Session.get('descriptionVal'));
    }
});