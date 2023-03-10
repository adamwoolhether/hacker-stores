import * as React from "react";
import axios from "axios";
import "./App.css";
// @ts-ignore
import { ReactComponent as Check } from "./check.svg";

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Story[];

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

type StoriesFetchInitAction = {
  type: "STORIES_FETCH_INIT";
};
type StoriesFetchSuccessAction = {
  type: "STORIES_FETCH_SUCCESS";
  payload: Stories;
};
type StoriesFetchFailureAction = {
  type: "STORIES_FETCH_FAILURE";
};
type StoriesRemoveAction = {
  type: "REMOVE_STORY";
  payload: Story;
};
type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

// useStorageState is a custom React Hook. It wraps `useState` and `useEffect`.
// Keeping with hook naming convention, is uses 'use' in front of the name, and
// return values are returned as an array.
const useStorageState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value]);

  return [value, setValue];
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

// storiesReducer is a 'reducer function'. Reducer functions always take
// a `state` and `action`. The reducer will always return a new state
// based on these two args. We'll use this with React's 'userReducer'
// hook in App() component. The reducer's 'action' is always associated
// with a type and as a best practice, a payload. It returns a new state
// if the type matches a condition in the reducer, otherwise we throw an
// error to remind us that the implementation isn't covered.
const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
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
  const [searchTerm, setSearchTerm] = useStorageState("search", "React");

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const handleFetchStories = React.useCallback(async () => {
    // use async
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get(url); // await the async and handle callbacks
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories(); // C
  }, [handleFetchStories]); // D

  // handleRemoveStory is an event handler that enables removing a story from the list.
  const handleRemoveStory = (item: Story) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    // preventDefault() and the <button> below allows us to "Enter" key.
    event.preventDefault();
  };

  // Create a new filtered array. If the search term matches the condition,
  // it stays in the newly created array.
  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Style the attribute with css. We remove the `<hr />` because CSS handles the border.
    <div className="container">
      <h1 className="headline-primary">My Hacker Stories</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {stories.isError && <p>Something went wrong...</p>}

      {/*Using a 'ternary operator' to determine whether feedback is rendered or not.*/}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm: React.FC<SearchFormProps> = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <form onSubmit={onSearchSubmit}>
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
      className="button button_large"
    >
      Submit
    </button>
  </form>
);

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: React.ReactNode;
};

const InputWithLabel: React.FC<InputWithLabelProps> = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      {/*// className can also be passed as a prop to React components.*/}
      <label htmlFor={id} className="label">
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
        className="input"
      />
    </>
  );
};

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};

// List demonstrates the use of a secondary React component.
// const List = ({list, onRemoveItem}) => (
const List: React.FC<ListProps> = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </ul>
);

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

const Item: React.FC<ItemProps> = ({ item, onRemoveItem }) => (
  // *** NOTE that the return item type is inferred. To be explicit:
  // .... ({ item, onRemoveItem }): JSX.Element => ( ....
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button
        type="button"
        onClick={() => onRemoveItem(item)}
        className="button button_small"
      >
        <Check height="18x" width="18px" />
      </button>
    </span>
  </li>
);

// Another way to do it with the `ItemProps` above:
/*
const Item = ({ item, onRemoveItem }: ItemProps) => (
*/

// A very verbose way to implement `item` with TS
// We mitigate this by defining the `story` type on top of file.
/*const Item = ({
    item,
    onRemoveItem
}: {
    item: {
        objectID: string;
        url: string;
        title: string;
        author: string;
        num_comments: number;
        points: number;
    };
    onRemoveItem: (item: {
        objectID: string;
        url: string;
        title: string;
        author: string;
        num_comments: number;
        points: number;
    }) => void;
}) => (
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
);*/
export default App;
