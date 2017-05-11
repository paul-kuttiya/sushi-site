var router = new (Backbone.Router.extend({
  routes: {
    "checkout": 'checkout',
    "menu/:id": 'itemDetail',
  },
  checkout: function() {
    App.checkout();
  },
  itemDetail: function(id) {
    App.showDetail(id);
  },
  index: function() {
    App.showIndexView();
  },
  initialize: function() {
    this.route(/^\/?$/, 'index', this.index);
  }
}))();

Backbone.history.start({ pushState: true });

$(document).on('click', "a[href^='/']", function(e) {
  e.preventDefault();
  router.navigate($(e.currentTarget).attr('href'), { trigger: true });
});