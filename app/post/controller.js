import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    modify() {
      const post = this.model

      post.set('title', new Date().valueOf())
      post.save()
    }
  }
})
