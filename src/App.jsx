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
function App() {
    return (
        <div>
            <h1>{welcome.greeting} {getTitle(title)}</h1>

            <label htmlFor="search">Search: </label>
            <input id="search" type="text" />
        </div>
    );
}

export default App
