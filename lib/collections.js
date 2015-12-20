Websites = new Mongo.Collection("websites");

Websites.allow({
    insert: function (userId, doc) {
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
    update: function (userId, doc, fields, modifier) {
        if (Meteor.user()) {
            return true;
        }
    },
    remove: function (userId, doc) {
        if (Meteor.user()) {
            return true;
        }
    }
});