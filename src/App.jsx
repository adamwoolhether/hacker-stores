import * as React from 'react';
import axios from 'axios';
// import './App.css'; // without css modules enabled
import styles from './App.module.css';
// allows us to use string interpolation to use two styles in one element on the SearchFrom components
import clsx from 'clsx';

// useStorageState is a custom React Hook. It wraps `useState` and `useEffect`.
// Keeping with hook naming convention, is uses 'use' in front of the name, and
// return values are returned as an array.
const useStorageState = (key, initialState) => {
    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        localStorage.setItem(key, value);
    }, [value])

    return [value, setValue]
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// storiesReducer is a 'reducer function'. Reducer functions always take
// a `state` and `action`. The reducer will always return a new state
// based on these two args. We'll use this with React's 'userReducer'
// hook in App() component. The reducer's 'action' is always associated
// with a type and as a best practice, a payload. It returns a new state
// if the type matches a condition in the reducer, otherwise we throw an
// error to remind us that the implementation isn't covered.
const storiesReducer = (state, action) => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    (story) => action.payload.objectID !== story.objectID
                ),
            };
        default:
            throw new Error();
    }
};

// App is the main entry point for react apps, the React  `App` component.
// React components must be defined in PascalCase.
// The app component returns code resembling HTML, which uses JSX (js xml) syntax.
// JSX internally translates all HTML attributes to JS.
// See all JSX supported HTML attributes: https://reactjs.org/docs/dom-elements.html#all-supported-html-attributes
const App = () => {
    // useStorageState is a custom React hook that combines the `useState` and `useEffect` Hooks.
    const [searchTerm, setSearchTerm] = useStorageState(
        'search',
        'React'
    );

    const [url, setUrl] = React.useState(
        `${API_ENDPOINT}${searchTerm}`
    );

    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        { data: [], isLoading: false, isError: false }
    );

    const handleFetchStories = React.useCallback(async() => { // use async
        dispatchStories({type: 'STORIES_FETCH_INIT'});

        try {
            const result = await axios.get(url); // await the async and handle callbacks
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits,
            });
        } catch {
            dispatchStories({type: 'STORIES_FETCH_FAILURE'});
        }
    }, [url]);


    React.useEffect(() => {
        handleFetchStories(); // C
    }, [handleFetchStories]); // D


    // handleRemoveStory is an event handler that enables removing a story from the list.
    const handleRemoveStory = (item) => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    };

    const handleSearchInput = (event) => {
        // Conduct event handling.
        setSearchTerm(event.target.value);
    };
    const handleSearchSubmit = () => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);

        // preventDefault() and the <button> below allows us to "Enter" key.
        event.preventDefault();
    }

    // Create a new filtered array. If the search term matches the condition,
    // it stays in the newly created array.
    const searchedStories = stories.data.filter((story) =>
         story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        // Style the attribute with css. We remove the `<hr />` because CSS handles the border.
        // The commented out code shows how to use css without css modules enabled.
       /*<div className="container">
           <h1 className="headline-primary">My Hacker Stories</h1>*/
        <div className={styles.container}>
            <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>

            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            {stories.isError && <p>Something went wrong...</p>}

            {/*Using a 'ternary operator' to determine whether feedback is rendered or not.*/}
            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List
                    list={searchedStories}
                    onRemoveItem={handleRemoveStory}
                />
            )}
        </div>
    );
};

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
    // <form onSubmit={onSearchSubmit} className="search-form"> // without css modules
    <form onSubmit={onSearchSubmit} className={styles.searchForm}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
        >
            <strong>Search:</strong>
        </InputWithLabel>

        <button
            type="submit"
            disabled={!searchTerm}
            // className="button button_large"
            className={clsx(styles.button, styles.buttonLarge)}
        >
            Submit
        </button>
    </form>
)

const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children }) => {
    const inputRef = React.useRef();

    React.useEffect(() => {
        if (isFocused && inputRef.current) {

        inputRef.current.focus()
    }
}, [isFocused]);

    return(
        <>
            {/*// className can also be passed as a prop to React components.*/}
            {/*<label htmlFor={id} className="label">*/}
            <label htmlFor={id} className={styles.label}>
                {children}
            </label>
            &nbsp;
            <input
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                autoFocus={isFocused}
                onChange={onInputChange}
                className={styles.input}
            />
        </>
    );
};

// List demonstrates the use of a secondary React component.
const List = ({list, onRemoveItem}) => (
    <ul>
        {list.map((item) => (
        <Item
            key={item.objectID}
            item={item}
            onRemoveItem={onRemoveItem}
        />
            ))}
    </ul>
);

const Item = ({ item, onRemoveItem }) => (
    // JSX can be passed as an inline JS object to attributes, demonstrated in the below `style` attributes.
    // Inline style is good for prototyping and dynamic style defs, but should be used sparingly,
    // it's better to keep a separate style definition in a CSS file.
    // <li className="item"> // without css modules
    <li className={styles.item}>
        <span style={{ width: '40%' }}>
            <a href={item.url}>{item.title}</a>
        </span>
        <span style={{ width: '30%' }}>{item.author}</span>
        <span style={{ width: '10%' }}>{item.num_comments}</span>
        <span style={{ width: '10%' }}>{item.points}</span>
        <span style={{ width: '10%' }}>
             <button
                 type="button"
                 onClick={() => onRemoveItem(item)}
                 // className="button button_small" // without css modules enabled
                 className={`${styles.button} ${styles.buttonSmall}`}
                 >
                 Dismiss
             </button>
        </span>
    </li>
);
export default App
