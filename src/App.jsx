import * as React from 'react';
import axios from 'axios';

// useStorageState is a custom React Hook. It wraps `useState` and `useEffect`.
// Keeping with hook naming convention, is uses 'use' in front of the name, and
// return values are returned as an array.
const useStorageState = (key, initialState) => {
    // React's `useState` Hook is how we define a stateful value. It returns an array with
    // two entries: `searchTerm` represents the current state, & `setSearchTerm`
    // is a function to update the state, AKA `state updater function`.
    // `useState` is an example of a 'React hook', one of many.
    // If a component below needs to update State, pass a callback handler.
    // If a component below needs to use state, pass it down as props.
    // Use cached search term if it exists, or default to 'React'.
    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    // React's `useEffect` Hook is used to trigger side-effect.
    // 'useEffect's first arg is a func to run our side effect
    // and store `searchTerm in browser's local storage. Second
    // arg is a dependency array of vars.
    React.useEffect(() => {
        // The 'side-effect' is handled in a centralized place, not in a specific function,
        // to keep the local storage updated.
        localStorage.setItem(key, value);
    }, [value])

    return [value, setValue]
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// We've removed the `initialStories` object and `getAsyncStories`
// funcs in favor of fetching real API data.
/*// Data in JS often comes as an array.
// We use the arrays' built in map() method to do so.
// See below `list.map` for use.
const initialStories = [
    {
        title: 'React',
        url: 'https://reactjs.org/',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: 0,
    },
    {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
    }
];

// getAsyncStories returns a promise that returns data in its shorthand version.
/!*const getAsyncStories = () =>
    Promise.resolve({ data: { stories: initialStories } });*!/
// Non-shorthand for reference.
/!*const getAsyncStories = () =>
    new Promise((resolve) =>
        resolve({ data: { stories: initialStories } })
    );*!/
// We can simulate a remote API call by removing the shorthand version,
// and delay the promise's resolve:
const getAsyncStories = () =>
    new Promise((resolve) =>
        setTimeout(
            () => resolve({ data: { stories: initialStories } }),
            2000
        )
    );
// Example of an 'impossible state' bug. We should be cautious using multiple
// state updater functions in a row. NOTE: the bug is fixed now, as we've put
// the multiple state hook's into a single useReducer.
/!*const getAsyncStories = () =>
    new Promise((resolve, reject) => setTimeout(reject, 2000));*!/*/



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

    /*// Make our list stateful with the useState Hook, setting initial state
    // as an empty array, so we can simulate fetching the data asynchronously.
    const [stories, setStories] = React.useState([]);*/
    // useReducer Hook sets state implicitly by dispatching an item for the reducer.
    // useReducer is preferred over userState when we have multiple values that
    // are dependent on each other or related to one domain.
    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        { data: [], isLoading: false, isError: false }
    );

    // React's useCallback createsa memoized function every time its dependency
    // array (E) changes. This causes the useEffect hook to run again (C) because
    // it depends on the new function (D), so we run the fetch again when `searchTerm`
    // changes because the useEffect depends on `handleFetchStories`.
    const handleFetchStories = React.useCallback(() => {
        dispatchStories({type: 'STORIES_FETCH_INIT'});

        // React's native 'Fetch API'
        /*        fetch(url)
                    .then((response) => response.json()) // translate the response into json.
                    .then((result) => {
                        dispatchStories({
                            type: 'STORIES_FETCH_SUCCESS',
                            payload: result.hits, // use the returned data structure's key 'hits'.
                        });
                    })
                    .catch(() =>
                        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
                    );
            }, [url]); // E*/
        // Using axios
        axios
            .get(url)
            .then((result) => {
                dispatchStories({
                    type: 'STORIES_FETCH_SUCCESS',
                    payload: result.data.hits,
                });
            })
            .catch(() =>
                dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
            );
    }, [url]);

    /*// We've taken the below hooks and merged them into the 'useReducer' hook above.
    // This helps reduce the chance bugs, giving a unified state management.
    // implement conditional rendering for user feedback while the list retrieval is loading.
    const [isLoading, setIsLoading] = React.useState(false);
    // Enable handling of potential errors if occurred while fetching remote data.
    // Actual handling is done with the promise's 'catch()' block in 'userEffect' below.
    const [isError, setIsError] = React.useState(false);*/

    // 'useEffect' hook to call the function and resolve the returned promise
    // as a side effect. We give and empty deps array so the side-effect only
    // runs once the component renders for the first time.
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
    }

    // Create a new filtered array. If the search term matches the condition,
    // it stays in the newly created array.
    const searchedStories = stories.data.filter((story) =>
         story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    /*A more verbose way to write the same func:
    const searchedStories = stories.filter(function (story) {
        return story.title.includes(searchTerm)
    });*/

    return (
        <div>
            {/*<h1>{welcome.greeting} {getTitle(title)}</h1>*/}
            <h1>My Hacker Stories</h1>

            {/*the event is pass up from Search here, and pass the initial state.*/}
            <InputWithLabel
                id="search"
                // label="Search"
                isFocused // shorthand for `isFocused={true}`
                value={searchTerm}
                onInputChange={handleSearchInput} // callback handler
            >
                {/*React Component Composition. We can remove `label="Search"` JSX element above
                and put "Search:" between the components element tags(below), which allows us
                to access it via React's children prop (see InputWithLabel func). Now React
                component elements can behave similarly to native HTML.*/}
                <strong>Search:</strong>
            </InputWithLabel>

            <button
                type="button"
                disabled={!searchTerm}
                onClick={handleSearchSubmit}
            >
                Submit
            </button>

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

const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children }) => {
    /*// Destructuring the prop object, allowing easy access.
    // Another way(above) is to destructure is directly in the functions signature
    const { search, onSearch } = props;*/

    // A
    // Create a 'ref' with 'useRef' hook. This ref is a persistent value
    // which stays intact for the lifetime of a React component. It's `current`
    // property is mutable, unlike the actual ref object.
    const inputRef = React.useRef();

    // C
    // Opt into the React lifecycle with the 'useEffect' hook.
    React.useEffect(() => {
        if (isFocused && inputRef.current) {
        // D
            // The ref is passed the element's `ref` attribute, allowing the
            // `current` property to access the element. We execute it's functionality
            // as a side effect if `isFocused` is set and the `current` property exists.
        inputRef.current.focus()
    }
}, [isFocused]);

    return(
//  React Fragments allow returning siblings elements side by side without a top-level element.
//  Can be called with `<React.Fragment>`  `</React.Fragment>` or shorthand: `<>` `</>`
        <>
            <label htmlFor={id}>{children}</label>
            &nbsp;
            {/* B
            The ref is passed to the element's JSX-reserved `ref` attribute, assigning
            the element is assigned to the `current` property.*/}
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
const List = ({list, onRemoveItem}) => (
    <ul>
        {/* Note the requirement for a key in a <li>
        which allows React to efficiently update the list if needed.
        You can use the index if no key is given, but this should be avoided if possible.*/}
        {list.map((item) => (
        <Item
            key={item.objectID}
            item={item}
            onRemoveItem={onRemoveItem}
        />
            ))}
    </ul>
);
// A variation of List using spread and rest operators.
/*const List = ({ list }) => (
    <ul>
        // rest operator destructures the `objectID` from the rest of item object.
        {list.map(({ objectID, ...item}) => (
            // spread operator spreads `item` with its key/value pairs
            <Item key={item.objectID} {...item} />
            /* // We can clean all this up with the spread operator above
              <Item
                key={item.objectID}
                title={item.title}
                url={item.url}
                author={item.author}
                num_comments={item.num_comments}
                points={item.points}
            />
        ))}
    </ul>
);

// Variation of Item using spread and rest operators.
// Notice that although the function signature is more
// concise than variation 2, we now messy of the List func.
const Item = ({ title, url, author, num_comments, points }) => (
    <li>
        <span>
            <a href={url}>{title}</a>
        </span>
        <span>{author}</span>
        <span>{num_comments}</span>
        <span>{points}</span>
    </li>
)*/
const Item = ({ item, onRemoveItem }) => {
    // We don't use the handleRemoveItem, & instead favor the use of
    // an 'inline handler', which allows us to execute the callback
    // function directly in the JSX. There are two method (see below button).
    // NOTE: Inline handlers may be more concise, but they can obscure
    // functionality and harm readability. Our use here is ok though.
    // const handleRemoveItem = () => {
    //     onRemoveItem(item);
    // };

    return (
        <li>
            <span>
                <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <span>
                {/*
                // original way, using func above.
                <button type="button" onClick={handleRemoveItem}>
                // using jS 'bind' method
                <button type="button" onClick={onRemoveItem.bind(null, item)}>
                // The most popular method, using and inline arrow function:
                */}
                <button type="button" onClick={() => onRemoveItem(item)}>
                    Dismiss
                </button>
            </span>
        </li>
    );
};
/*// An example of the Item component using `nested destructuring`.
// It helps to quickly identify all of `item`'s info, but as you
// can see it also adds a lot of clutter and awkward indentation.
// It may be useful/clearer in other scenarios though.
const Item = ({
    item: {
        title,
        url,
        author,
        num_comments,
        points,
    },
}) => (
    <li>
        <span>
            <a href={url}>{title}</a>
        </span>
        <span>{author}</span>
        <span>{num_comments}</span>
        <span>{points}</span>
    </li>
)*/
export default App
