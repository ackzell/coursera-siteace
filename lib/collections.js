Websites = new Mongo.Collection("websites");

Websites.allow({
    insert: function(userId, doc) {
        if (Meteor.user()) {
            if (userId !== doc.createdBy) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    },
    update: function(userId, doc, fields, modifier) {
        if (Meteor.user()) {
            return true;
        }
    },
    remove: function(userId, doc) {
        if (Meteor.user()) {
            return true;
        }
    }
});

// https://github.com/matteodem/meteor-easy-search/issues/165
WebsitesIndex = new EasySearch.Index({
    collection: Websites,
    fields: ['title', 'description'],
    engine: new EasySearch.Minimongo({
        sort: function() {
            return {
                'upVotes': -1
            };
        },
        transform: function(doc) {
            var text = Session.get('searchQuery'),
                regExp = new RegExp(text, 'gi');

            doc.title = doc.title.replace(regExp, '<span class="search-result">$&</span>');
            doc.description = doc.description.replace(regExp, '<span class="search-result">$&</span>');

            return doc;
        }
    })
});