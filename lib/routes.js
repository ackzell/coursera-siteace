Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
    this.render('welcome', {
        to: 'main'
    });
});

Router.route('/websites', function () {
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('website_list', {
        to: 'main'
    });
    this.render('suggested_sites', {
        to: 'suggestions'
    });
});

Router.route('/website/:_id', function () {
    this.render('navbar', {
        to: 'navbar'
    });

    this.render('website', {
        to: 'main',
        data: function () {
            return Websites.findOne({_id: this.params._id});
        }
    });
    this.render('suggested_sites', {
        to: 'suggestions'
    });
});