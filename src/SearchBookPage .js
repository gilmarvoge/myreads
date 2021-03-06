import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import escapeRegExp from 'escape-string-regexp'
import { Throttle } from 'react-throttle';
import * as BooksAPI from './BooksAPI'

class SearchBookPage extends Component {
  state = {
    query: '',
    books: [],
  }

  //método para controlar se ouve alteração do shelf enquanto se está pesquisando na barra de pesquisa
  // se ouver alteração, este método de retorno no route para a tela principal e vai acionar o método "updateBook"
  updatebook(book, shelf) {
    this.props.onUpdateBook(book, shelf)
  }

  //seta a string digitada na barra de pesquisa e chama o método de pesquisa dos livros no search do BooksAPI
  updateQuery = (query) => {
    this.setState({ query })
    BooksAPI.search(query)
      .then(response => {
        //ignorar erros 
        if (response && !response.error) {
          //varrer o array de objetos livros e verificar se há livros da biblioteca igual aos livros pesquisados
          //se houver, vai igualar os valores do shelf, se não, vai setar para "none"
          const booksResults = response.map(book => {
            //verificar se há livros na estante iguais aos livros procurados no search
            let searchMatchBook = this.props.books.find(myBook => myBook.id === book.id)
            //se true
            if (searchMatchBook) {
              //igualar o shelf do livro procurado igual do livro da estante
              book.shelf = searchMatchBook.shelf
            } else {
              // se não houver livros iguais, então vai setar o shelf dos livros pesquisados como "none"
              book.shelf = 'none'
            }
            return book
          })
          //concatenar os livros da estante com os livros pesquisados, mas que sejam diferentes, para não repetir livros  no render 
          let concats = booksResults.concat((book) => book.id !== this.props.books.id)
          //setar o resultado na propriedade books, para mostrar na tela todos os livros (estante + pesquisados)
          this.setState({ books: concats })
        }
      })
      .catch(e => {
        console.log("erro encontrado", e)
      })
  };

  render() {

    const { query, books } = this.state

    let showingbooks
    if (query) {
      const match = new RegExp(escapeRegExp(query), 'i')
      showingbooks = books.filter(book => match.test(book.title))
    } else {
      showingbooks = books
    }

    return (
      <div className="search-books">
        <div className="search-books-bar">
          <Link to="/" className="close-search">Close </Link>
          <div className="search-books-input-wrapper">
            <Throttle time="500" handler="onChange" value={query}>
              <input type="text" placeholder="Search by title or author"
                onChange={(event) => this.updateQuery(event.target.value)}
              />
            </Throttle>
          </div>
        </div>
        <div className="search-books-results">
          {showingbooks.length !== books.length && (
            <div className='showing-contacts'>
              <span>{showingbooks.length} Books Found </span>
            </div>
          )}
          <ol className="books-grid">
            {query !== '' && (showingbooks.map((book) => (
              <li key={book.id}>
                <div className="book">
                  <div className="book-top">
                    <div className="book-cover" style={{ width: 128, height: 188, backgroundImage: ` url(${book.imageLinks ? book.imageLinks.smallThumbnail : ''})` }}></div>
                    <div className="book-shelf-changer">
                      <select value={book.shelf} onChange={event => this.updatebook(book, event.target.value)}>
                        <option value="moveTo" disabled>Move to...</option>
                        <option value="currentlyReading">Currently Reading</option>
                        <option value="wantToRead">Want to Read</option>
                        <option value="read">Read</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                  <div className="book-title"><p>{book.title}</p></div>
                  <div className="book-authors">{book.authors}</div>
                </div>
              </li>
            )))}
          </ol>
        </div>
      </div>
    )
  }
}

export default SearchBookPage