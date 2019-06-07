import React, { Component } from 'react';
import client from './feathers';

class App  extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  componentDidMount() {
    
    const messages = client.service('messages');
    const users = client.service('users');


    // Try to authenticate with the JWT stored in localStorage
    client.authenticate().catch(() => this.setState({ login: null }));

    //On successfull login
    client.on('authenticated', login => {
      // Get all users and messages
      Promise.all([
        messages.find({
          query: {
            $sort: { createdAt: -1 },
            $limit: 25
          }
        }),
        users.find()
      ])
      .then( ([ messagePage, userPage ]) => {
        // We want the latest messages but in the reversed order
        const messages = messagePage.data.reverse();

        // Once both return, update the state
        this.setState({ login, messages, users });
      });
    });

    client.authenticate({
      strategy: 'local',
      email:'test', password:'password'
    }).catch(error => this.setState({ error }));


    // On logout reset all all local state (which will then show the login screen)
    client.on('logout', () => this.setState({
      login: null,
      messages: null,
      users: null
    }));

    // Add new messages to the message list
    messages.on('created', message =>{
      this.setState({
        messages: this.state.messages.concat(message)
      });
    } );
    messages.on('removed', message =>{
      var list = this.state.messages;
       this.setState({
        messages: list.filter(function(el) { return el._id != message._id; })
      });
    });

    messages.on('patched', (message, context) =>{
      var list = this.state.messages;
       this.setState({
        messages: list.filter(function(el) { return el._id != message._id; })
      });
      this.setState({
        messages: this.state.messages.concat(message)
      });
    });

  }
  render() {
  return (
    <div className="App">
      <p>Hello World</p>
          {JSON.stringify(this.state.messages)}
    </div>
  );
  }
}

export default App;
