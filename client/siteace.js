/////
// template helpers 
/////

// helper function that returns all available websites
Template.website_list.helpers({
    // https://github.com/matteodem/meteor-easy-search
    websites: function() {
        if (Session.get('searchQuery')) {
            return WebsitesIndex.search(Session.get('searchQuery')).fetch().sort({
                upVotes: -1
            });
        } else {
            return Websites.find({}, {
                sort: {
                    upVotes: -1
                }
            });
        }
    }
});

Template.suggested_sites.helpers({
    terms: function() {
        if (Session.get('lastTitle')) {
            var terms = Session.get('lastTitle').trim().split(' '),
                result = [];
            terms.forEach(function (term) {
                if (term.length > 2) {
                    result.push({term: term});
                }
            });
            return result;
        }
    },
    websites: function() {
        if (Session.get('lastTitle')) {
            var terms = Session.get('lastTitle').trim().split(' '),
                results = [];

            // console.log('terms', terms);
            terms.forEach(function(term) {
                if (term.length > 2) {
                    results = results.concat(WebsitesIndex.search(term).fetch());
                }
            });

            results = results.sort(function(a, b) {
                return a.upVotes > b.upVotes ? -1 : a.upVotes < b.upVotes ? 1 : 0;
            });

            // console.log('results', results);
            // var results = WebsitesIndex.search(Session.get('lastTitle')).fetch().sort({upVotes: -1});
            results = _.uniq(results, function(item, key, title) { 
                return item.title;
            });
            return _.filter(results, function(site) {
                // console.log('filtering on:', site);
                // console.log('current title:', Session.get('lastTitle'));
                 return site.originalTitle !== Session.get('lastTitle');
            });

        } else {
            return [];
        }
    }
});

/////
// template events 
/////

Template.suggested_sites.events({
    'click .js-show-detail': function() {
        $('#suggested_sites').modal('hide');
    }
});

Template.searchBox.events({
    'keyup #search-box': _.throttle(function(event) {
        var text = $('#search-box').val();
        Session.set('searchQuery', text);
    }, 200)
});

Template.website_item.events({
    "click .js-upvote": function(event) {
        // example of how you can access the id for the website in the database
        // (this is the data context for the template)
        var website_id = this._id,
            _this = this;

        Websites.update({
                _id: website_id
            }, {
                $inc: {
                    upVotes: 1
                }
            },
            function(err, res) {
                Session.set('lastTitle', _this.title);
                $('#suggested_sites').modal('show');
            });



        return false; // prevent the button from reloading the page
    },
    "click .js-downvote": function(event) {

        // example of how you can access the id for the website in the database
        // (this is the data context for the template)
        var website_id = this._id;
        // console.log("Down voting website with id " + website_id);

        Websites.update({
                _id: website_id
            }, {
                $inc: {
                    downVotes: 1
                }
            },
            function(err, res) {});

        return false; // prevent the button from reloading the page
    }
});

Template.website.events({
    "click .js-upvote": function(event) {
        // example of how you can access the id for the website in the database
        // (this is the data context for the template)
        var website_id = this._id,
            _this = this;

        Websites.update({
                _id: website_id
            }, {
                $inc: {
                    upVotes: 1
                }
            },
            function(err, res) {
                Session.set('lastTitle', _this.title);
                $('#suggested_sites').modal('show');
            });



        return false; // prevent the button from reloading the page
    },
    "click .js-downvote": function(event) {

        // example of how you can access the id for the website in the database
        // (this is the data context for the template)
        var website_id = this._id;
        // console.log("Down voting website with id " + website_id);

        Websites.update({
                _id: website_id
            }, {
                $inc: {
                    downVotes: 1
                }
            },
            function(err, res) {});

        return false; // prevent the button from reloading the page
    },
    'submit .js-add-comment': function(event) {

        var _this = this;

        var userEmail = Meteor.users.findOne({
            _id: Meteor.user()._id
        }).emails[0].address;

        var comment = {
            content: event.target.comment.value,
            author: {
                email: userEmail,
                id: Meteor.user()._id
            },
            createdOn: new Date()
        };

        Websites.update({
                _id: this._id
            }, {
                $push: {
                    comments: comment
                }
            },
            function(err, res) {
                event.target.comment.value = '';
                Session.set('lastTitle', _this.title);
                $('#suggested_sites').modal('show');
            });


        return false;
    }
});

Template.website_form.events({
    "click .js-toggle-website-form": function(event) {
        $("#website_form").toggle('slow');
    },
    'click .js-get-info': function(event) {

        var title = '',
            description = '',
            URL = $('#url').val();

        URL = URL.indexOf('http') > 0 ? URL : 'http://' + URL;

        Meteor.call('remoteGet', URL, {
            //...options...
        }, function(err, res) {

            if (!err) {

                title = $(res.content).filter('title').text();
                if (title) {
                    $('#title').val(title);
                    Session.set('titleVal', title);
                }

                description = $(res.content).filter('meta[name="description"]').attr('content');
                if (description) {
                    $('#description').val(description);
                    Session.set('descriptionVal', description);
                }

            }
        });

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
                Session.set('urlVal', '');
                Session.set('descriptionVal', '');
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
    disabledSubmit: function() {
        return !(Session.get('urlVal') && Session.get('descriptionVal'));
    }
});