var IndexView = Backbone.View.extend({
  tagName: 'ul',
  id: 'items',
  events: {
    "click li header": "showDetail",
    "click a.add_cart": "AddToCart",
  },
  AddToCart: function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var id = this.findId(e);
    console.log(id)
    App.trigger('add_to_cart', id)
  },
  findId: function(e) {
    return $(e.target).closest('li').data('id');
  },
  showDetail: function(e) {
    e.stopPropagation();
    var id = this.findId(e);
    App.trigger('showDetail', id);
  },
  template: App.templates.index,
  render: function() {
    this.$el.html(this.template(this.collection.toJSON()));
    App.$el.html(this.$el);
  },
  initialize: function() {
    this.render();
  }
});