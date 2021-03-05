# List Users - Custom Search Handler

Search github users e.g. https://api.github.com/search/users?q=test

1. Save the search value in a state
1. Provide a prop `searchValue` pointing to your state variable
1. Provide a prop `onSearchChange` to a function that is called with the new search value
1. Update the state, which triggers a render of your component
1. Provide a prop `reloadKey` equal to the search value to let the `ItemsList` component know that once there is a change in the reload key it should make a call to `itemsListMethod`
1. Optionally you can change URLs in your own way if required (e.g. update the url to `https://www.myapp.com/search/searchValue`)

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'
import { Route, BrowserRouter } from 'react-router-dom'
import axios from 'axios'

export default class App extends React.Component {
    render() {
        return <BrowserRouter>
            <Route exact path='/' component={ListUsers}></Route>
        </BrowserRouter>
    }
}

class ListUsers extends React.Component {
    state = {
        searchValue: "test"
    }
    columns = [
        {
            title: 'User Id',
            dataIndex: 'login'
        }
    ]
    
    render() {
        return <div style={{ padding: "20px" }}>
            <ItemsList
                tableTitle="Search GitHub Users"
                itemsListMethod={this.getItems}
                columns={this.columns}
                searchValue={this.state.searchValue}
                onSearchChange={this.handleSearch}
                reloadKey={this.state.searchValue}
            />
        </div>
    }

    getItems = (search, page, pageSize) => {
        if (!search) {
            search = 'test'
        }
        console.log('get items', search)
        return axios.get(`https://api.github.com/search/users?q=${search}`)
    }

    handleSearch = (searchValue) => {
        this.setState({searchValue: searchValue})
    }
}
```

You can use custom routes to maintain the state across browser reloads. For example

1. Add a Route with `/search/:search`
1. In the `handleSearch` push a new URL using (props.history.push) the search value
1. In the `ItemsList` component read from the URL

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'
import { Route, BrowserRouter } from 'react-router-dom'
import axios from 'axios'

export default class App extends React.Component {
    render() {
        return <BrowserRouter>
            <Route exact path='/' component={ListUsers}></Route>
            <Route exact path='/search/:search' component={ListUsers}></Route>
        </BrowserRouter>
    }
}

class ListUsers extends React.Component {
    columns = [
        {
            title: 'User Id',
            dataIndex: 'login'
        }
    ]
    
    render() {
        return <div style={{ padding: "20px" }}>
            <ItemsList
                tableTitle="Search GitHub Users"
                itemsListMethod={this.getItems}
                columns={this.columns}
                searchValue={this.props.match.params.search}
                onSearchChange={this.handleSearch}
            />
        </div>
    }

    getItems = (search, page, pageSize) => {
        if (!search) {
            search = 'test'
        }
        console.log('get items', search)
        return axios.get(`https://api.github.com/search/users?q=${search}`)
    }

    handleSearch = (searchValue) => {
        this.props.history.push(`/search/${searchValue}`)
    }
}
```