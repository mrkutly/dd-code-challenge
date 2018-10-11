

// React app
const { Provider, connect } = ReactRedux;


// * EXPRESS ENDPOINT * //
const BASE_URL = "https://untitled-s70toudl9wj2.runkit.sh/books/search?"



// * Adapter for express endpoint * //
const Adapter = {
	search: (queryString) => {
		return fetch(`${BASE_URL}${queryString}`)
			.then(r => r.json())
	}
}



// * COMPONENTS * //
const App = (props) => {
	return (
		<React.Fragment>
			<h1 className="logo">Dotdash Book Club</h1>
			<SearchBar />
			<ResultsContainer />
		</React.Fragment>
 )
}



// * SearchBar * //
class USearchBar extends React.Component {
  constructor(props) {
    super(props)

    this.loading = false
  }

  state = {
    query: "",
  }


  handleChange = (e) => {
    this.setState({
      query: e.target.value
    })
  }


	handleNextPage = (e) => {
		const { page, results, searchedTerm } = this.props
		page === results.length ? this.loadNextPage(page + 1, searchedTerm) : this.props.nextPage()
	}


	handlePreviousPage = (e) => this.props.previousPage()


  handleSubmit = (e) => {
    e.preventDefault()
    const queryString = this.makeQueryString(1, this.state.query)

    Adapter.search(queryString)
      .then(json => {
				this.props.searchedTrue()
				this.props.firstPage()
				this.props.setResults(json.results)
				this.props.setLastPageLoaded(json.lastPage)
				this.props.setSearchedTerm(this.state.query)
      })
			.catch(error => console.log(error))
  }


	loadNextPage = (page, searchTerm) => {
    this.loading = true
		const queryString = this.makeQueryString(page, searchTerm)

		Adapter.search(queryString)
			.then(json => {
				this.props.addToResults(json.results)
				this.props.setLastPageLoaded(json.lastPage)
				this.props.nextPage()
        this.loading = false
			})
			.catch(error => console.log(error))
	}


  makeQueryString = (page, term) => {
    const searchQuery = term.split(" ").join("+")
    return `q=${searchQuery}&page=${page}`
  }


  render() {
		const { page, results, lastPageLoaded, searched } = this.props

    return (
      <div className="search-bar">
				<p className="instructions"> search authors, book titles, or ISBNs</p>
        <form onSubmit={this.handleSubmit} >
          <input onChange={this.handleChange} value={this.state.query} className="input" />
          <button className="button">Search</button>
        </form>
        {
          searched ?
            <div>
              <p>Current page: {page}</p>
              <button className="button" onClick={this.handlePreviousPage} disabled={page === 1}>Previous page</button>
              <button className="button" onClick={this.handleNextPage} disabled={(lastPageLoaded && page === results.length) || this.loading }>Next page</button>
            </div>
          :
            null
        }
      </div>
    )
  }
}


const mapStateToSearch = (state) => {
	const { searched, page, lastPageLoaded, results, searchedTerm } = state
	return { searched, page, lastPageLoaded, results, searchedTerm }
}


const mapDispatchToSearch = (dispatch) => {
	return {
		addToResults: (page) => dispatch( addToResults(page) ),
		firstPage: () => dispatch( firstPage() ),
		nextPage: () => dispatch( nextPage() ),
		previousPage: () => dispatch( previousPage() ),
		searchedTrue: () => dispatch( searchedTrue() ),
		setLastPageLoaded: (bool) => dispatch( setLastPageLoaded(bool) ),
		setResults: (results) => dispatch( setResults(results) ),
		setSearchedTerm: (term) => dispatch( setSearchedTerm(term) )
	}
}


const SearchBar = connect(mapStateToSearch, mapDispatchToSearch)(USearchBar)



// * Search results * //
const ResultCard = (props) => {
  const { title, author, image, rating, reviewCount } = props.result

  return (
    <div className="card">
      <img src={image} />
      <p className="card-title">{title}</p>
      <p className="card-content">by {author}</p>
			<p className="card-content">Rating: {rating} out of 5  //  Based on {reviewCount} reviews</p>
    </div>
  )
}


const UResultsContainer = (props) => {
  mappedResults = props.results.map(result => <ResultCard key={result.id} result={result} />)

	return (
		<div className="container">
			{mappedResults}
		</div>
	)
}


const mapStateToContainer = (state) => {
	const results = (state.results.length > 0 ? state.results[state.page - 1] : [])
	return { results }
}


const ResultsContainer = connect(mapStateToContainer)(UResultsContainer)



// * REDUCER AND INITIAL STATE * //
const initialState = {
	lastPageLoaded: false,
	page: 1,
	results: [],
	searched: false,
	searchedTerm: ""
}


const reducer = (state = initialState, action) => {
	switch (action.type) {

		case "ADD_TO_RESULTS":
			return {
				...state,
				results: [...state.results, action.payload]
			};

		case "FIRST_PAGE":
			return {
				...state,
				page: 1
			};

		case "NEXT_PAGE":
			return {
				...state,
				page: state.page + 1
			};

		case "PREVIOUS_PAGE":
			return {
				...state,
				page: state.page - 1
			};

		case "SEARCHED_TRUE":
			return {
				...state,
				searched: true
			};

		case "SET_LAST_PAGE_LOADED":
			return {
				...state,
				lastPageLoaded: action.payload
			};

		case "SET_RESULTS":
			return {
				...state,
				results: [ action.payload ]
			};

		case "SET_SEARCHED_TERM":
			return {
				...state,
				searchedTerm: action.payload
			};

		default:
			return state;
	}
}



// * ACTIONS * //
const addToResults = (results) => {
	return { type: "ADD_TO_RESULTS", payload: results }
}

const firstPage = () => {
	return { type: "FIRST_PAGE" }
}

const nextPage = () => {
	return { type: "NEXT_PAGE" }
}

const previousPage = () => {
	return { type: "PREVIOUS_PAGE" }
}

const searchedTrue = () => {
	return { type: "SEARCHED_TRUE" }
}

const setLastPageLoaded = (bool) => {
	return {
		type: "SET_LAST_PAGE_LOADED",
		payload: bool
	}
}

const setResults = (results) => {
	return {
		type: "SET_RESULTS",
		payload: results
	}
}

const setSearchedTerm = (term) => {
	return {
		type: "SET_SEARCHED_TERM",
		payload: term
	}
}



// * RENDER APP * //
const store = Redux.createStore(reducer);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>, document.getElementById('root'))
