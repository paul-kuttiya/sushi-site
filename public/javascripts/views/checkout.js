var CheckoutView = Backbone.View.extend({
  template: App.templates.checkout,
  id: "checkout",
  render: function() {
    this.$el.html(this.template(this.collection.toJSON()));
    App.$el.html(this.$el);
  },
  initialize: function() {
    this.render();
    this.listenTo(App, 'empty_cart', this.render);
  }
})