import React, { Component } from 'react';
import api from '../services/api';
import apiUrl from '../services/apiUrl';
import io from 'socket.io-client';

import './Feed.css';

import more from '../assets/more.svg';
import like from '../assets/like.svg';
import comment from '../assets/comment.svg';
import send from '../assets/send.svg';

class Feed extends Component {
    state = {
        feed: [],
        error: '',
        hasErrors: false
    };

    async componentDidMount() {
        this.registerToSocket();

        api.get('posts').then(response => {
            this.setState({ feed: response.data })
        }).catch(error => {
            this.setState({ error: error.message, hasErrors: true });
        });
    }

    registerToSocket = () => {
        const socket = io(apiUrl);

        if (!socket) {
            return;
        }

        socket.on('post', newPost => {
            this.setState({ feed: [newPost, ...this.state.feed] })
        })

        socket.on('like', likedPost => {
            this.setState({ feed: this.state.feed.map(post => post.id === likedPost.id ? likedPost : post) })
        });
    }

    handleLike = id => {
        api.post(`/posts/${id}/like`);
    }

    render() {
        return (
            <section id="post-list">
                {this.state.hasErrors ? (
                    <div className="area-error">
                        <p>Desculpe, mas não foi possível buscar nenhum post.</p>
                        <p>Message: ${this.state.error}</p>
                    </div>
                ) : (
                        <>
                            {this.state && this.state.feed.map(post => (
                                <article key={post.id}>
                                    <header>
                                        <div className="user-info">
                                            <span>{post.author}</span>
                                            <span className="place">{post.place}</span>
                                        </div>

                                        <img src={more} alt="Mais" />
                                    </header>
                                    <img src={`${apiUrl}/uploads/resized/${post.image}`} alt="" />

                                    <footer>
                                        <div className="actions">
                                            <button type="button" onClick={() => this.handleLike(post.id)}>
                                                <img src={like} alt="" />
                                            </button>
                                            <img src={comment} alt="" />
                                            <img src={send} alt="" />
                                        </div>

                                        <strong>{post.like} curtidas</strong>

                                        <p>
                                            {post.description}
                                            <span>{post.hashtags}</span>
                                        </p>
                                    </footer>
                                </article>
                            ))}
                        </>
                    )}
            </section>
        );
    }
}

export default Feed;