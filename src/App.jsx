import * as React from 'react';

const title = 'React';

const welcome = {
    greeting: "Hello",
    title: title,
}

function getTitle(title) {
    return title
}

// App is the main entry point for react apps, the React  `App` component.
// React components must be defined in PascalCase.
// The app component returns code resembling HTML, which uses JSX (js xml) syntax.
// JSX internally translates all HTML attributes to JS.
// See all JSX supported HTML attributes: https://reactjs.org/docs/dom-elements.html#all-supported-html-attributes
const App = () => {
    // Data in JS often comes as an array.
    // We use the arrays' built in map() method to do so.
    // See below `list.map` for use.
    const stories = [
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

    // While props are used to pass data down the component hierarchy,
    // React state' allows mutable data structures to be changed over time.
    // `useState` is how we define a stateful value. It returns an array with
    // two entries: `searchTerm` represents the current state, & `setSearchTerm`
    // is a function to update the state, AKA `state updater function`.
    // `useState` is an example of a 'React hook', one of many.
    // If a component below needs to update State, pass a callback handler.
    // If a component below needs to use state, pass it down as props.
    const [searchTerm, setSearchTerm] = React.useState('');


    // Callback Handlers allow us to pass information back up the call stack.
    // 'A' is passed an event handler that is passed as function in props
    // to another component, 'B', where is executed as there as 'C', and ultimately
    // calls back to the place it was introduced.
    const handleSearch = (event) => {
        // Conduct event handling.
        setSearchTerm(event.target.value);
    };

    // Create a new filtered array. If the search term matches the condition,
    // it stays in the newly created array.
    const searchedStories = stories.filter((story) =>
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

            <Search onSearch={handleSearch} /> {/*the even is pass up from Search here.*/}

            <hr />

            {/*Assigning `stories` to the HTML element `list` demonstrates
            the use of a React Prop.*/}
            <List list={searchedStories}/>
        </div>
    )
};

const Search = (props) => {
    return (
        <div>
            <label htmlFor="search">Search: </label>
            <input id="search" type="text" onChange={props.onSearch}/> {/*pass the even up to the App component via callback*/}
        </div>
    );
};

// List demonstrates the use of a secondary React component.
const List = (props) => (
    <ul>
        {/* Note the requirement for a key in a <li>
        which allows React to efficiently update the list if needed.
        You can use the index if no key is given, but this should be avoided if possible.*/}
        {props.list.map((item) => (
        <Item key={item.objectID} item={item} />
            ))}
    </ul>
);

const Item = (props) => (
    <li>
        <span>
            <a href={props.item.url}>{props.item.title}</a>
        </span>
        <span>{props.item.author}</span>
        <span>{props.item.num_comments}</span>
        <span>{props.item.points}</span>
    </li>
)

export default App
