/* import files */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Shelves from './components/Shelves';
import Book from './components/Book';
import * as BooksAPI from './BooksAPI';




const BooksApp = () => {

  const [books, setBooks] = useState([]);
  const [mapOfIdBooks, setMapOfIdToBooks] = useState(new Map());
  const [searchBooks, setSearchBooks] = useState([]);
  const [mergedBooks, setMergedBooks] = useState([]);
  const [query, setQuery] = useState("");
  
  useEffect(() => {
    BooksAPI.getAll()
      .then(data => {
        setBooks(data)
        setMapOfIdToBooks(createMapOfBooks(data))
      }
         
      );
  }, [])


  useEffect(() => {
    let isActive = true;
    if (query) {
      BooksAPI.search(query).then(data => {
        if (data.error) {
          setSearchBooks([])
        } else {
          if (isActive) {
            setSearchBooks(data);
          }
        }
     })
   }  
    return () => {
      isActive = false;
      setSearchBooks([])
    }
  }, [query])

  useEffect(() => {
    const combined = searchBooks.map(book => {
      if (mapOfIdBooks.has(book.id)) {
        return mapOfIdBooks.get(book.id);
      } else {
        return book;
      }
    }

    )
    setMergedBooks(combined);
  }, [searchBooks])

  const createMapOfBooks = (books) => {
    const map = new Map();
    books.map(book => map.set(book.id, book));
    return map;
  }
  


  const updateBookShelf = (book, whereTo) => {
    const updatedBooks = books.map(b => {
      if (b.id === book.id) {
         book.shelf = whereTo;
        return book;
      }
      return b; 
    })
    if (mapOfIdBooks.has(book.id)) {
      book.shelf = whereTo;
      updatedBooks.push(book)
    }
    
    setBooks(updatedBooks);
    BooksAPI.update(book, whereTo);
  }
  
  
  return (
    <div className="app">
      <Router>
        <Switch>
        <Route path = "/search">
          <div className="search-books">
            <div className="search-books-bar">
              <Link to = "/">
                  <button className="close-search" >Close</button>
               </Link>
              <div className="search-books-input-wrapper">
              <input type="text" placeholder="Search by title or author" value={query} onChange={(e) => setQuery(e.target.value)}/>
              </div>
            </div>
            <div className="search-books-results">
            <ol className="books-grid">
                {mergedBooks.map(b => (
                    <li key={b.id}>
                        < Book book={b} changeBookShelf={updateBookShelf}/>
                     </li>
                      ))}
              </ol>
            </div>
            </div>
            </Route>

          <Route path="/">
            <div className="list-books">
            <Header />
              <div className="list-books-content">
              <Shelves books={books} updateBookShelf={updateBookShelf}/>
              </div>
                <div className="open-search">
                  <Link to ="/search">
                    <button >Add a book</button>
                    </Link>
            </div>
          </div>
        )
        </Route >
        
        </Switch>
 </Router >
      </div>
 
    )
  }


export default BooksApp
