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
    const [searchTerm, setSearchTerm] = React.useState('React');


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

            {/*the event is pass up from Search here, and pass the initial state.*/}
            <Search search={searchTerm} onSearch={handleSearch} />

            <hr />

            {/*Assigning `stories` to the HTML element `list` demonstrates
            the use of a React Prop.*/}
            <List list={searchedStories}/>
        </div>
    )
};

const Search = ({search, onSearch}) => {
    /*// Destructuring the prop object, allowing easy access.
    // Another way(above) is to destructure is directly in the functions signature
    const { search, onSearch } = props;*/

    return (
        <div>
            <label htmlFor="search">Search: </label>
            {/*pass the event up to the App component via callback, we also provide the state's initial value.
            This makes Search a 'controlled component'*/}
            <input id="search" type="text" value={search} onChange={onSearch}/>
        </div>
    );
};

// List demonstrates the use of a secondary React component.
const List = ({list}) => (
    <ul>
        {/* Note the requirement for a key in a <li>
        which allows React to efficiently update the list if needed.
        You can use the index if no key is given, but this should be avoided if possible.*/}
        {list.map((item) => (
        <Item key={item.objectID} item={item} />
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
const Item = ({item}) => (
    <li>
        <span>
            <a href={item.url}>{item.title}</a>
        </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
    </li>
)
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
