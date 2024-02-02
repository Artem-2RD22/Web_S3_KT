customElements.define('comment-box', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
        ul {
            list-style-type: none;
          }
          
          a {
              text-decoration: none;
              color: #555;
              padding: 1px;
              transition: transform 0.05s ease-in-out;
              display: inline-block;
              text-align: center;
          }
          
          a:hover {
              color: #222;
              transform: scale(1.07);
          }
          
          .comment-box {
              width: 500px;
              height: 50px;
              font-size:15px;
          }
          
          .add-btn {
              width: 100px;
              font-size: 15px;
              background-color: #5b0de6;
              color: white;
          }
          
          .comment-handle {
              color:blue;
              margin-top:20px;
              text-decoration:underline;
          }
          
          .name-handle {
              width: 200px;
              height: 30px;
              font-size: 15px;
          }
          
          .hr{
              color:rgba(238, 238, 238, 0.5);
              width:600px;
          }
          
          .comment-header {
              display:flex;width:50%;justify-content:space-between;
          }
          
          .comment-input-row {
              display:flex;margin-top:20px;margin-bottom:10px;
          }
          
          #commentsList {
              border: 1px solid #ccc;
              padding: 10px;
              width: 900px;
          }
        </style>
        <ul id="commentsList"></ul>
    `;
    }

    connectedCallback() {
        // Обработка действий
        this.shadowRoot.addEventListener('click', (event) => {
            event.preventDefault();
            // Извлекаем идентификатор действия и комментария из идентификатора элемента, по которому щелкнули
            const [action, commentId] = event.target.id.split('-');
            switch (action) {
                case 'reply':
                    this.addReplyInput(commentId);
                    const inputField = this.querySelector('.input-item');
                    if (inputField) {
                        inputField.focus();
                    }
                    break;
                case 'addreply':
                    this.addReply(commentId);
                    break;
                case 'upvote':
                    this.updateVotes(commentId, 'upvotes');
                    break;
                case 'downvote':
                    this.updateVotes(commentId, 'downvotes');
                    break;
                case 'delete':
                    this.deleteComment(commentId);
                    break;
            }
        });
    }
    
    addComment(name, content, parentId = null) {
        const commentId = Date.now(); // Уникальный идентификатор для каждого комментария
        const commentTemplate = document.getElementById('comment-template').content.cloneNode(true);
        //Формируем комментарий из шаблона
        commentTemplate.querySelector('.comment-item').id = `comment-${commentId}`;
        commentTemplate.querySelector('.comment-name').textContent = name;
        commentTemplate.querySelector('.comment-content').textContent = content;
        commentTemplate.querySelector('.upvotes').innerHTML = `0`;
        commentTemplate.querySelector('.downvotes').innerHTML = `0`;
        commentTemplate.querySelector('.upvotes').id = `upvotes-${commentId}`;
        commentTemplate.querySelector('.downvotes').id = `downvotes-${commentId}`;
        commentTemplate.querySelector('.upvote-button').id = `upvote-${commentId}`;
        commentTemplate.querySelector('.downvote-button').id = `downvote-${commentId}`;
        commentTemplate.querySelector('.reply-button').id = `reply-${commentId}`;
        commentTemplate.querySelector('.delete-button').id = `delete-${commentId}`;
        //Формируем дерево
        if (parentId) {
            const parentComment = this.shadowRoot.querySelector(`#comment-${parentId} .child-comments`);
            if (!parentComment) {
                const childCommentsContainer = document.createElement('ul');
                childCommentsContainer.className = 'child-comments';
                this.shadowRoot.querySelector(`#comment-${parentId}`).appendChild(childCommentsContainer);
                childCommentsContainer.appendChild(commentTemplate);
            } else {
                parentComment.appendChild(commentTemplate);
            }
        } else {
            this.shadowRoot.getElementById('commentsList').appendChild(commentTemplate);
        }
    }
    //Поле для ввода ответов
    addReplyInput(commentId) {
        if (!this.shadowRoot.querySelector('.input-item')) {
            const replyInputTemplate = document.getElementById('reply-input-template').content.cloneNode(true);
            //Формируем поле из шаблона
            replyInputTemplate.querySelector('.name').id = `name-${commentId}`;
            replyInputTemplate.querySelector('.comment-box').id = `content-${commentId}`;
            replyInputTemplate.querySelector('.add-btn').id = `addreply-${commentId}`;
            const commentElem = this.shadowRoot.querySelector(`#comment-${commentId}`);
            const inputElem = document.importNode(replyInputTemplate, true);

            commentElem.insertBefore(inputElem, commentElem.querySelector('.child-comments'));
        }
    }
    //Обработка ответов
    addReply(commentId) {
        const name = this.shadowRoot.querySelector(`#name-${commentId}`).value;
        const content = this.shadowRoot.querySelector(`#content-${commentId}`).value;
        if (name && content) {
            this.shadowRoot.querySelector('.input-item').remove();
            this.addComment(name, content, commentId);
        } else {
            alert('Имя и комментарий обязательны.');
        }
    }
    //Лайки
    updateVotes(commentId, type) {
        const votesElement = this.shadowRoot.querySelector(`#${type}-${commentId}`);
        let currentVotes = parseInt(votesElement.textContent) || 0;
        votesElement.textContent = ++currentVotes;
    }
    //Удаление комментариев
    deleteComment(commentId) {
        const commentElement = this.shadowRoot.querySelector(`#comment-${commentId}`);
        if (commentElement) commentElement.remove();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const commentBoxElement = document.querySelector('comment-box');
    //Обрабатываем добавление комментария к новости
    const addButton = document.getElementById("add-comment");
    addButton.addEventListener("click", () => {
        const name = document.getElementById("name").value;
        const content = document.getElementById("comment").value;
        if (name && content) {
            document.getElementById("name").value = '';
            document.getElementById("comment").value = '';

            commentBoxElement.addComment(name, content);
        } else {
            alert('Имя и комментарий обязательны');
        }
    });
});

