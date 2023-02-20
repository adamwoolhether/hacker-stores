import * as React from 'react';
import axios from 'axios';

// useStorageState is a custom React Hook. It wraps `useState` and `useEffect`.
// Keeping with hook naming convention, is uses 'use' in front of the name, and
// return values are returned as an array.
const useStorageState = (key, initialState) => {
    const isMounted = React.useRef(false);

    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        // Demonstrate to withhold a render on the initial rendering.
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            console.log('A');
            localStorage.setItem(key, value);
        }
    }, [value])

    return [value, setValue]
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// getSumComments mocks an "expensive" operation.
const getSumComments = (stories) => {
    console.log('C');

    return stories.data.reduce(
        (result, value) => result + value.num_comments,
        0
    );
};

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
        console.log('How many times do I log?')
        handleFetchStories(); // C
    }, [handleFetchStories]); // D


    // handleRemoveStory is an event handler that enables removing a story from the list.
    const handleRemoveStory = React.useCallback((item) => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    }, []);

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

    console.log('B:App');

    // We only run the "expensive" operation when the field is rendered in jsx below.
    const sumComments = React.useMemo(
        () => getSumComments(stories),
        [stories]
    );


    return (
        <div>
            {/*<h1>{welcome.greeting} {getTitle(title)}</h1>*/}
            <h1>My Hacker Stories with {sumComments} comments.</h1>

            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
            />

            <hr />

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
    <form onSubmit={onSearchSubmit}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
        >
            <strong>Search:</strong>
        </InputWithLabel>

        <button type="submit" disabled={!searchTerm}>
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
            <label htmlFor={id}>{children}</label>
            &nbsp;
            <input
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                autoFocus={isFocused}
                onChange={onInputChange}
            />
        </>
    );
};

// List demonstrates the use of a secondary React component.
const List = ({list, onRemoveItem}) =>
    // Demonstrate how to NOT render someone if it's not needed.
    console.log('B:List')|| (
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

const Item = ({ item, onRemoveItem }) => {
    return (
        <li>
            <span>
                <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <span>
                <button type="button" onClick={() => onRemoveItem(item)}>
                    Dismiss
                </button>
            </span>
        </li>
    );
};
export default App
