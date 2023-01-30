import * as React from 'react';

const title = 'React';

const welcome = {
    greeting: "Hello",
    title: title,
}

// Data in JS often comes as an array.
// We use the arrays' built in map() method to do so.
// See below `list.map` for use.
const list = [
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

function getTitle(title) {
    return title
}

// App is the main entry point for react apps, the React  `App` component.
// React components must be defined in PascalCase.
// The app component returns code resembling HTML, which uses JSX (js xml) syntax.
// JSX internally translates all HTML attributes to JS.
// See all JSX supported HTML attributes: https://reactjs.org/docs/dom-elements.html#all-supported-html-attributes
function App() {
    return (
        <div>
            <h1>{welcome.greeting} {getTitle(title)}</h1>

            <label htmlFor="search">Search: </label>
            <input id="search" type="text" />

            <ul>
                {/* Note the requirement for a key in a <li>
                which allows React to efficiently update the list if needed.
                You can use the index if no key is given, but this should be avoided if possible.*/}
                {list.map(function(item){
                return <li key={item.objectID}>{item.title}</li>;
                })}
            </ul>
        </div>
    );
}

export default App
