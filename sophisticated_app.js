// Filename: sophisticated_app.js
// Description: This code demonstrates a sophisticated and elaborate JavaScript application.

// Data model
class User {
  constructor(name, email, username, password) {
    this.name = name;
    this.email = email;
    this.username = username;
    this.password = password;
  }
}

class Post {
  constructor(title, content, author) {
    this.title = title;
    this.content = content;
    this.author = author;
    this.likes = 0;
    this.comments = [];
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  like() {
    this.likes++;
  }
}

// Controller
class SocialMediaController {
  constructor() {
    this.users = [];
    this.posts = [];
  }

  createUser(name, email, username, password) {
    const newUser = new User(name, email, username, password);
    this.users.push(newUser);
    console.log(`User ${username} created successfully!`);
  }

  createPost(title, content, authorUsername) {
    const author = this.users.find(user => user.username === authorUsername);
    if (!author) {
      console.log(`User ${authorUsername} does not exist.`);
      return;
    }

    const newPost = new Post(title, content, author);
    this.posts.push(newPost);
    console.log(`Post "${title}" created successfully by ${authorUsername}!`);
  }

  likePost(postTitle) {
    const post = this.posts.find(post => post.title === postTitle);
    if (!post) {
      console.log(`Post "${postTitle}" does not exist.`);
      return;
    }

    post.like();
    console.log(`Post "${postTitle}" liked! Total likes: ${post.likes}`);
  }

  addComment(postTitle, commentContent, commenterUsername) {
    const post = this.posts.find(post => post.title === postTitle);
    if (!post) {
      console.log(`Post "${postTitle}" does not exist.`);
      return;
    }

    const commenter = this.users.find(user => user.username === commenterUsername);
    if (!commenter) {
      console.log(`User ${commenterUsername} does not exist.`);
      return;
    }

    const comment = {
      content: commentContent,
      commenter: commenter
    };

    post.addComment(comment);
    console.log(`Comment added by ${commenterUsername} on post "${postTitle}"!`);
  }
}

// Usage example
const controller = new SocialMediaController();
controller.createUser('John Doe', 'johndoe@example.com', 'johndoe', 'password');
controller.createPost('Hello World', 'This is my first post!', 'johndoe');
controller.likePost('Hello World');
controller.addComment('Hello World', 'Great post!', 'johndoe');